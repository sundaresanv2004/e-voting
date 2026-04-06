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
        updateData.tokenExpiresAt = addDays(new Date(), 30)
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
