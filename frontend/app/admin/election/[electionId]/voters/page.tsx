import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon } from "@hugeicons/core-free-icons"
import { UserRole } from "@prisma/client"

import VoterHero from "./_components/voter-hero"
import { CreateVoterTrigger } from "./_components/CreateVoterTrigger"
import { ImportVotersDialog } from "./_components/ImportVotersDialog"
import { VoterList } from "./_components/VoterList"

export default async function VotersPage({
  params
}: {
  params: Promise<{ electionId: string }>
}) {
  const session = await auth()
  const electionId = (await params).electionId

  if (!session?.user?.organizationId) redirect("/auth/login")

  const userRole = session?.user?.role as UserRole
  const canManage = userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF

  // Verify election exists and belongs to the organization
  const election = await db.election.findFirst({
    where: {
      id: electionId,
      organizationId: session.user.organizationId
    },
    select: { name: true }
  })

  if (!election) redirect("/admin/organization/elections")

  const voters = await db.voter.findMany({
    where: {
      electionId
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      ballot: {
        select: { id: true, createdAt: true }
      }
    }
  })

  return (
    <div className="flex flex-col w-full min-h-full">
      <VoterHero title="Election Voters" subtitle={election.name}>
        {canManage && (
          <div className="flex items-center gap-2">
            <ImportVotersDialog electionId={electionId} />
            <CreateVoterTrigger
              electionId={electionId}
              listenToParams
            />
          </div>
        )}
      </VoterHero>

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        {voters.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center bg-muted/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4 shadow-sm ring-1 ring-border">
              <HugeiconsIcon icon={UserCircleIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-lg font-semibold mb-1 tracking-tight">Register Voters</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Add the people who are eligible to vote in <span className="font-bold text-foreground">{election.name}</span>. You can add them one by one or import them in bulk via CSV or Excel.
            </p>
            {canManage ? (
              <div className="flex items-center gap-3">
                <ImportVotersDialog electionId={electionId} />
                <CreateVoterTrigger
                  electionId={electionId}
                />
              </div>
            ) : (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-muted px-4 py-2 rounded-xl border">
                Read-only mode for Viewers
              </p>
            )}
          </div>
        ) : (
          <VoterList
            voters={voters as any[]}
            electionId={electionId}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  )
}
