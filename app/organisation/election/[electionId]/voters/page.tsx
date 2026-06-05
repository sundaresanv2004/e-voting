import Link from "next/link"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon, PlusSignIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { VotersDataTable } from "./_components/voters-data-table"
import { AnonymousBallotsTable } from "./_components/anonymous-ballots-table"
import { ImportVotersDialog } from "./_components/import-voters-dialog"
import { VotersPoller } from "./_components/voters-poller"
import { requireOrgMember, ORG_ADMIN_ROLES } from "@/lib/auth/access"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export default async function VotersPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { member } = await requireOrgMember()

  const memberRole = member.role as UserRole
  const canManage = memberRole !== "viewer"

  const election = await db.election.findFirst({
    where: { id: electionId, organizationId: member.organizationId, deletedAt: null },
    select: { code: true },
  })
  if (!election) notFound()

  // Fetch all categories for the dropdown and import validation
  const allCategories = await db.electionCategory.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null },
    },
    select: { id: true, name: true, code: true },
    orderBy: { createdAt: "asc" },
  })

  // Fetch voters with related data
  const voters = await db.voter.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null },
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: { id: true, name: true, code: true },
      },
      ballots: {
        select: {
          id: true,
          createdAt: true,
          ipAddress: true,
          userAgent: true,
          categoryId: true,
          category: { select: { id: true, name: true, code: true } },
        },
      },
      createdBy: {
        select: { id: true, name: true, email: true, image: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  })

  // Fetch anonymous ballots
  const anonymousBallots = await db.ballot.findMany({
    where: {
      electionId,
      isAnonymous: true,
      deletedAt: null,
      election: { organizationId: member.organizationId },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      submissionKey: true,
      ipAddress: true,
      userAgent: true,
      createdAt: true,
      category: { select: { id: true, name: true, code: true } },
    },
  })

  return (
    <div className="flex flex-col flex-1 w-full">
      <VotersPoller />
      <ElectionPageHeader
        electionId={electionId}
        title="Voters"
        description="Manage registered voters for this election"
        icon={UserCircleIcon}
        showSettings={false}
        actions={
          canManage ? (
            <div className="flex items-center gap-3">
              <ImportVotersDialog electionId={electionId} allCategories={allCategories} />
              <Button asChild>
                <Link href={`/organisation/election/${electionId}/voters?new=true`} className="gap-2">
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} className="h-4 w-4" />
                  Add Voter
                </Link>
              </Button>
            </div>
          ) : undefined
        }
      />
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <Tabs defaultValue="registered" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="registered">Registered Voters</TabsTrigger>
            <TabsTrigger value="anonymous">Anonymous Ballots</TabsTrigger>
          </TabsList>
          
          <TabsContent value="registered" className="mt-0 outline-none">
            <VotersDataTable
              data={voters as any}
              electionId={electionId}
              allCategories={allCategories}
              canManage={canManage}
            />
          </TabsContent>
          
          <TabsContent value="anonymous" className="mt-0 outline-none">
            <AnonymousBallotsTable
              data={anonymousBallots as any}
              electionId={electionId}
              canManage={canManage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
