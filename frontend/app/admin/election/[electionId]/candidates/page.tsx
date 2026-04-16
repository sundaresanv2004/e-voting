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
import { Badge } from "@/components/ui/badge"

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
      role: { electionId }
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
    <div className="flex flex-col w-full min-h-full">
      <CandidateHero
        title="Election Candidates"
        subtitle={election.name}
        actions={
          canManage && (
            <CandidateExport
              data={candidates as any}
              electionName={election.name}
            />
          )
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
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Setup Roles First</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              You must create at least one Election Role before adding any candidates.
            </p>
            {!canManage && (
              <Badge
                variant={"outline"}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-3 rounded-xl border border-border/50"
              >
                Administrative actions are restricted for Viewers
              </Badge>
            )}
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Register Candidates</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Register candidates for this election. Assign them to roles and link profile images.
            </p>
            {canManage ? (
              <CreateCandidateTrigger
                electionId={electionId}
                availableRoles={roles}
              />
            ) : (
              <Badge
                variant={"outline"}
                className="text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-3 rounded-xl border border-border/50"
              >
                Administrative actions are restricted for Viewers
              </Badge>
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
