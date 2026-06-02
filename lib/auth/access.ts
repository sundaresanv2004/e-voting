import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { logAdminAction } from "@/lib/auth/audit"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AuditEntityType, AuditStatus, UserRole } from "@prisma/client"
import { cache } from "react"

/**
 * The roles that have full management access to org-level pages
 * (dashboard, elections list, members, settings).
 */
export const ORG_ADMIN_ROLES: UserRole[] = [UserRole.org_admin, UserRole.admin]

/**
 * The roles that have read-only access scoped to individual elections.
 */
export const ELECTION_MEMBER_ROLES: UserRole[] = [UserRole.staff, UserRole.viewer]

/**
 * Loads the current user's session + fresh membership record from the DB.
 * Redirects to login if unauthenticated, to setup if not yet in an org,
 * or to the error page if the account is inactive.
 *
 * Returns the fresh user record with their member info included.
 */
export const requireOrgMember = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) redirect("/auth/login")

  const freshUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      isActive: true,
      hasAllElectionsAccess: true,
      members: {
        take: 1,
        include: { organization: true },
      },
    },
  })

  if (!freshUser || !freshUser.isActive) redirect("/auth/error?error=AccessDenied")
  if (!freshUser.members || freshUser.members.length === 0) redirect("/setup/organization")

  return { session, freshUser, member: freshUser.members[0] }
})

/**
 * Like requireOrgMember() but additionally enforces that the user's
 * organization-level role is org_admin or admin.
 *
 * staff / viewer users are redirected to the first election they have
 * access to, or to a 403-style page if they have none.
 */
export async function requireOrgAdmin(fallbackPath = "/organisation/election") {
  const { session, freshUser, member } = await requireOrgMember()

  const memberRole = member.role as UserRole
  if (!ORG_ADMIN_ROLES.includes(memberRole)) {
    // Redirect lower-privilege users to the election space
    redirect(fallbackPath)
  }

  return { session, freshUser, member }
}

export class ActionAuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ActionAuthorizationError"
  }
}

async function auditActionAuthorizationFailure({
  userId,
  organizationId,
  action,
  entityType = AuditEntityType.SECURITY,
  entityId,
  reason,
  metadata,
}: {
  userId?: string | null
  organizationId?: string | null
  action: string
  entityType?: AuditEntityType
  entityId?: string | null
  reason: string
  metadata?: Record<string, unknown>
}) {
  await logAdminAction({
    adminId: userId,
    organizationId,
    action,
    entityType,
    entityId,
    status: AuditStatus.FAILURE,
    description: reason,
    metadata,
  })
}

/**
 * Server Action guard. Page/layout checks are useful for UX, but every
 * mutation needs its own authz because Server Actions can be invoked directly.
 */
export async function requireOrgActionContext({
  action,
  entityType = AuditEntityType.SECURITY,
  entityId,
  adminOnly = true,
}: {
  action: string
  entityType?: AuditEntityType
  entityId?: string | null
  adminOnly?: boolean
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    await auditActionAuthorizationFailure({
      action,
      entityType,
      entityId,
      reason: "Unauthenticated Server Action call",
    })
    throw new ActionAuthorizationError("Unauthorized")
  }

  const requestedOrgId = session.session.activeOrganizationId
  const member = await db.member.findFirst({
    where: {
      userId: session.user.id,
      ...(requestedOrgId ? { organizationId: requestedOrgId } : {}),
    },
    include: {
      organization: true,
      user: true,
    },
  })

  if (!member || !member.user.isActive || !member.organization.isActive) {
    await auditActionAuthorizationFailure({
      userId: session.user.id,
      organizationId: member?.organizationId || null,
      action,
      entityType,
      entityId,
      reason: "User does not belong to the requested active organization",
      metadata: { requestedOrgId },
    })
    throw new ActionAuthorizationError("Forbidden")
  }

  const role = member.role as UserRole
  const isOwner = member.organization.ownerId === session.user.id
  const isOrgAdmin = isOwner || ORG_ADMIN_ROLES.includes(role)

  const isAllowed = isOrgAdmin || (!adminOnly && role === UserRole.staff)

  if (!isAllowed) {
    await auditActionAuthorizationFailure({
      userId: session.user.id,
      organizationId: member.organizationId,
      action,
      entityType,
      entityId,
      reason: adminOnly
        ? "User lacks organization admin access"
        : "User role is not authorized to perform this action",
      metadata: { role },
    })
    throw new ActionAuthorizationError(
      adminOnly
        ? "Forbidden: Requires organization admin access"
        : "Forbidden: You do not have permission to perform this action"
    )
  }

  return {
    session,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    organizationId: member.organizationId,
    organization: member.organization,
    member,
    isOwner,
    isOrgAdmin,
  }
}
