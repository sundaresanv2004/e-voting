"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { AuditEntityType, AuditStatus, OrganizationType } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"

async function getActiveOrgId(session: any) {
  if (session?.session?.activeOrganizationId) return session.session.activeOrganizationId;
  if (!session?.user?.id) return null;
  const member = await db.member.findFirst({ where: { userId: session.user.id } });
  return member?.organizationId || null;
}
/**
 * Gets the current active organization data
 */
export async function getOrganizationData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return null
  const orgId = await getActiveOrgId(session)
  if (!orgId) return null

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    include: {
      settings: true
    }
  })

  // If settings don't exist for some reason, create them
  if (organization && !organization.settings) {
    const settings = await db.organizationSettings.create({
      data: {
        organizationId: orgId,
        createdByUserId: session.user.id,
        updatedByUserId: session.user.id
      }
    })
    organization.settings = settings
  }

  return organization
}

/**
 * Updates the organization profile details
 */
export async function updateOrganizationProfile(
  name: string,
  type: OrganizationType,
  logo?: string
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized" }
  const orgId = await getActiveOrgId(session)
  if (!orgId) return { success: false, error: "No active organization" }

  const adminId = session.user.id

  try {
    const result = await db.$transaction(async (tx) => {
      const oldOrg = await tx.organization.findUnique({
        where: { id: orgId },
        select: { name: true, type: true, logo: true }
      })

      const organization = await tx.organization.update({
        where: { id: orgId },
        data: {
          name,
          type,
          logo: logo || null,
          updatedByUserId: adminId
        }
      })

      // Log Update
      await logAdminAction({
        action: "ORGANIZATION_UPDATED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: orgId,
        adminId: adminId,
        organizationId: orgId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { 
          before: oldOrg, 
          after: { name, type, logo } 
        }
      })

      return organization
    })

    revalidatePath("/organisation/settings")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_ORGANIZATION_ACTION]", error)
    try {
      await logAdminAction({
        action: "ORGANIZATION_UPDATED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: orgId,
        adminId,
        organizationId: orgId,
        status: AuditStatus.FAILURE,
        metadata: { name, type, error: error?.message || "Unknown error" }
      })
    } catch (e) {}
    return { success: false, error: "Failed to update organization profile" }
  }
}

/**
 * Gets members of the organization to populate the Transfer Ownership dropdown
 */
