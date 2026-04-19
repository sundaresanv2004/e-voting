"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { SystemStatus, UserRole, AuditEntityType, AuditStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { addDays, addMinutes } from "date-fns"
import { sendSystemApprovedEmail, sendSystemExpiredEmail } from "@/lib/mail"

export async function updateSystemStatusAction(
  systemId: string,
  status: SystemStatus
) {
  const session = await auth()
  const userId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  try {
    const result = await db.$transaction(async (tx) => {
      const oldSystem = await tx.authorizedSystem.findUnique({
        where: { id: systemId, organizationId: orgId },
        select: { status: true, name: true, secretTokenHash: true }
      })

      if (!oldSystem) throw new Error("System not found")

      const updateData: any = {
        status,
        updatedByUserId: userId,
      }

      let secretGenerated = false
      if (status === SystemStatus.APPROVED) {
        updateData.approvedByUserId = userId
        updateData.approvedAt = new Date()

        // Generate or refresh token with 30-day expiry
        if (!oldSystem.secretTokenHash) {
          updateData.secretTokenHash = crypto.randomUUID()
          secretGenerated = true
        }
        updateData.tokenExpiresAt = addDays(new Date(), 15)
      } else if (status === SystemStatus.REVOKED || status === SystemStatus.REJECTED) {
        // Clear token on revocation
        updateData.secretTokenHash = null
        updateData.tokenExpiresAt = null
      }

      const system = await tx.authorizedSystem.update({
        where: {
          id: systemId,
          organizationId: orgId
        },
        data: updateData,
        include: {
          organization: {
            include: {
              owner: true
            }
          }
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "SYSTEM_UPDATED",
          entityType: AuditEntityType.SYSTEM,
          entityId: systemId,
          adminId: userId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: {
            before: oldSystem.status,
            after: status,
            name: oldSystem.name,
            secretGenerated,
            expiresAt: updateData.tokenExpiresAt
          }
        }
      })

      return system
    })

    if (status === SystemStatus.APPROVED && result.organization?.owner?.email) {
      await sendSystemApprovedEmail(
        result.organization.owner.email,
        result.organization.owner.name || "Administrator",
        result.name || "Unknown Terminal",
        result.hostName || "Unknown",
        result.ipAddress || "Unknown",
        result.organization.name,
        session?.user?.name || "Admin"
      )
    }

    revalidatePath("/admin/organization/systems")
    return { success: true, system: result }
  } catch (error: any) {
    console.error("[UPDATE_SYSTEM_STATUS_ACTION]", error)
    return { success: false, error: "Failed to update system status" }
  }
}

export async function syncSystemExpirations(organizationId: string, shouldRevalidate: boolean = true) {
  const session = await auth()
  if (
    !session?.user?.organizationId ||
    session.user.organizationId !== organizationId ||
    session.user.role !== UserRole.ORG_ADMIN
  ) {
    throw new Error("Unauthorized")
  }

  try {
    const expiredSystems = await db.authorizedSystem.findMany({
      where: {
        organizationId: organizationId,
        status: SystemStatus.APPROVED,
        tokenExpiresAt: { lte: new Date() },
      },
      include: {
        organization: {
          include: {
            owner: true
          }
        }
      }
    })

    if (expiredSystems.length === 0) {
      return { success: true, expiredCount: 0 }
    }

    await db.authorizedSystem.updateMany({
      where: {
        id: { in: expiredSystems.map(s => s.id) }
      },
      data: {
        status: SystemStatus.EXPIRED,
        secretTokenHash: null,
        tokenExpiresAt: null,
      },
    })

    // Notify for each expired system
    for (const system of expiredSystems) {
      if (system.organization.owner?.email) {
        await sendSystemExpiredEmail(
          system.organization.owner.email,
          system.organization.owner.name || "Administrator",
          system.name || "Unknown Terminal",
          system.hostName || "Unknown",
          system.ipAddress || "Unknown",
          system.organization.name
        )
      }
    }

    if (shouldRevalidate) {
      revalidatePath("/admin/organization/systems")
    }

    return { success: true, expiredCount: expiredSystems.length }
  } catch (error) {
    console.error("[SYNC_SYSTEM_EXPIRATIONS]", error)
    return { success: false, error: "Failed to sync system expirations" }
  }
}

