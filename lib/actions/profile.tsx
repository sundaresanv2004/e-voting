"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { logUserAction } from "@/lib/auth/audit"
import { AuditStatus } from "@prisma/client"
import { z } from "zod"
import { sendEmail } from "@/lib/email"
import PasswordResetSuccessEmail from "@/emails/PasswordResetSuccessEmail"
import OrgLeftEmail from "@/emails/OrgLeftEmail"
import AccountDeletedEmail from "@/emails/AccountDeletedEmail"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(100, "Name is too long."),
})

const PasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password cannot be the same as the current password.",
    path: ["newPassword"],
  })

// ─── Update Name ──────────────────────────────────────────────────────────────

export async function updateUserNameAction(name: string) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { error: "Unauthorized" }

  const parsed = ProfileSchema.safeParse({ name })
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.name?.[0] || "Invalid name" }
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        authVersion: { increment: 1 },
      },
    })

    await db.userAuditLog.create({
      data: {
        userId: session.user.id,
        email: session.user.email,
        action: "Profile Name Updated",
        status: AuditStatus.SUCCESS,
        metadata: { name: parsed.data.name },
      },
    })

    revalidatePath("/user/profile")
    return { success: "Profile updated successfully." }
  } catch (error) {
    console.error("[UPDATE_USER_NAME]", error)
    return { error: "Failed to update profile. Please try again." }
  }
}

// ─── Update Avatar ────────────────────────────────────────────────────────────

export async function updateUserAvatarAction(image: string | null) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        image,
        authVersion: { increment: 1 },
      },
    })

    await db.userAuditLog.create({
      data: {
        userId: session.user.id,
        email: session.user.email,
        action: image ? "Profile Picture Updated" : "Profile Picture Removed",
        status: AuditStatus.SUCCESS,
      },
    })

    revalidatePath("/user/profile")
    return { success: image ? "Profile picture updated." : "Profile picture removed." }
  } catch (error) {
    console.error("[UPDATE_USER_AVATAR]", error)
    return { error: "Failed to update profile picture. Please try again." }
  }
}

// ─── Change Password ──────────────────────────────────────────────────────────

export async function changePasswordAction(values: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { error: "Unauthorized" }

  const parsed = PasswordSchema.safeParse(values)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    return {
      error:
        errors.newPassword?.[0] ||
        errors.confirmPassword?.[0] ||
        errors.currentPassword?.[0] ||
        "Invalid password data",
    }
  }

  try {
    // Use Better Auth's built-in changePassword endpoint
    const response = await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    })

    await db.userAuditLog.create({
      data: {
        userId: session.user.id,
        email: session.user.email,
        action: "Change Password",
        status: AuditStatus.SUCCESS,
      },
    })

    await sendEmail({
      to: session.user.email,
      subject: "Your password has been changed – e-voting",
      react: <PasswordResetSuccessEmail userName={session.user.name} />,
    })

    return { success: "Password changed successfully." }
  } catch (error: any) {
    console.error("[CHANGE_PASSWORD]", error)
    const code: string = error?.body?.code || error?.code || ""
    const message: string = error?.body?.message || error?.message || ""

    // OAuth-only user — no credential account exists
    if (code === "CREDENTIAL_ACCOUNT_NOT_FOUND") {
      return {
        error:
          "Your account uses a social login (Google, GitHub, etc.) and does not have a password. Password changes are not available.",
      }
    }

    if (
      message.toLowerCase().includes("incorrect") ||
      message.toLowerCase().includes("invalid") ||
      code === "INVALID_PASSWORD"
    ) {
      return { error: "Incorrect current password." }
    }

    return { error: "Failed to change password. Please try again." }
  }
}

// ─── Leave Organization ────────────────────────────────────────────────────────

export async function leaveOrganizationAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    // Check if the user is in any organization based on DB
    const member = await db.member.findFirst({
      where: { userId: session.user.id },
      include: { organization: true }
    })

    if (!member || !member.organization) {
      return { error: "You are not part of any organization." }
    }

    const org = member.organization
    const activeOrgId = org.id

    if (org.ownerId === session.user.id) {
      return {
        error:
          "You are the owner of this organization. Please transfer ownership before leaving.",
      }
    }

    // Delete the member record (removes the user from the org)
    await db.member.deleteMany({
      where: {
        userId: session.user.id,
        organizationId: activeOrgId,
      },
    })

    await db.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        organizationId: activeOrgId,
        action: "MEMBER_LEFT",
        entityType: "MEMBER",
        entityId: activeOrgId,
        status: AuditStatus.SUCCESS,
        description: `User ${session.user.email} left the organization ${org.name}`,
      },
    })

    await sendEmail({
      to: session.user.email,
      subject: `You have left ${org.name} – e-voting`,
      react: <OrgLeftEmail userName={session.user.name} orgName={org.name} />,
    })

    return { success: "You have left the organization." }
  } catch (error) {
    console.error("[LEAVE_ORG]", error)
    return { error: "Failed to leave organization. Please try again." }
  }
}

// ─── Delete Account ────────────────────────────────────────────────────────────

export async function deleteAccountAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    // Block if user owns any organization
    const ownedOrg = await db.organization.findFirst({
      where: { ownerId: session.user.id },
      select: { name: true },
    })

    if (ownedOrg) {
      return {
        error: `You own the organization "${ownedOrg.name}". Please transfer ownership or delete it before deleting your account.`,
      }
    }

    // Log before deletion (can't do it after since user is gone)
    await db.userAuditLog.create({
      data: {
        userId: session.user.id,
        email: session.user.email,
        action: "Account Deleted",
        status: AuditStatus.SUCCESS,
        reason: "User requested account deletion",
      },
    })

    await db.user.delete({ where: { id: session.user.id } })

    await sendEmail({
      to: session.user.email,
      subject: "Your account has been deleted – e-voting",
      react: <AccountDeletedEmail userName={session.user.name} />,
    })

    return { success: "Account deleted successfully." }
  } catch (error) {
    console.error("[DELETE_ACCOUNT]", error)
    return { error: "Failed to delete account. Please try again." }
  }
}

// ─── Check Org Ownership ───────────────────────────────────────────────────────

export async function getProfileDataAction() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      twoFactorEnabled: true,
      members: {
        take: 1,
        include: { organization: { select: { id: true, name: true, ownerId: true } } },
      },
      accounts: {
        select: { providerId: true },
      },
    },
  })

  if (!user) return null

  const member = user.members[0]
  const isOrgOwner = member?.organization?.ownerId === user.id
  const hasPasswordAccount = user.accounts.some((a) => a.providerId === "credential")

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    twoFactorEnabled: user.twoFactorEnabled,
    organization: member?.organization ?? null,
    isOrgOwner,
    hasPasswordAccount,
  }
}
