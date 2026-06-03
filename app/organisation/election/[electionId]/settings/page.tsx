import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { Settings02Icon } from "@hugeicons/core-free-icons"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { requireOrgMember } from "@/lib/auth/access"
import { ElectionSettingsContainer } from "./_components/election-settings-container"
import { UserRole } from "@prisma/client"

export default async function ElectionSettingsPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { member } = await requireOrgMember()

  if (member.role === "viewer") {
    redirect(`/organisation/election/${electionId}`)
  }

  const election = await db.election.findFirst({
    where: {
      id: electionId,
      organizationId: member.organizationId,
      deletedAt: null,
    },
    include: {
      settings: true,
    }
  })

  if (!election) notFound()

  return (
    <div className="flex flex-col flex-1 w-full">
      <ElectionPageHeader 
        electionId={electionId} 
        title="Settings" 
        description="Configure election settings"
        icon={Settings02Icon} 
        showSettings={false}
      />
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <ElectionSettingsContainer election={election} role={member.role as UserRole} />
      </div>
    </div>
  )
}
