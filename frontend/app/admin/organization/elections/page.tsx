import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { MapsIcon } from "@hugeicons/core-free-icons"

import { getCalculatedElectionStatus } from "@/lib/utils/election"
import ElectionHero from "./_components/electionHero"
import { CreateElectionTrigger } from "./_components/create-election-trigger"
import { ElectionsList } from "./_components/ElectionsList"

export default async function OrganizationElectionsPage() {
  const session = await auth()
  if (!session?.user?.organizationId) redirect("/setup/organization")

  let elections = await db.election.findMany({
    where: { organizationId: session.user.organizationId },
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

  // Lazy sync status with time
  const staleElections = elections.filter((e) => {
    const currentStatus = getCalculatedElectionStatus(e.startTime, e.endTime)
    return e.status !== currentStatus
  })

  if (staleElections.length > 0) {
    await Promise.all(
      staleElections.map((e) =>
        db.election.update({
          where: { id: e.id },
          data: { status: getCalculatedElectionStatus(e.startTime, e.endTime) },
        })
      )
    )

    // Refetch to get updated data
    elections = await db.election.findMany({
      where: { organizationId: session.user.organizationId },
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
  }

  return (
    <div className="flex flex-col w-full min-h-full">
      <ElectionHero>
        <CreateElectionTrigger listenToParams />
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
          <ElectionsList elections={elections as any} />
        )}
      </div>
    </div>
  )
}
