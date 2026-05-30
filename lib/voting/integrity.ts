import "server-only"

import { ElectionStatus, type Prisma } from "@prisma/client"

type TxClient = Prisma.TransactionClient

export async function assertElectionAcceptsVotes(tx: TxClient, electionId: string) {
  const election = await tx.election.findFirst({
    where: {
      id: electionId,
      deletedAt: null,
      status: ElectionStatus.ACTIVE,
    },
    include: {
      settings: true,
    },
  })

  if (!election) throw new Error("Election is not accepting votes")

  const now = new Date()
  if (now < election.startTime || now > election.endTime) {
    throw new Error("Election is outside its voting window")
  }

  if (!election.settings?.allowOnlineVoting) {
    throw new Error("Online voting is disabled for this election")
  }

  return election
}

/**
 * Atomically reserves a voter ballot slot. Future vote submission code should
 * call this inside the same transaction that creates Ballot and Vote rows.
 */
export async function reserveVoterBallotSlot({
  tx,
  electionId,
  voterId,
  maxVotesPerUser,
}: {
  tx: TxClient
  electionId: string
  voterId: string
  maxVotesPerUser: number
}) {
  const reserved = await tx.voter.updateMany({
    where: {
      id: voterId,
      electionId,
      ballotCount: { lt: maxVotesPerUser },
    },
    data: {
      ballotCount: { increment: 1 },
      lastVotedAt: new Date(),
    },
  })

  if (reserved.count !== 1) {
    throw new Error("Voter has already used their allowed ballot")
  }
}

export function assertVoteSelectionShape({
  selectedRoleIds,
  requiredRoleIds,
}: {
  selectedRoleIds: string[]
  requiredRoleIds: string[]
}) {
  const selected = new Set(selectedRoleIds)
  if (selected.size !== selectedRoleIds.length) {
    throw new Error("Duplicate vote selections are not allowed")
  }

  for (const roleId of requiredRoleIds) {
    if (!selected.has(roleId)) {
      throw new Error("Every election role requires one selection")
    }
  }
}
