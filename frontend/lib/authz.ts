import { UserRole } from "@prisma/client"

import { db } from "@/lib/db"

type SessionLikeUser = {
  id?: string
  organizationId?: string | null
  role?: UserRole
}

type ElectionAccessContext = {
  electionId: string
  organizationId: string
  userId: string
  role: UserRole
}

export async function requireElectionAccess(
  sessionUser: SessionLikeUser | undefined,
  electionId: string,
  allowedRoles: UserRole[]
): Promise<ElectionAccessContext> {
  const userId = sessionUser?.id
  const organizationId = sessionUser?.organizationId
  const sessionRole = sessionUser?.role

  if (!userId || !organizationId || !sessionRole) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      organizationId: true,
      hasAllElectionsAccess: true,
      isActive: true,
    },
  })

  if (!user?.isActive || !user.organizationId || user.organizationId !== organizationId) {
    throw new Error("Unauthorized")
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden")
  }

  const election = await db.election.findFirst({
    where: {
      id: electionId,
      organizationId,
    },
    select: { id: true },
  })

  if (!election) {
    throw new Error("Election not found")
  }

  if (user.role !== UserRole.ORG_ADMIN && !user.hasAllElectionsAccess) {
    const access = await db.userElectionAccess.findUnique({
      where: {
        userId_electionId: {
          userId,
          electionId,
        },
      },
      select: { userId: true },
    })

    if (!access) {
      throw new Error("Forbidden")
    }
  }

  return {
    electionId,
    organizationId,
    userId,
    role: user.role,
  }
}

export async function validateOrganizationElectionIds(
  organizationId: string,
  electionIds: string[]
) {
  const uniqueElectionIds = [...new Set(electionIds.filter(Boolean))]

  if (uniqueElectionIds.length === 0) {
    return []
  }

  const elections = await db.election.findMany({
    where: {
      id: { in: uniqueElectionIds },
      organizationId,
    },
    select: { id: true, name: true },
  })

  if (elections.length !== uniqueElectionIds.length) {
    throw new Error("One or more selected elections are invalid")
  }

  return elections
}
