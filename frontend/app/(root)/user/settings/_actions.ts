"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ProfileSchema, SecuritySchema } from "@/lib/schemas/user"
import bcrypt from "bcryptjs"
import { AuditStatus, AuditEntityType } from "@prisma/client"
import { headers } from "next/headers"

export async function updateUserProfileAction(name: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  const validatedFields = ProfileSchema.safeParse({ name })

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors.name?.[0] || "Invalid name" }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { name: validatedFields.data.name }
  })

  const headerList = await headers()
  const ip = headerList.get("x-forwarded-for") || "unknown"

  await db.userAuditLog.create({
    data: {
      userId: session.user.id,
      email: session.user.email!,
      action: "PROFILE_UPDATE",
      status: AuditStatus.SUCCESS,
      ipAddress: ip,
      metadata: { name: validatedFields.data.name }
    }
  })

  revalidatePath("/user/settings")
  return { success: "Profile updated successfully" }
}

export async function updateUserImageAction(image: string | null) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { image }
  })

  const headerList = await headers()
  const ip = headerList.get("x-forwarded-for") || "unknown"

  await db.userAuditLog.create({
    data: {
      userId: session.user.id,
      email: session.user.email!,
      action: "PROFILE_IMAGE_UPDATE",
      status: AuditStatus.SUCCESS,
      ipAddress: ip
    }
  })

  revalidatePath("/user/settings")
  return { success: "Profile picture updated" }
}

export async function updatePasswordAction(values: any) {
    const session = await auth()
  
    if (!session?.user?.id) {
      return { error: "Unauthorized" }
    }
  
    const validatedFields = SecuritySchema.safeParse(values)
  
    if (!validatedFields.success) {
      const error = validatedFields.error.flatten().fieldErrors
      return { 
        error: error.newPassword?.[0] || error.confirmPassword?.[0] || error.currentPassword?.[0] || "Invalid password data" 
      }
    }
  
    const { currentPassword, newPassword } = validatedFields.data

    if (currentPassword === newPassword) {
      return { error: "New password cannot be the same as the current password" }
    }
  
    // In a real app, verify current password first
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })
  
    if (!user) {
      return { error: "User not found" }
    }
  
    if (!user.password) {
      return { error: "Incorrect current password" }
    }
  
    const passwordsMatch = await bcrypt.compare(currentPassword, user.password)
  
    if (!passwordsMatch) {
      return { error: "Incorrect current password" }
    }
  
    const hashedPassword = await bcrypt.hash(newPassword, 10)
  
    await db.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword }
    })
  
    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"

    await db.userAuditLog.create({
      data: {
        userId: session.user.id,
        email: session.user.email!,
        action: "PASSWORD_CHANGE",
        status: AuditStatus.SUCCESS,
        ipAddress: ip
      }
    })

    revalidatePath("/user/settings")
    return { success: "Password updated successfully" }
}

export async function deleteAccountAction() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // Check if user owns any organization
    const ownedOrg = await db.organization.findFirst({
      where: { ownerId: session.user.id }
    })

    if (ownedOrg) {
      return { error: "You are an organization owner. Please transfer ownership or delete the organization first." }
    }

    await db.user.delete({
      where: { id: session.user.id }
    })

    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"

    await db.userAuditLog.create({
      data: {
        email: session.user.email!,
        action: "ACCOUNT_DELETE",
        status: AuditStatus.SUCCESS,
        ipAddress: ip,
        reason: "User requested account deletion"
      }
    })
    
    return { success: "Account deleted successfully" }
  } catch (error) {
    console.error("Delete account error:", error)
    return { error: "Failed to delete account. Please ensure all related data is removed first." }
  }
}

export async function leaveOrganizationAction() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    // Check if user is the owner of their current organization
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true }
    })

    if (user?.organizationId) {
      const organization = await db.organization.findUnique({
        where: { id: user.organizationId },
        select: { ownerId: true }
      })

      if (organization?.ownerId === session.user.id) {
        return { error: "Organization owners cannot leave. Please transfer ownership first." }
      }
    }

    if (!user || !user.organizationId) {
        return { error: "User or organization not found" }
    }

    await db.user.update({
      where: { id: session.user.id },
      data: { 
        organizationId: null,
        role: "USER"
      }
    })

    const headerList = await headers()
    const ip = headerList.get("x-forwarded-for") || "unknown"

    await db.adminAuditLog.create({
      data: {
        adminId: session.user.id,
        organizationId: user.organizationId,
        action: "MEMBER_LEFT",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: user.organizationId,
        status: AuditStatus.SUCCESS,
        ipAddress: ip,
        description: `User ${session.user.email} left the organization`
      }
    })
    
    return { success: "Left organization successfully" }
  } catch (error) {
    console.error("Leave organization error:", error)
    return { error: "Failed to leave organization." }
  }
}

export async function checkOrganizationOwnershipAction() {
  const session = await auth()

  if (!session?.user?.organizationId || !session?.user?.id) {
    return { isOwner: false }
  }

  const organization = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { ownerId: true }
  })

  return { isOwner: organization?.ownerId === session.user.id }
}
