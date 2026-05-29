import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { UserRole } from "@prisma/client"

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
export async function requireOrgMember() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) redirect("/auth/login")

  const freshUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      isActive: true,
      members: {
        take: 1,
        include: { organization: true },
      },
    },
  })

  if (!freshUser || !freshUser.isActive) redirect("/auth/error?error=AccessDenied")
  if (!freshUser.members || freshUser.members.length === 0) redirect("/setup/organization")

  return { session, freshUser, member: freshUser.members[0] }
}

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
