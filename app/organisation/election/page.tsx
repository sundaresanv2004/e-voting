import { db } from "@/lib/db"
import { requireOrgMember, ORG_ADMIN_ROLES } from "@/lib/auth/access"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive01Icon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

export default async function ElectionRouterPage() {
  const { freshUser, member } = await requireOrgMember()
  const cookieStore = await cookies()
  const lastViewedId = cookieStore.get("last_election_id")?.value

  // Admins and staff with global access can see all org elections
  const memberRole = member.role as UserRole
  const hasFullAccess = ORG_ADMIN_ROLES.includes(memberRole) || freshUser.hasAllElectionsAccess

  let targetElectionId: string | null = null

  // 1. Check if their last viewed election exists and they can access it
  if (lastViewedId) {
    if (hasFullAccess) {
      const exists = await db.election.findFirst({
        where: { id: lastViewedId, organizationId: member.organizationId, deletedAt: null },
        select: { id: true }
      })
      if (exists) targetElectionId = exists.id
    } else {
      const access = await db.userElectionAccess.findFirst({
        where: {
          userId: freshUser.id,
          electionId: lastViewedId,
          election: { organizationId: member.organizationId, deletedAt: null },
        },
        select: { electionId: true }
      })
      if (access) targetElectionId = access.electionId
    }
  }

  // 2. No valid last-viewed election — pick the most recently created one they can access
  if (!targetElectionId) {
    if (hasFullAccess) {
      const recent = await db.election.findFirst({
        where: { organizationId: member.organizationId, deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: { id: true }
      })
      if (recent) targetElectionId = recent.id
    } else {
      const recentAccess = await db.userElectionAccess.findFirst({
        where: {
          userId: freshUser.id,
          election: { organizationId: member.organizationId, deletedAt: null },
        },
        orderBy: { election: { createdAt: "desc" } },
        select: { electionId: true }
      })
      if (recentAccess) targetElectionId = recentAccess.electionId
    }
  }

  if (targetElectionId) {
    redirect(`/organisation/election/${targetElectionId}`)
  }

  return (
    <div className="flex-1 flex items-center justify-center w-full">
      <div className="max-w-4xl w-full">
        <Empty className="border bg-card/40 min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Archive01Icon} strokeWidth={1.5} className="w-8 h-8" />
            </EmptyMedia>
            <EmptyTitle>No elections yet</EmptyTitle>
            <EmptyDescription className="max-w-md">
              You do not currently have access to any active elections. If you believe this is an error, please contact your Organization Administrator.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