export async function getOrganizationMembersAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized" }
  const orgId = await getActiveOrgId(session)
  if (!orgId) return { success: false, error: "No active organization" }
  const userId = session.user.id

  try {
    // Fetch all members of the organization except the current user
    const members = await db.member.findMany({
      where: {
        organizationId: orgId,
        NOT: { userId: userId }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    const data = members.map(m => ({
      memberId: m.id, // Better Auth Member ID
      userId: m.user.id, // Actual User ID
      name: m.user.name,
      email: m.user.email,
      image: m.user.image,
    }))

    return { success: true, data }
  } catch (error) {
    console.error("[GET_MEMBERS_FOR_TRANSFER]", error)
    return { success: false, error: "Failed to fetch members" }
  }
}

/**
 * Transfers ownership of the organization to a different member.
 */
export async function transferOwnershipAction(newOwnerMemberId: string, newOwnerUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized" }
  const currentUserId = session.user.id
  const orgId = await getActiveOrgId(session)
  if (!orgId) return { success: false, error: "No active organization" }

  try {
    // 1. Verify current user is the owner
    const organization = await db.organization.findUnique({
      where: { id: orgId },
      select: { ownerId: true, name: true }
    })

    if (!organization) return { success: false, error: "Organization not found." }

    // If the Better Auth org owner isn't the current user
    const currentMember = await db.member.findFirst({
      where: { userId: currentUserId, organizationId: orgId }
    })

    if (!currentMember || currentMember.role !== "owner") {
      return { success: false, error: "Only the organization owner can transfer ownership." }
    }

    // 2. Transfer ownership via Better Auth explicitly
    // Better Auth will demote the current owner to admin automatically when a new owner is assigned
    const updateRes = await auth.api.updateMemberRole({
      headers: await headers(),
      body: {
        memberId: newOwnerMemberId,
        role: "owner"
      }
    })

    if (!updateRes) {
      return { success: false, error: "Failed to transfer ownership via Better Auth." }
    }

    // 3. Update the custom fields via Prisma transaction
    await db.$transaction(async (tx) => {
      await tx.organization.update({
        where: { id: orgId },
        data: { ownerId: newOwnerUserId }
      })

      await tx.user.update({
        where: { id: newOwnerUserId },
        data: {
          role: "org_admin", // Ensure they get org_admin custom role
          hasAllElectionsAccess: true
        }
      })

      // Log the transfer
      await logAdminAction({
        action: "OWNERSHIP_TRANSFERRED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: orgId,
        adminId: currentUserId,
        organizationId: orgId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { 
          previousOwnerId: currentUserId,
          newOwnerUserId: newOwnerUserId
        }
      })
    })

    revalidatePath("/organisation/settings")
    return { success: true }
  } catch (error: any) {
    console.error("[TRANSFER_OWNERSHIP_ACTION]", error)
    try {
      await logAdminAction({
        action: "OWNERSHIP_TRANSFERRED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: orgId,
        adminId: currentUserId,
        organizationId: orgId,
        status: AuditStatus.FAILURE,
        metadata: { newOwnerUserId, error: error?.message || "Unknown error" }
      })
    } catch (e) {}
    return { success: false, error: error.message || "Failed to transfer ownership" }
  }
}

export async function updateOrganizationSettingsAction(data: {
  maxElections: number
  maxMembers: number
  allowCustomBranding: boolean
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return { success: false, error: "Unauthorized" }
  const adminId = session.user.id
  const orgId = await getActiveOrgId(session)
  if (!orgId) return { success: false, error: "No active organization" }

  try {
    await db.$transaction(async (tx) => {
      const oldSettings = await tx.organizationSettings.findUnique({
        where: { organizationId: orgId },
      })

      await tx.organizationSettings.update({
        where: { organizationId: orgId },
        data: {
          maxElections: data.maxElections,
          maxMembers: data.maxMembers,
          allowCustomBranding: data.allowCustomBranding,
          updatedByUserId: adminId
        }
      })

      await logAdminAction({
        action: "ORG_SETTINGS_UPDATED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: orgId,
        adminId: adminId,
        organizationId: orgId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { 
          before: oldSettings, 
          after: data 
        }
      })
    })

    revalidatePath("/organisation/settings")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_ORG_SETTINGS_ACTION]", error)
    try {
      await logAdminAction({
        action: "ORG_SETTINGS_UPDATED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: orgId,
        adminId: adminId,
        organizationId: orgId,
        status: AuditStatus.FAILURE,
        metadata: { data, error: error?.message || "Unknown error" }
      })
    } catch (e) {}
    return { success: false, error: "Failed to update organization settings" }
  }
}

export async function logOrgCodeRevealed() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) return { success: false }
  
  const orgId = await getActiveOrgId(session)
  if (!orgId) return { success: false }

  try {
    await logAdminAction({
      action: "ORG_CODE_REVEALED",
      entityType: AuditEntityType.SECURITY,
      entityId: orgId,
      adminId: session.user.id,
      organizationId: orgId,
      status: AuditStatus.SUCCESS,
      metadata: { source: "settings_page" },
    })
    return { success: true }
  } catch (error) {
    console.error("[LOG_ORG_CODE_REVEALED]", error)
    return { success: false }
  }
}

export async function logOrgCodeCopied() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) return { success: false }
  
  const orgId = await getActiveOrgId(session)
  if (!orgId) return { success: false }

  try {
    await logAdminAction({
      action: "ORG_CODE_COPIED",
      entityType: AuditEntityType.SECURITY,
      entityId: orgId,
      adminId: session.user.id,
      organizationId: orgId,
      status: AuditStatus.SUCCESS,
      metadata: { source: "settings_page" },
    })
    return { success: true }
  } catch (error) {
    console.error("[LOG_ORG_CODE_COPIED]", error)
    return { success: false }
  }
}
