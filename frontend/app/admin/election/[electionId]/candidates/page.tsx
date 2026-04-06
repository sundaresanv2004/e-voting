import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon } from "@hugeicons/core-free-icons"
import { UserRole } from "@prisma/client"
import CandidateHero from "./_components/candidate-hero"
import { CandidateExport } from "./_components/CandidateExport"
import { CreateCandidateTrigger } from "./_components/create-candidate-trigger"
import { CandidatesList } from "./_components/CandidatesList"

export default async function CandidatesPage({
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
      },
      createdBy: {
        select: { name: true, email: true, image: true }
      },
      updatedBy: {
        select: { name: true, email: true, image: true }
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
    <div className="flex flex-col w-full bg-muted/5">
      <CandidateHero
        title="Election Candidates"
        subtitle={election.name}
        actions={
          <CandidateExport
            data={candidates as any}
            electionName={election.name}
          />
        }
      >
        {canManage && (
          <CreateCandidateTrigger
            electionId={electionId}
            availableRoles={roles}
            listenToParams
          />
        )}
      </CandidateHero>

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        {roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2rem] border border-dashed border-muted-foreground/20 p-8 text-center bg-muted/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 shadow-sm border border-muted-foreground/10">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2 tracking-tight">Setup Roles First</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
              You must create at least one Election Role before adding any candidates. Candidates need a role to contest for.
            </p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2rem] border border-dashed border-muted-foreground/20 p-8 text-center bg-muted/5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 shadow-sm border border-muted-foreground/10">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2 tracking-tight">Register Candidates</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
              Register candidates for this election. You can assign them to specific roles, add biographies, and link profile images.
            </p>
            {canManage && (
              <CreateCandidateTrigger
                electionId={electionId}
                availableRoles={roles}
                variant="default"
                size="lg"
              />
            )}
          </div>
        ) : (
          <CandidatesList
            candidates={candidates as any}
            electionId={electionId}
            availableRoles={roles}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  )
}
