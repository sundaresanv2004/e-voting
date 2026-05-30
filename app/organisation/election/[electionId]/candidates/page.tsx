import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserMultipleIcon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { db } from "@/lib/db"
import { requireOrgMember } from "@/lib/auth/access"
import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { Button } from "@/components/ui/button"

import { CandidatesDataTable } from "./_components/candidates-data-table"

export default async function CandidatesPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { member } = await requireOrgMember()
  
  const canManage = member.role === "admin" || member.role === "org_admin" || member.role === "staff"

  // Fetch candidates
  const candidates = await db.candidate.findMany({
    where: {
      role: {
        electionId,
        election: { organizationId: member.organizationId, deletedAt: null }
      },
    },
    include: {
      role: { select: { id: true, name: true, order: true } },
      _count: { select: { votes: true } },
      createdBy: { select: { id: true, name: true, email: true, image: true } },
      updatedBy: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: [
      { role: { order: "asc" } },
      { name: "asc" }
    ],
  })

  // Fetch election roles for the dialog
  const roles = await db.electionRole.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null }
    },
    select: { id: true, name: true, order: true },
    orderBy: { order: "asc" }
  })
  
  return (
    <div className="flex flex-col flex-1 w-full">
        <ElectionPageHeader 
          electionId={electionId} 
          title="Candidates" 
          description="Manage candidates"
          icon={UserMultipleIcon} 
          showSettings={false}
          actions={
            canManage ? (
              <Button asChild>
                <Link href={`/organisation/election/${electionId}/candidates?new=true`} className="gap-2">
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
                  Add Candidate
                </Link>
              </Button>
            ) : undefined
          }
        />
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <CandidatesDataTable
          data={candidates as any}
          electionId={electionId}
          canManage={canManage}
          allRoles={roles}
        />
      </div>
    </div>
  )
}
