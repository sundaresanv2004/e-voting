"use server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { UserRole, AuditEntityType, AuditStatus } from "@prisma/client"
import { getCalculatedElectionStatus } from "@/lib/utils/election"
import { requireElectionAccess } from "@/lib/authz"
import {
  ElectionSettingsUpdateSchema,
  type ElectionSettingsUpdateValues,
} from "@/lib/schemas/election-settings"

export async function updateElectionSettingsAction(
  electionId: string,
  data: ElectionSettingsUpdateValues
) {
  const session = await auth()

  try {
    const access = await requireElectionAccess(session?.user, electionId, [
      UserRole.ORG_ADMIN,
      UserRole.STAFF,
    ])

    const result = await db.$transaction(async (tx) => {
      const oldSettings = await tx.electionSettings.findFirst({
        where: {
          electionId,
          election: { organizationId: access.organizationId },
        },
      })

      if (!oldSettings) {
        throw new Error("Election settings not found")
      }

      const parsed = ElectionSettingsUpdateSchema.safeParse(data)
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message || "Invalid election settings")
      }

      const nextSettings = {
        ...oldSettings,
        ...parsed.data,
      }

      if (nextSettings.allowOnlineVoting && nextSettings.allowOfflineVoting) {
        throw new Error("Online voting and hardware-app voting cannot both be enabled")
      }

      if (nextSettings.allowOnlineVoting && !nextSettings.authorizeVoters) {
        throw new Error("Voter authorization is required when online voting is enabled")
      }

      if (!nextSettings.allowMultipleVotes && parsed.data.maxVotesPerUser && parsed.data.maxVotesPerUser > 1) {
        throw new Error("Enable multiple votes before increasing the maximum votes per user")
      }

      const updatedSettings = await tx.electionSettings.update({
        where: { id: oldSettings.id },
        data: {
          ...parsed.data,
          ...(!nextSettings.allowMultipleVotes ? { maxVotesPerUser: 1 } : {}),
          updatedByUserId: access.userId,
        },
      })

      await tx.adminAuditLog.create({
        data: {
          action: "ELECTION_SETTINGS_UPDATED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: access.userId,
          organizationId: access.organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { 
            before: oldSettings,
            after: parsed.data
          },
        }
      })

      return updatedSettings
    })

    revalidatePath(`/admin/election/${electionId}/settings`)
    return { success: true, settings: result }
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

  try {
    const access = await requireElectionAccess(session?.user, electionId, [
      UserRole.ORG_ADMIN,
      UserRole.STAFF,
    ])

    const result = await db.$transaction(async (tx) => {
      const oldElection = await tx.election.findUnique({
        where: { id: electionId, organizationId: access.organizationId },
        select: { name: true, startTime: true, endTime: true, status: true }
      })

      if (!oldElection) throw new Error("Election not found")

      let newStatus = getCalculatedElectionStatus(data.startTime, data.endTime)
      // If it was manually PAUSED and it technically should be ACTIVE based on time, keep it PAUSED
      if (oldElection.status === "PAUSED" && newStatus === "ACTIVE") {
        newStatus = "PAUSED"
      }

      const updatedElection = await tx.election.update({
        where: { 
          id: electionId,
          organizationId: access.organizationId
        },
        data: {
          ...data,
          status: newStatus,
          updatedByUserId: access.userId,
        },
      })

      await tx.adminAuditLog.create({
        data: {
          action: "ELECTION_CORE_UPDATED",
          entityType: AuditEntityType.ELECTION,
          entityId: electionId,
          adminId: access.userId,
          organizationId: access.organizationId,
          status: AuditStatus.SUCCESS,
          metadata: { 
            before: oldElection,
            after: { ...data, status: newStatus }
          },
        }
      })

      return updatedElection
    })

    revalidatePath("/", "layout")
    revalidatePath(`/admin/election/${electionId}/settings`)
    return { success: true, election: result }
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
