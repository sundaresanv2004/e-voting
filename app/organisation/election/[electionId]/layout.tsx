import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { requireOrgMember, ORG_ADMIN_ROLES } from "@/lib/auth/access"
import { UserRole } from "@prisma/client"

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
      // User is not authorised for this election — send back to a safe page
      redirect("/organisation/election")
    }
  }

  return (
    <div className="flex flex-col w-full flex-1">
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
    </div>
  )
}

