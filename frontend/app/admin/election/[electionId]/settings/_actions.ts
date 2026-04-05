"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole } from "@prisma/client"

export async function updateElectionSettings(
  electionId: string,
  data: {
    applyRolesToSystems: boolean
  }
) {
  const session = await auth()
  const userId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!userId || !orgId || session.user.role !== UserRole.ORG_ADMIN) {
    throw new Error("Unauthorized")
  }

  try {
    const updatedSettings = await db.electionSettings.update({
      where: { electionId },
      data: {
        updatedByUserId: userId,
      },
    })

    revalidatePath(`/admin/election/${electionId}/settings`)
    return { success: true, settings: updatedSettings }
  } catch (error: any) {
    console.error("[UPDATE_ELECTION_SETTINGS]", error)
    return { success: false, error: "Failed to update settings" }
  }
}

export async function getElectionSettings(electionId: string) {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId) return null

  return db.electionSettings.findFirst({
    where: { 
      electionId,
      election: { organizationId: orgId }
    }
  })
}
