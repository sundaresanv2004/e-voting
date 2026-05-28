import { PageHeader } from "@/components/shared/page-header"
import { MapsIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { ElectionsDataTable } from "./_components/elections-data-table"

export default async function ElectionsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect("/auth/login")
  }

  // Find user's organization
  const member = await db.member.findFirst({
    where: { userId: session.user.id },
  })

  if (!member) {
    redirect("/setup/organization")
  }

  // Fetch elections
  const elections = await db.election.findMany({
    where: { organizationId: member.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title="Elections"
        description="Manage your organization's elections and campaigns."
        icon={MapsIcon}
        actions={
          <Button asChild>
            <Link href="/organisation/elections?new=true" className="gap-2">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
              Create Election
            </Link>
          </Button>
        }
      />
      <div className="px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <ElectionsDataTable data={elections} />
      </div>
    </div>
  )
}
