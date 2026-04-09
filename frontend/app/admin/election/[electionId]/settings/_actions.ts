"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole } from "@prisma/client"

export async function updateElectionSettingsAction(
  electionId: string,
  data: {
    requireSystemAuth?: boolean
    allSystemsAllowed?: boolean
    authorizeVoters?: boolean
    verifyDob?: boolean
  }
) {
  const session = await auth()
  const userId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!userId || !orgId || session.user.role !== UserRole.ORG_ADMIN) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const updatedSettings = await db.electionSettings.update({
      where: { electionId },
      data: {
        ...data,
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

export async function updateElectionCoreAction(
  electionId: string,
  data: {
    name: string
    startTime: Date
    endTime: Date
  }
) {
  const session = await auth()
  const userId = session?.user?.id
  const orgId = session?.user?.organizationId

  if (!userId || !orgId || session.user.role !== UserRole.ORG_ADMIN) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    const updatedElection = await db.election.update({
      where: { 
        id: electionId,
        organizationId: orgId
      },
      data: {
        ...data,
        updatedByUserId: userId,
      },
    })

    revalidatePath(`/admin/election/${electionId}/settings`)
    return { success: true, election: updatedElection }
  } catch (error: any) {
    console.error("[UPDATE_ELECTION_CORE]", error)
    return { success: false, error: "Failed to update election details" }
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

export async function getElectionData(electionId: string) {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId) return null

  return db.election.findFirst({
    where: { 
      id: electionId,
      organizationId: orgId 
    },
    include: {
      settings: true
    }
  })
}
