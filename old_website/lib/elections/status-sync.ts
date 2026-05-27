import { AuditEntityType, AuditStatus, ElectionStatus, Prisma } from "@prisma/client"

import { db } from "@/lib/db"
import { getCalculatedElectionStatus } from "@/lib/utils/election"

type SyncActor = {
  userId?: string | null
  organizationId?: string | null
  reason?: string
}

type ElectionSnapshot = {
  id: string
  organizationId: string
  startTime: Date
  endTime: Date
  status: ElectionStatus
}

function getNextElectionStatus(election: Pick<ElectionSnapshot, "startTime" | "endTime" | "status">) {
  const calculated = getCalculatedElectionStatus(election.startTime, election.endTime)

  if (calculated === ElectionStatus.COMPLETED && election.status !== ElectionStatus.COMPLETED) {
    return calculated
  }

  if (election.status === ElectionStatus.PAUSED && calculated === ElectionStatus.ACTIVE) {
    return election.status
  }

  return calculated
}

async function syncElectionStatusWithClient(
  client: Prisma.TransactionClient,
  election: ElectionSnapshot,
  actor?: SyncActor
) {
  const nextStatus = getNextElectionStatus(election)

  if (nextStatus === election.status) {
    return election
  }

  const updated = await client.election.update({
    where: { id: election.id },
    data: { status: nextStatus },
  })

  await client.adminAuditLog.create({
    data: {
      action: "ELECTION_STATUS_SYNC",
      entityType: AuditEntityType.ELECTION,
      entityId: election.id,
      adminId: actor?.userId || null,
      organizationId: actor?.organizationId || election.organizationId,
      status: AuditStatus.SUCCESS,
      metadata: {
        oldStatus: election.status,
        newStatus: nextStatus,
        reason: actor?.reason || "Automatic time-based synchronization",
      },
    },
  })

  return updated
}

export async function syncElectionStatus(electionId: string, actor?: SyncActor) {
  const election = await db.election.findUnique({
    where: { id: electionId },
    select: {
      id: true,
      organizationId: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  })

  if (!election) {
    return null
  }

  return db.$transaction((tx) => syncElectionStatusWithClient(tx, election, actor))
}

export async function syncOrganizationElectionStatuses(
  organizationId: string,
  actor?: SyncActor
) {
  const elections = await db.election.findMany({
    where: { organizationId },
    select: {
      id: true,
      organizationId: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  })

  const staleElections = elections.filter((election) => getNextElectionStatus(election) !== election.status)

  if (staleElections.length === 0) {
    return 0
  }

  await db.$transaction(async (tx) => {
    for (const election of staleElections) {
      await syncElectionStatusWithClient(tx, election, actor)
    }
  })

  return staleElections.length
}
