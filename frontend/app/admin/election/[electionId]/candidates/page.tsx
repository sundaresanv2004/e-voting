import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon } from "@hugeicons/core-free-icons"

import CandidateHero from "./_components/candidate-hero"
import { CreateCandidateTrigger } from "./_components/create-candidate-trigger"
import { CandidatesList } from "./_components/CandidatesList"
import { Badge } from "@/components/ui/badge"

export default async function CandidatesPage({
  params
}: {
  params: Promise<{ electionId: string }>
}) {
  const session = await auth()
  const electionId = (await params).electionId

  if (!session?.user?.organizationId) redirect("/auth/login")

  // Verify election exists and belongs to the organization
  const election = await db.election.findFirst({
    where: {
      id: electionId,
      organizationId: session.user.organizationId
    },
    select: { name: true }
  })

  if (!election) redirect("/admin/organization/elections")

  const candidates = await db.candidate.findMany({
    where: {
      electionId
    },
    orderBy: {
      role: {
        order: "asc"
      }
    },
    include: {
      role: {
        select: { name: true, order: true }
      }
    }
  })

  const roles = await db.electionRole.findMany({
    where: {
      electionId
    },
    orderBy: {
      order: "asc"
    },
    select: {
      id: true,
      name: true,
      order: true,
      electionId: true,
      allowedSystems: {
        select: { id: true, name: true }
      }
    }
  })

  return (
    <div className="flex flex-col w-full">
      <CandidateHero title="Election Candidates" subtitle={election.name}>
        <CreateCandidateTrigger
          electionId={electionId}
          availableRoles={roles}
          listenToParams
        />
      </CandidateHero>

      <div className="flex-1 py-10 px-4 md:px-8 w-full">
        {roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl border-2 border-dashed border-muted-foreground/20 p-12 text-center bg-muted/5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 mb-6 ring-1 ring-primary/10 shadow-inner">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">Setup Roles First</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
              You must create at least one Election Role before adding any candidates. Candidates need a role to contest for.
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl border-2 border-dashed border-muted-foreground/20 p-12 text-center bg-muted/5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 mb-6 ring-1 ring-primary/10 shadow-inner">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">Register Candidates</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
              Register candidates for this election. You can assign them to specific roles, add biographies, and link profile images.
            </p>
            <CreateCandidateTrigger
              electionId={electionId}
              availableRoles={roles}
              variant="default"
              size="lg"
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Manage the registered candidates for this election campaign.</p>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                {candidates.length} Candidates Registered
              </Badge>
            </div>
            <CandidatesList
              candidates={candidates}
              electionId={electionId}
              availableRoles={roles}
            />
          </div>
        )}
      </div>
    </div>
  )
}
