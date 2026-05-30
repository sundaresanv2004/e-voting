import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { requireOrgMember, ORG_ADMIN_ROLES } from "@/lib/auth/access"
import { UserRole } from "@prisma/client"

import { ElectionTracker } from "@/components/shared/election-tracker"

export default async function ElectionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { freshUser, member } = await requireOrgMember()

  const memberRole = member.role as UserRole
  const isAdmin = ORG_ADMIN_ROLES.includes(memberRole)
  const election = await db.election.findFirst({
    where: {
      id: electionId,
      organizationId: member.organizationId,
      deletedAt: null,
    },
    select: { id: true },
  })

  if (!election) notFound()

  if (!isAdmin) {
    // staff / viewer: verify this user has access to this specific election
    const hasAccess = freshUser.members[0]
      ? await db.user.findFirst({
          where: {
            id: freshUser.id,
            OR: [
              { hasAllElectionsAccess: true },
              { electionAccess: { some: { electionId } } },
            ],
          },
          select: { id: true },
        })
      : null

    if (!hasAccess) {
      redirect("/organisation/election")
    }
  }

  return (
    <div className="flex flex-col w-full flex-1">
      <ElectionTracker electionId={electionId} />
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
    </div>
  )
}
