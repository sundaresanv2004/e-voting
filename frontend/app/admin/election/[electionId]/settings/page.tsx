import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getElectionData } from "./_actions"
import ElectionSettingsHero from "./_components/ElectionSettingsHero"
import { ElectionSettingsContainer } from "./_components/ElectionSettingsContainer"
import { Suspense } from "react"
import { Spinner } from "@/components/ui/spinner"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockKeyIcon } from "@hugeicons/core-free-icons"
import { getCalculatedElectionStatus } from "@/lib/utils/election"
import { db } from "@/lib/db"
import { AuditEntityType, AuditStatus } from "@prisma/client"

export default async function ElectionSettingsPage({
  params
}: {
  params: Promise<{ electionId: string }>
}) {
  const session = await auth()
  const electionId = (await params).electionId

  if (!session?.user?.organizationId) redirect("/auth/login")

  let election = await getElectionData(electionId)

  if (!election) {
    redirect("/admin/organization/elections")
  }

  const isViewer = session.user.role === "VIEWER"
  const isOrgAdmin = session.user.role === "ORG_ADMIN"

  // Lazy sync status with time
  const calculated = getCalculatedElectionStatus(election.startTime, election.endTime)
  let isStale = false
  if (calculated === "COMPLETED" && election.status !== "COMPLETED") isStale = true
  else if (election.status === "PAUSED" && calculated === "ACTIVE") isStale = false
  else isStale = election.status !== calculated

  if (isStale && !isViewer && election) { // Make sure viewers don't trigger database writes if possible, or trigger anyway. It's safe since it's server-side.
    const currentElectionId = election.id
    const currentElectionStatus = election.status
    
    await db.$transaction(async (tx) => {
      await tx.election.update({
        where: { id: currentElectionId },
        data: { status: calculated },
      })
      await tx.adminAuditLog.create({
        data: {
          action: "ELECTION_STATUS_SYNC",
          entityType: AuditEntityType.ELECTION,
          entityId: currentElectionId,
          adminId: session.user.id,
          organizationId: session.user.organizationId!,
          status: AuditStatus.SUCCESS,
          metadata: { 
            oldStatus: currentElectionStatus, 
            newStatus: calculated, 
            reason: "Automatic time-based synchronization (Settings Page Load)" 
          },
        }
      })
    })
    election = await getElectionData(electionId)
  }

  if (!election) {
    redirect("/admin/organization/elections")
  }

  return (
    <div className="flex flex-col w-full min-h-full">
      <ElectionSettingsHero 
        title="Election Settings" 
        subtitle={election.name} 
      />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        {isViewer ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border bg-card/50 backdrop-blur-sm p-8 text-center text-muted-foreground mt-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4 shadow-sm ring-1 ring-border">
              <HugeiconsIcon icon={LockKeyIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground/80" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">Access Restricted</h2>
            <p className="text-sm max-w-sm mb-6">
              You don&apos;t have permission to view or manage election settings. Contact your organization administrator to request access.
            </p>
          </div>
        ) : (
          <Suspense fallback={<div className="flex justify-center p-8"><Spinner /></div>}>
            <ElectionSettingsContainer 
              election={{
                id: election.id,
                name: election.name,
                code: election.code,
                startTime: election.startTime,
                endTime: election.endTime,
                status: election.status,
                settings: election.settings ? {
                  allowOnlineVoting: election.settings.allowOnlineVoting,
                  allowOfflineVoting: election.settings.allowOfflineVoting,
                  authorizeVoters: election.settings.authorizeVoters,
                  showCandidateProfiles: election.settings.showCandidateProfiles,
                  showCandidateSymbols: election.settings.showCandidateSymbols,
                  shuffleCandidates: election.settings.shuffleCandidates,
                } : null
              }} 
            />
          </Suspense>
        )}
      </div>
    </div>
  )
}
