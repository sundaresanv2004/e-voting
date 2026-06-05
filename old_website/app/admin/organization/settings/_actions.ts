"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole, OrganizationType, AuditEntityType, AuditStatus } from "@prisma/client"
import { sendOwnershipTransferredEmail } from "@/lib/mail"
import { requireOrgAdmin, requireOrganizationOwner } from "@/lib/authz"

export async function getOrganizationData() {
  const session = await auth()

  let access
  try {
    access = await requireOrgAdmin(session?.user)
  } catch {
    return null
  }

  const orgId = access.organizationId

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
        createdByUserId: access.userId,
        updatedByUserId: access.userId
      }
    })
    organization.settings = settings
  }

  return organization
}

export async function updateOrganizationAction(
  name: string,
  type: OrganizationType,
  logo?: string
) {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  const adminId = access.userId
  const orgId = access.organizationId

  try {
    const result = await db.$transaction(async (tx) => {
      const oldOrg = await tx.organization.findUnique({
        where: { id: orgId },
        select: { name: true, type: true, logo: true, isActive: true }
      })

      const organization = await tx.organization.update({
        where: { id: orgId },
        data: {
          name,
          type,
          logo: logo || null,
          updatedByUserId: adminId!
        }
      })

      // Log Update
      await tx.adminAuditLog.create({
        data: {
          action: "ORGANIZATION_UPDATED",
          entityType: AuditEntityType.ORGANIZATION,
          entityId: orgId,
          adminId: adminId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { 
            before: oldOrg, 
            after: { name, type, logo, isActive: organization.isActive } 
          }
        }
      })

      // Log Deactivation if isActive changed from true to false
      if (oldOrg?.isActive && !organization.isActive) {
        await tx.adminAuditLog.create({
          data: {
            action: "ORGANIZATION_DEACTIVATED",
            entityType: AuditEntityType.ORGANIZATION,
            entityId: orgId,
            adminId: adminId!,
            organizationId: orgId!,
            status: AuditStatus.SUCCESS,
            metadata: { name: organization.name, code: organization.code }
          }
        })
      }

      return organization
    })

    revalidatePath("/admin/organization/settings")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_ORGANIZATION_ACTION]", error)
    return { success: false, error: "Failed to update organization profile" }
  }
}

export async function updateOrganizationSettingsAction(data: {
  allowSystemConnection: boolean
  maxSystems: number | null
}) {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  const adminId = access.userId
  const orgId = access.organizationId

  try {
    await db.$transaction(async (tx) => {
      const oldSettings = await tx.organizationSettings.findUnique({
        where: { organizationId: orgId },
        select: { allowSystemConnection: true, maxSystems: true }
      })

      await tx.organizationSettings.update({
        where: { organizationId: orgId },
        data: {
          allowSystemConnection: data.allowSystemConnection,
          maxSystems: data.maxSystems,
          updatedByUserId: adminId!
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "ORG_SETTINGS_UPDATED",
          entityType: AuditEntityType.ORGANIZATION,
          entityId: orgId,
          adminId: adminId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { 
            before: oldSettings, 
            after: { allowSystemConnection: data.allowSystemConnection, maxSystems: data.maxSystems } 
          }
        }
      })
    })

    revalidatePath("/admin/organization/settings")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_ORG_SETTINGS_ACTION]", error)
    return { success: false, error: "Failed to update organization settings" }
  }
}

export async function deleteOrganizationAction() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  const orgId = access.organizationId

  try {
    await db.$transaction(async (tx) => {
      const organization = await tx.organization.findUnique({
        where: { id: orgId },
        select: { name: true, code: true }
      })

      if (!organization) throw new Error("Organization not found")

      await tx.user.updateMany({
        where: { organizationId: orgId },
        data: {
          organizationId: null,
          role: UserRole.USER,
          isActive: true,
          hasAllElectionsAccess: false,
          authVersion: { increment: 1 },
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "ORGANIZATION_DELETED",
          entityType: AuditEntityType.ORGANIZATION,
          entityId: orgId,
          adminId: access.userId,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { name: organization.name, code: organization.code }
        }
      })

      await tx.organization.delete({
        where: { id: orgId }
      })
    })

    revalidatePath("/")
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_ORGANIZATION_ACTION]", error)
    return { success: false, error: "Failed to delete organization. Please try again later." }
  }
}

export async function getOrganizationMembersAction() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  const orgId = access.organizationId
  const userId = access.userId

  // Fetch all members of the organization except the current user
  const members = await db.user.findMany({
    where: {
      organizationId: orgId,
      NOT: { id: userId }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true
    }
  })

  return { success: true, data: members }
}