export async function editSystemAction(
  systemId: string,
  name: string,
  status: SystemStatus
) {
  const session = await auth()
  const userId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const oldSystemSnapshot = await db.authorizedSystem.findUnique({
      where: { id: systemId, organizationId: orgId },
      select: { status: true, name: true, secretTokenHash: true }
    })

    if (!oldSystemSnapshot) return { success: false, error: "System not found" }

    const result = await db.$transaction(async (tx) => {
      const updateData: any = {
        name: name.trim() || null,
        status,
        updatedByUserId: userId,
      }

      // Handle token changes when status changes
      if (status === SystemStatus.APPROVED && oldSystemSnapshot.status !== SystemStatus.APPROVED) {
        updateData.approvedByUserId = userId
        updateData.approvedAt = new Date()
        if (!oldSystemSnapshot.secretTokenHash) {
          // In a real scenario, we'd generate a token, show it once, and store the hash.
          // For now, we'll store the UUID as the "hash" to satisfy the schema.
          updateData.secretTokenHash = crypto.randomUUID()
        }
        updateData.tokenExpiresAt = addDays(new Date(), 15)
      } else if (
        (status === SystemStatus.REVOKED || status === SystemStatus.REJECTED || status === SystemStatus.SUSPENDED) &&
        oldSystemSnapshot.status === SystemStatus.APPROVED
      ) {
        updateData.secretTokenHash = null
        updateData.tokenExpiresAt = null
      }

      const system = await tx.authorizedSystem.update({
        where: { id: systemId, organizationId: orgId },
        data: updateData,
        include: {
          organization: {
            include: {
              owner: true
            }
          }
        }
      })

      await tx.adminAuditLog.create({
        data: {
          action: "SYSTEM_EDITED",
          entityType: AuditEntityType.SYSTEM,
          entityId: systemId,
          adminId: userId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: {
            beforeName: oldSystemSnapshot.name,
            afterName: name.trim() || null,
            beforeStatus: oldSystemSnapshot.status,
            afterStatus: status,
          },
        },
      })

      return system
    })

    if (status === SystemStatus.APPROVED && oldSystemSnapshot.status !== SystemStatus.APPROVED && result.organization?.owner?.email) {
        await sendSystemApprovedEmail(
          result.organization.owner.email,
          result.organization.owner.name || "Administrator",
          result.name || "Unknown Terminal",
          result.hostName || "Unknown",
          result.ipAddress || "Unknown",
          result.organization.name,
          session?.user?.name || "Admin"
        )
    }

    revalidatePath("/admin/organization/systems")
    return { success: true, system: result }
  } catch (error: any) {
    console.error("[EDIT_SYSTEM_ACTION]", error)
    return { success: false, error: "Failed to update system" }
  }
}

export async function deleteSystemAction(systemId: string) {
  const session = await auth()
  const userId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!orgId || session?.user?.role !== UserRole.ORG_ADMIN) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await db.$transaction(async (tx) => {
      const system = await tx.authorizedSystem.findUnique({
        where: { id: systemId, organizationId: orgId },
        select: { name: true, status: true }
      })

      if (!system) throw new Error("System not found")

      await tx.adminAuditLog.create({
        data: {
          action: "SYSTEM_DELETED",
          entityType: AuditEntityType.SYSTEM,
          entityId: systemId,
          adminId: userId!,
          organizationId: orgId!,
          status: AuditStatus.SUCCESS,
          metadata: { name: system.name, status: system.status },
        },
      })

      await tx.authorizedSystem.delete({
        where: { id: systemId, organizationId: orgId },
      })
    })

    revalidatePath("/admin/organization/systems")
    return { success: true }
  } catch (error: any) {
    console.error("[DELETE_SYSTEM_ACTION]", error)
    return { success: false, error: "Failed to delete system" }
  }
}
