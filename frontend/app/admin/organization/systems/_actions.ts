"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { SystemStatus, UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { addDays } from "date-fns"

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
        select: { status: true, name: true, secretToken: true }
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
        if (!oldSystem.secretToken) {
          updateData.secretToken = crypto.randomUUID()
          secretGenerated = true
        }
        updateData.tokenExpiresAt = addDays(new Date(), 15)
      } else if (status === SystemStatus.REVOKED || status === SystemStatus.REJECTED) {
        // Clear token on revocation
        updateData.secretToken = null
        updateData.tokenExpiresAt = null
      }

      const system = await tx.authorizedSystem.update({
        where: {
          id: systemId,
          organizationId: orgId
        },
        data: updateData
      })

      await tx.auditLog.create({
        data: {
          action: "SYSTEM_UPDATED",
          entityType: "AuthorizedSystem",
          entityId: systemId,
          userId: userId!,
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

    revalidatePath("/admin/organization/systems")
    return { success: true, system: result }
  } catch (error: any) {
    console.error("[UPDATE_SYSTEM_STATUS_ACTION]", error)
    return { success: false, error: "Failed to update system status" }
  }
}

export async function syncSystemExpirations(organizationId: string, shouldRevalidate: boolean = true) {
  const session = await auth()
  if (!session?.user?.organizationId || session.user.organizationId !== organizationId) {
    throw new Error("Unauthorized")
  }

  try {
    const result = await db.authorizedSystem.updateMany({
      where: {
        organizationId: organizationId,
        status: SystemStatus.APPROVED,
        tokenExpiresAt: { lte: new Date() },
      },
      data: {
        status: SystemStatus.EXPIRED,
        secretToken: null,
        tokenExpiresAt: null,
      },
    })

    if (result.count > 0 && shouldRevalidate) {
      revalidatePath("/admin/organization/systems")
    }

    return { success: true, expiredCount: result.count }
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
    const result = await db.$transaction(async (tx) => {
      const oldSystem = await tx.authorizedSystem.findUnique({
        where: { id: systemId, organizationId: orgId },
        select: { status: true, name: true, secretToken: true }
      })

      if (!oldSystem) throw new Error("System not found")

      const updateData: any = {
        name: name.trim() || null,
        status,
        updatedByUserId: userId,
      }

      // Handle token changes when status changes
      if (status === SystemStatus.APPROVED && oldSystem.status !== SystemStatus.APPROVED) {
        updateData.approvedByUserId = userId
        updateData.approvedAt = new Date()
        if (!oldSystem.secretToken) {
          updateData.secretToken = crypto.randomUUID()
        }
        updateData.tokenExpiresAt = addDays(new Date(), 15)
      } else if (
        (status === SystemStatus.REVOKED || status === SystemStatus.REJECTED || status === SystemStatus.SUSPENDED) &&
        oldSystem.status === SystemStatus.APPROVED
      ) {
        updateData.secretToken = null
        updateData.tokenExpiresAt = null
      }

      const system = await tx.authorizedSystem.update({
        where: { id: systemId, organizationId: orgId },
        data: updateData,
      })

      await tx.auditLog.create({
        data: {
          action: "SYSTEM_EDITED",
          entityType: "AuthorizedSystem",
          entityId: systemId,
          userId: userId!,
          metadata: {
            beforeName: oldSystem.name,
            afterName: name.trim() || null,
            beforeStatus: oldSystem.status,
            afterStatus: status,
          },
        },
      })

      return system
    })

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

      await tx.auditLog.create({
        data: {
          action: "SYSTEM_DELETED",
          entityType: "AuthorizedSystem",
          entityId: systemId,
          userId: userId!,
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
