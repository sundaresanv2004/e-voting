import { db } from "@/lib/db"
import { requireOrgMember } from "@/lib/auth/access"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from '@hugeicons/react';
import { Archive01Icon } from '@hugeicons/core-free-icons';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default async function NoElectionPage() {
  const { freshUser, member } = await requireOrgMember()

  // Find the first election they have granular access to
  const access = await db.userElectionAccess.findFirst({
    where: {
      userId: freshUser.id,
      election: {
        organizationId: member.organizationId,
        deletedAt: null,
      },
    },
    select: { electionId: true }
  })

  if (access) {
    redirect(`/organisation/election/${access.electionId}`)
  }

  // Or if they have global access (but aren't org_admin), find any election
  if (freshUser.hasAllElectionsAccess) {
    const firstOrgElection = await db.election.findFirst({
      where: { organizationId: member.organizationId, deletedAt: null },
      select: { id: true }
    })
    if (firstOrgElection) {
      redirect(`/organisation/election/${firstOrgElection.id}`)
    }
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