export async function logOrgCodeRevealed() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  try {
    await db.adminAuditLog.create({
      data: {
        action: "ORG_CODE_REVEALED",
        entityType: AuditEntityType.SECURITY,
        entityId: access.organizationId,
        adminId: access.userId,
        organizationId: access.organizationId,
        status: AuditStatus.SUCCESS,
        metadata: { source: "settings_page" },
      },
    })
    return { success: true }
  } catch (error) {
    console.error("[LOG_ORG_CODE_REVEALED]", error)
    return { success: false }
  }
}

export async function logOrgCodeCopied() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  try {
    await db.adminAuditLog.create({
      data: {
        action: "ORG_CODE_COPIED",
        entityType: AuditEntityType.SECURITY,
        entityId: access.organizationId,
        adminId: access.userId,
        organizationId: access.organizationId,
        status: AuditStatus.SUCCESS,
        metadata: { source: "settings_page" },
      },
    })
    return { success: true }
  } catch (error) {
    console.error("[LOG_ORG_CODE_COPIED]", error)
    return { success: false }
  }
}

export async function logOrgLogoUploaded() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  try {
    await db.adminAuditLog.create({
      data: {
        action: "ORG_LOGO_UPLOADED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: access.organizationId,
        adminId: access.userId,
        organizationId: access.organizationId,
        status: AuditStatus.SUCCESS,
        metadata: { source: "settings_page" },
      },
    })
    return { success: true }
  } catch (error) {
    console.error("[LOG_ORG_LOGO_UPLOADED]", error)
    return { success: false }
  }
}

export async function logOrgLogoRemoved() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  try {
    await db.adminAuditLog.create({
      data: {
        action: "ORG_LOGO_REMOVED",
        entityType: AuditEntityType.ORGANIZATION,
        entityId: access.organizationId,
        adminId: access.userId,
        organizationId: access.organizationId,
        status: AuditStatus.SUCCESS,
        metadata: { source: "settings_page" },
      },
    })
    return { success: true }
  } catch (error) {
    console.error("[LOG_ORG_LOGO_REMOVED]", error)
    return { success: false }
  }
}

export async function transferOwnershipAction(newOwnerId: string) {
  const session = await auth()
  const access = await requireOrganizationOwner(session?.user)
  const orgId = access.organizationId
  const currentUserId = access.userId

  try {
    const result = await db.$transaction(async (tx) => {
      // 1. Verify current user is the owner
      const organization = await tx.organization.findUnique({
        where: { id: orgId },
        select: { ownerId: true, name: true }
      })

      if (!organization) {
        throw new Error("Organization not found.")
      }

      const newOwner = await tx.user.findFirst({
        where: { id: newOwnerId, organizationId: orgId },
        select: { name: true, email: true }
      })

      if (!newOwner) {
        throw new Error("New owner must be an existing member of this organization.")
      }

      // 2. Perform the transfer
      await tx.organization.update({
        where: { id: orgId },
        data: { ownerId: newOwnerId }
      })

      await tx.user.update({
        where: { id: newOwnerId },
        data: {
          role: UserRole.ORG_ADMIN,
          authVersion: { increment: 1 },
        }
      })

      // 3. Log the transfer
      await tx.adminAuditLog.create({
        data: {
          action: "OWNERSHIP_TRANSFERRED",
          entityType: AuditEntityType.ORGANIZATION,
          entityId: orgId,
          adminId: currentUserId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { 
            previousOwnerId: currentUserId,
            newOwnerId: newOwnerId,
            newOwnerName: newOwner?.name,
            newOwnerEmail: newOwner?.email
          }
        }
      })

      return { 
        success: true, 
        newOwnerEmail: newOwner?.email, 
        newOwnerName: newOwner?.name, 
        orgName: organization.name,
        previousOwnerName: access.name || "Previous Owner",
        previousOwnerEmail: access.email
      }
    })

    if (result.success) {
      await sendOwnershipTransferredEmail(
        result.newOwnerEmail!,
        result.newOwnerName!,
        result.orgName!,
        result.previousOwnerName!,
        result.previousOwnerEmail!
      )
    }

    revalidatePath("/admin/organization/settings")
    return result
  } catch (error: any) {
    console.error("[TRANSFER_OWNERSHIP_ACTION]", error)
    return { success: false, error: error.message || "Failed to transfer ownership" }
  }
}
