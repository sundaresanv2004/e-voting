import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Shield02Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { RolesDataTable } from "./_components/roles-data-table"
import { requireOrgMember, ORG_ADMIN_ROLES } from "@/lib/auth/access"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export default async function RolesPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { freshUser, member } = await requireOrgMember()

  const memberRole = member.role as UserRole
  const canManage = ORG_ADMIN_ROLES.includes(memberRole)

  // Fetch roles with all related data
  const roles = await db.electionRole.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null },
    },
    orderBy: { order: "asc" },
    include: {
      categories: {
        select: { id: true, name: true, code: true },
      },
      _count: {
        select: { candidates: true },
      },
      candidates: {
        where: { deletedAt: null },
        select: { id: true, name: true, profileImage: true },
        orderBy: { name: "asc" },
      },
      createdBy: {
        select: { id: true, name: true, email: true, image: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  })

  // Fetch election for code
  const election = await db.election.findFirst({
    where: { id: electionId, organizationId: member.organizationId, deletedAt: null },
    select: { code: true },
  })
  if (!election) notFound()

  // Fetch all categories for this election
  const allCategories = await db.electionCategory.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null },
    },
    select: { id: true, name: true, code: true },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="flex flex-col flex-1 w-full">
      <ElectionPageHeader
        electionId={electionId}
        title="Roles"
        description="Manage election roles"
        icon={Shield02Icon}
        showSettings={false}
        actions={
          canManage ? (
            <Button asChild>
              <Link href={`/organisation/election/${electionId}/roles?new=true`} className="gap-2">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
                Add Role
              </Link>
            </Button>
          ) : undefined
        }
      />
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <RolesDataTable
          data={roles as any}
          electionId={electionId}
          canManage={canManage}
          allCategories={allCategories}
          electionCode={election.code}
        />
      </div>
    </div>
  )
}
