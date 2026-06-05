import { PageHeader } from "@/components/shared/page-header"
import { MapsIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

import { db } from "@/lib/db"
import { ElectionsDataTable } from "./_components/elections-data-table"
import { requireOrgAdmin } from "@/lib/auth/access"

export default async function ElectionsPage() {
  // Enforce org_admin / admin for this specific page
  const { member } = await requireOrgAdmin()

  // Fetch elections — exclude soft-deleted
  const elections = await db.election.findMany({
    where: { organizationId: member.organizationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true, image: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  })

  const isAdmin = true // layout guarantees this

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title="Elections"
        description="Manage your organization's elections and campaigns."
        icon={MapsIcon}
        actions={
          isAdmin && (
            <Button asChild>
              <Link href="/organisation/elections?new=true" className="gap-2">
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
                Create Election
              </Link>
            </Button>
          )
        }
      />
      <div className="px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <ElectionsDataTable data={elections} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
