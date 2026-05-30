"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { AuditEntityType, AuditStatus, OrganizationType } from "@prisma/client"
import { logAdminAction } from "@/lib/auth/audit"
import { requireOrgActionContext } from "@/lib/auth/access"
import { OrganizationSchema, OrganizationSettingsSchema } from "@/lib/schemas/org"
/**
 * Gets the current active organization data
 */
export async function getOrganizationData() {
  try {
    const { userId, organizationId: orgId } = await requireOrgActionContext({
      action: "ORGANIZATION_DATA_VIEWED",
      entityType: AuditEntityType.ORGANIZATION,
    })

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
          createdByUserId: userId,
          updatedByUserId: userId
        }
      })
      organization.settings = settings
    }

    return organization
  } catch (error) {
    console.error("[GET_ORGANIZATION_DATA]", error)
    return null
  }
}

/**
 * Updates the organization profile details
 */
export async function updateOrganizationProfile(
  name: string,
  type: OrganizationType,
  logo?: string
) {
  let adminId: string | null = null
  let orgId: string | null = null

  try {
    const parsed = OrganizationSchema.safeParse({ name, type, logo: logo ?? "" })
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors.name?.[0] || "Invalid organization profile" }
    }

    const access = await requireOrgActionContext({
      action: "ORGANIZATION_UPDATED",
      entityType: AuditEntityType.ORGANIZATION,
    })
    adminId = access.userId
    orgId = access.organizationId
    const organizationId = access.organizationId
    const values = parsed.data

    await db.$transaction(async (tx) => {
      const oldOrg = await tx.organization.findUnique({
        where: { id: organizationId },
        select: { name: true, type: true, logo: true }
      })

      const organization = await tx.organization.update({
        where: { id: organizationId },
        data: {
          name: values.name,
          type: values.type,
          logo: values.logo || null,
          updatedByUserId: adminId
        }
      })

      // Log Update
      await logAdminAction({
        action: "ORGANIZATION_UPDATED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: organizationId,
        adminId: adminId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { 
          before: oldOrg, 
          after: { name: values.name, type: values.type, logo: values.logo || null } 
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
  try {
    const { userId, organizationId: orgId } = await requireOrgActionContext({
      action: "OWNERSHIP_TRANSFER_MEMBERS_LISTED",
      entityType: AuditEntityType.MEMBER,
    })

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
  let currentUserId: string | null = null
  let orgId: string | null = null

  try {
    const access = await requireOrgActionContext({
      action: "OWNERSHIP_TRANSFERRED",
      entityType: AuditEntityType.ORGANIZATION,
    })
    currentUserId = access.userId
    orgId = access.organizationId
    const organizationId = access.organizationId

    // 1. Verify current user is the owner
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { ownerId: true, name: true }
    })

    if (!organization) return { success: false, error: "Organization not found." }

    if (organization.ownerId !== currentUserId) {
      return { success: false, error: "Only the organization owner can transfer ownership." }
    }

    const newOwnerMember = await db.member.findFirst({
      where: {
        id: newOwnerMemberId,
        userId: newOwnerUserId,
        organizationId,
      },
    })

    if (!newOwnerMember) {
      return { success: false, error: "New owner must be a member of this organization." }
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
        where: { id: organizationId },
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
        entityId: organizationId,
        adminId: currentUserId,
        organizationId,
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
  let adminId: string | null = null
  let orgId: string | null = null

  try {
    const parsed = OrganizationSettingsSchema.safeParse(data)
    if (!parsed.success) return { success: false, error: "Invalid organization settings" }

    const access = await requireOrgActionContext({
      action: "ORG_SETTINGS_UPDATED",
      entityType: AuditEntityType.SETTINGS,
    })
    adminId = access.userId
    orgId = access.organizationId
    const organizationId = access.organizationId
    const values = parsed.data

    await db.$transaction(async (tx) => {
      const oldSettings = await tx.organizationSettings.findUnique({
        where: { organizationId },
      })

      await tx.organizationSettings.update({
        where: { organizationId },
        data: {
          maxElections: values.maxElections,
          maxMembers: values.maxMembers,
          allowCustomBranding: values.allowCustomBranding,
          updatedByUserId: adminId
        }
      })

      await logAdminAction({
        action: "ORG_SETTINGS_UPDATED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: organizationId,
        adminId: adminId,
        organizationId,
        status: AuditStatus.SUCCESS,
        tx,
        metadata: { 
          before: oldSettings, 
          after: values 
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
  try {
    const { userId, organizationId: orgId } = await requireOrgActionContext({
      action: "ORG_CODE_REVEALED",
      entityType: AuditEntityType.SECURITY,
    })

    await logAdminAction({
      action: "ORG_CODE_REVEALED",
      entityType: AuditEntityType.SECURITY,
      entityId: orgId,
      adminId: userId,
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
  try {
    const { userId, organizationId: orgId } = await requireOrgActionContext({
      action: "ORG_CODE_COPIED",
      entityType: AuditEntityType.SECURITY,
    })

    await logAdminAction({
      action: "ORG_CODE_COPIED",
      entityType: AuditEntityType.SECURITY,
      entityId: orgId,
      adminId: userId,
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
