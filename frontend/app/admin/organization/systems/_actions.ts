"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { SystemStatus, UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

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
    const data: any = {
      status,
      updatedByUserId: userId,
    }

    if (status === SystemStatus.APPROVED) {
      data.approvedByUserId = userId
      data.approvedAt = new Date()
    }

    await db.authorizedSystem.update({
      where: { 
        id: systemId,
        organizationId: orgId // Ensure system belongs to admin's org
      },
      data
    })

    revalidatePath("/admin/organization/systems")
    return { success: true }
  } catch (error: any) {
    console.error("[UPDATE_SYSTEM_STATUS_ACTION]", error)
    return { success: false, error: "Failed to update system status" }
  }
}
