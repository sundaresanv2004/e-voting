import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { requireOrgMember } from "@/lib/auth/access"
import { AuditEntityType } from "@prisma/client"
import { Building06Icon } from "@hugeicons/core-free-icons"

import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { ElectionMetricCards } from "./_components/election-metric-cards"
import { ElectionQuickNavigate } from "./_components/election-quick-navigate"
import { ElectionTurnoutChart } from "./_components/election-turnout-chart"
import { ElectionActivityFeed } from "./_components/election-activity-feed"
import { ElectionRolesSnapshot } from "./_components/election-roles-snapshot"
import { ElectionCategoriesSnapshot } from "./_components/election-categories-snapshot"
import { ElectionVotersSnapshot } from "./_components/election-voters-snapshot"
import { ElectionConfigurationCard } from "./_components/election-configuration-card"
import { syncElectionStatus } from "@/lib/actions/election"

export const dynamic = "force-dynamic"

export default async function ElectionOverviewPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { member } = await requireOrgMember()
  const orgId = member.organizationId

  // Correct a stale status before loading the dashboard so the header badge
  // is always accurate. Awaited so the update lands before the query below.
  await syncElectionStatus(electionId, orgId)

  const [election, recentActivity, recentBallotActivity, uniqueVotersVoted] = await Promise.all([
    db.election.findFirst({
      where: { id: electionId, organizationId: orgId, deletedAt: null },
      include: {
        settings: true,
        roles: {
          orderBy: { order: "asc" },
          include: {
            _count: { select: { candidates: true } },
          },
        },
        categories: {
          include: {
            _count: { select: { voters: true } },
          },
        },
        _count: {
          select: {
            voters: true,
            ballots: true,
            roles: true,
            categories: true,
          },
        },
      },
    }),

    db.adminAuditLog.findMany({
      where: {
        organizationId: orgId,
        entityId: electionId,
        entityType: {
          in: [
            AuditEntityType.ELECTION,
            AuditEntityType.ELECTION_ROLE,
            AuditEntityType.ELECTION_CATEGORY,
            AuditEntityType.CANDIDATE,
            AuditEntityType.VOTER,
            AuditEntityType.BALLOT,
            AuditEntityType.SETTINGS,
            AuditEntityType.SECURITY,
            AuditEntityType.RESULT,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        admin: { select: { name: true, email: true } },
      },
    }),

    db.ballot.findMany({
      where: {
        electionId,
        createdAt: { gt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
        deletedAt: null,
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),

    // Count unique registered voters who have cast at least one ballot
    db.voter.count({ where: { electionId, ballotCount: { gt: 0 } } }),
  ])

  if (!election) notFound()

  // Compute totals
  const totalCandidates = election.roles.reduce(
    (acc, role) => acc + role._count.candidates,
    0
  )

  // Build 12-hour turnout velocity data
  const turnoutData = Array.from({ length: 12 }, (_, i) => {
    const hour = new Date(Date.now() - (11 - i) * 60 * 60 * 1000)
    hour.setMinutes(0, 0, 0)
    const count = recentBallotActivity.filter((b) => {
      const bHour = new Date(b.createdAt)
      bHour.setMinutes(0, 0, 0)
      return bHour.getTime() === hour.getTime()
    }).length
    return {
      time: hour.toLocaleTimeString([], { hour: "numeric", hour12: true }),
      ballots: count,
    }
  })

  const totalBallotsLast12h = turnoutData.reduce((acc, d) => acc + d.ballots, 0)
  const hasRecentActivity = totalBallotsLast12h > 0

  return (
    <div className="flex w-full flex-1 flex-col">
      <ElectionPageHeader
        electionId={electionId}
        title="Overview"
        description="Dashboard and activity summary"
        icon={Building06Icon}
        isDashboard={true}
        showSettings={false}
      />

      <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 py-8 md:px-8">
        {/* Row 1 — Metric Cards */}
        <ElectionMetricCards
          totalVoters={election._count.voters}
          uniqueVotersVoted={uniqueVotersVoted}
          totalCandidates={totalCandidates}
          totalRoles={election._count.roles}
          totalCategories={election._count.categories}
        />

        {/* Row 2 — Main layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column (2/3) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Turnout Velocity chart — only shows when there is recent activity */}
            {hasRecentActivity && (
              <ElectionTurnoutChart data={turnoutData} />
            )}

            {/* Management Core */}
            <ElectionQuickNavigate
              electionId={electionId}
              hasCategories={election._count.categories > 0}
              userRole={member.role}
            />

            {/* Recent Activity */}
            <ElectionActivityFeed
              logs={recentActivity}
              electionId={electionId}
              userRole={member.role}
            />
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">
            {/* Roles Snapshot */}
            <ElectionRolesSnapshot
              electionId={electionId}
              roles={election.roles}
              totalRoles={election._count.roles}
              totalCandidates={totalCandidates}
            />

            {/* Voter Participation */}
            <ElectionVotersSnapshot
              electionId={electionId}
              totalVoters={election._count.voters}
              totalBallots={election._count.ballots}
            />

            {/* Categories — only shown if categories exist */}
            {election._count.categories > 0 && (
              <ElectionCategoriesSnapshot
                electionId={electionId}
                categories={election.categories}
                totalVoters={election._count.voters}
              />
            )}

            {/* Configuration Summary */}
            {member.role !== "staff" && member.role !== "viewer" && (
              <ElectionConfigurationCard
                electionId={electionId}
                settings={election.settings}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
