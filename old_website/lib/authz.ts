import { UserRole } from "@prisma/client"

import { db } from "@/lib/db"

type SessionLikeUser = {
  id?: string
  organizationId?: string | null
  role?: UserRole
  provider?: string
}

type ActiveUserContext = {
  userId: string
  email: string
  name: string | null
  role: UserRole
  organizationId: string | null
  hasAllElectionsAccess: boolean
  emailVerified: Date | null
  provider?: string
}

type OrganizationAdminContext = ActiveUserContext & {
  organizationId: string
}

type ElectionAccessContext = {
  electionId: string
  organizationId: string
  userId: string
  role: UserRole
}

export async function requireActiveUser(
  sessionUser: SessionLikeUser | undefined
): Promise<ActiveUserContext> {
  const userId = sessionUser?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      organizationId: true,
      hasAllElectionsAccess: true,
      emailVerified: true,
      isActive: true,
      organization: {
        select: {
          isActive: true,
        },
      },
    },
  })

  if (!user?.isActive) {
    throw new Error("Unauthorized")
  }

  if (user.organizationId && !user.organization?.isActive) {
    throw new Error("Organization is inactive")
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organizationId: user.organizationId,
    hasAllElectionsAccess: user.hasAllElectionsAccess,
    emailVerified: user.emailVerified,
    provider: sessionUser?.provider,
  }
}

export async function requireVerifiedSetupUser(
  sessionUser: SessionLikeUser | undefined
): Promise<ActiveUserContext> {
  const user = await requireActiveUser(sessionUser)

  const isOAuthVerified = user.provider === "google"
  
  if (!user.emailVerified && !isOAuthVerified) {
    throw new Error("Email verification required")
  }

  return user
}

export async function requireOrgAdmin(
  sessionUser: SessionLikeUser | undefined
): Promise<OrganizationAdminContext> {
  return requireOrganizationRole(sessionUser, [UserRole.ORG_ADMIN])
}

export async function requireOrganizationRole(
  sessionUser: SessionLikeUser | undefined,
  allowedRoles: UserRole[]
): Promise<OrganizationAdminContext> {
  const user = await requireActiveUser(sessionUser)

  if (!user.organizationId || !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden")
  }

  return {
    ...user,
    organizationId: user.organizationId,
  }
}

export async function requireOrganizationOwner(
  sessionUser: SessionLikeUser | undefined
): Promise<OrganizationAdminContext> {
  const user = await requireOrgAdmin(sessionUser)

  const organization = await db.organization.findUnique({
    where: { id: user.organizationId },
    select: { ownerId: true },
  })

  if (!organization || organization.ownerId !== user.userId) {
    throw new Error("Only the organization owner can perform this action.")
  }

  return user
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
      organization: {
        select: {
          isActive: true,
        },
      },
    },
  })

  if (!user?.isActive || !user.organization?.isActive || !user.organizationId || user.organizationId !== organizationId) {
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
