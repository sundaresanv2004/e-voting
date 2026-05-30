import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { GridIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { CategoriesDataTable } from "./_components/categories-data-table"
import { requireOrgMember, ORG_ADMIN_ROLES } from "@/lib/auth/access"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { member } = await requireOrgMember()

  const memberRole = member.role as UserRole
  const canManage = ORG_ADMIN_ROLES.includes(memberRole)

  // We need the election code to identify the default category
  const election = await db.election.findFirst({
    where: { id: electionId, organizationId: member.organizationId, deletedAt: null },
    select: { code: true },
  })

  if (!election) notFound()

  // Fetch all roles for the dialog dropdown
  const allRoles = await db.electionRole.findMany({
    where: { electionId },
    select: { id: true, name: true, order: true },
    orderBy: { order: "asc" },
  })

  // Fetch categories with related roles
  const categories = await db.electionCategory.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null },
    },
    orderBy: { createdAt: "asc" },
    include: {
      roles: {
        select: { id: true, name: true, order: true },
        orderBy: { order: "asc" },
      },
      createdBy: {
        select: { id: true, name: true, email: true, image: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  })

  return (
    <div className="flex flex-col flex-1 w-full">
      <Suspense
        fallback={<div className="h-40 border-b bg-background/50 animate-pulse" />}
      >
        <ElectionPageHeader
          electionId={electionId}
          title="Categories"
          description="Manage election categories and their associated roles"
          icon={GridIcon}
          showSettings={false}
          showDate={false}
          showStatus={false}
          actions={
            canManage ? (
              <Button asChild>
                <Link href={`/organisation/election/${electionId}/categories?new=true`} className="gap-2">
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
                  Create Category
                </Link>
              </Button>
            ) : undefined
          }
        />
      </Suspense>
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <CategoriesDataTable
          data={categories as any}
          electionId={electionId}
          electionCode={election.code}
          allRoles={allRoles}
          canManage={canManage}
        />
      </div>
    </div>
  )
}
