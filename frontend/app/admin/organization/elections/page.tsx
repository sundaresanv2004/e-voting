import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { MapsIcon } from "@hugeicons/core-free-icons"

import ElectionHero from "./_components/electionHero"
import { CreateElectionTrigger } from "./_components/create-election-trigger"
import { DataTable } from "./_components/data-table"
import { columns } from "./_components/columns"

export default async function OrganizationElectionsPage() {
  const session = await auth()
  if (!session?.user?.organizationId) redirect("/setup/organization")

  const elections = await db.election.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  return (
    <div className="flex flex-col w-full min-h-full">
      <ElectionHero>
        <CreateElectionTrigger />
      </ElectionHero>

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        {elections.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <HugeiconsIcon icon={MapsIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-1">No elections yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Get started by creating your first election.
            </p>
            <CreateElectionTrigger />
          </div>
        ) : (
          <DataTable columns={columns} data={elections} />
        )}
      </div>
    </div>
  )
}
