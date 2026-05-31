import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ChartHistogramIcon } from "@hugeicons/core-free-icons"

import { db } from "@/lib/db"
import { requireOrgMember } from "@/lib/auth/access"
import { ElectionPageHeader } from "@/components/shared/election-page-header"

import { ResultsDashboard, ResultsDashboardSkeleton } from "./_components/results-dashboard"
import { ResultsActions } from "./_components/results-actions"
import type {
  RoleResult,
  CategoryTurnout,
  TimelinePoint,
} from "./_components/results-dashboard"
import type { ResultsExportData } from "./_components/results-export"

export const revalidate = 30

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { member } = await requireOrgMember()

  // ── Fetch election + org branding ───────────────────────────────────────────
  const election = await db.election.findFirst({
    where: {
      id: electionId,
      organizationId: member.organizationId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      status: true,
      startTime: true,
      endTime: true,
      organization: {
        select: {
          name: true,
          logo: true,
          settings: { select: { allowCustomBranding: true } },
        },
      },
      result: {
        select: { isFinalized: true, finalizedAt: true },
      },
      _count: { select: { ballots: true, voters: true } },
    },
  })

  if (!election) notFound()

  const allowCustomBranding = election.organization.settings?.allowCustomBranding ?? false

  // ── Fetch roles with candidate vote + image data ─────────────────────────────
  const rolesData = await db.electionRole.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null },
    },
    orderBy: { order: "asc" },
    include: {
      candidates: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          profileImage: true,
          symbolImage: true,
          _count: { select: { votes: true } },
        },
        orderBy: { name: "asc" },
      },
    },
  })

  // ── Fetch ballots (for timeline) ─────────────────────────────────────────────
  const ballots = await db.ballot.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null },
      deletedAt: null,
    },
    select: { createdAt: true, categoryId: true, voterId: true },
    orderBy: { createdAt: "asc" },
  })

  // ── Fetch categories with voter/ballot counts ────────────────────────────────
  const categories = await db.electionCategory.findMany({
    where: {
      electionId,
      election: { organizationId: member.organizationId, deletedAt: null },
    },
    select: {
      id: true,
      name: true,
      code: true,
      _count: { select: { voters: true, ballots: true } },
    },
    orderBy: { name: "asc" },
  })

  // ── Aggregations ─────────────────────────────────────────────────────────────

  const totalBallots = election._count.ballots
  const totalVoters = election._count.voters
  const turnoutPercentage = totalVoters > 0 ? (totalBallots / totalVoters) * 100 : 0

  // Role results with leading detection
  const roleResults: RoleResult[] = rolesData.map((role) => {
    const totalVotes = role.candidates.reduce((sum, c) => sum + c._count.votes, 0)

    const candidates = role.candidates
      .map((c) => ({
        id: c.id,
        name: c.name,
        profileImage: c.profileImage,
        symbolImage: c.symbolImage,
        voteCount: c._count.votes,
        percentage: totalVotes > 0 ? (c._count.votes / totalVotes) * 100 : 0,
        isLeading: false,
      }))
      .sort((a, b) => b.voteCount - a.voteCount)

    // Mark leaders (handles ties)
    if (candidates.length > 0 && candidates[0].voteCount > 0) {
      const topCount = candidates[0].voteCount
      candidates.forEach((c) => { if (c.voteCount === topCount) c.isLeading = true })
    }

    return { id: role.id, name: role.name, order: role.order, totalVotes, candidates }
  })

  // Category turnout breakdown
  const categoryTurnout: CategoryTurnout[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    code: cat.code,
    totalVoters: cat._count.voters,
    ballotsCast: cat._count.ballots,
    turnoutPercentage: cat._count.voters > 0
      ? (cat._count.ballots / cat._count.voters) * 100
      : 0,
  }))

  // Hourly timeline
  const timelineMap: Record<string, number> = {}
  ballots.forEach((b) => {
    const hour = new Date(b.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      hour12: true,
    })
    timelineMap[hour] = (timelineMap[hour] || 0) + 1
  })
  const timelineData: TimelinePoint[] = Object.entries(timelineMap).map(
    ([time, count]) => ({ time, count })
  )

  const totalCandidates = rolesData.reduce((sum, r) => sum + r.candidates.length, 0)

  // ── Export data (passed to header actions) ───────────────────────────────────
  const exportData: ResultsExportData = {
    electionName: election.name,
    organizationName: election.organization.name,
    orgLogo: election.organization.logo,
    allowCustomBranding,
    roleResults,
    stats: {
      totalVoters,
      ballotsCast: totalBallots,
      turnoutPercentage,
      totalRoles: rolesData.length,
      totalCandidates,
    },
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <Suspense fallback={<div className="h-40 border-b bg-background/50 animate-pulse" />}>
        <ElectionPageHeader
          electionId={electionId}
          title="Results"
          description="View live election results"
          icon={ChartHistogramIcon}
          showSettings={false}
          actions={<ResultsActions exportData={exportData} />}
        />
      </Suspense>

      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <Suspense fallback={<ResultsDashboardSkeleton />}>
          <ResultsDashboard
            electionName={election.name}
            electionStatus={election.status}
            isFinalized={election.result?.isFinalized ?? false}
            finalizedAt={election.result?.finalizedAt ?? null}
            stats={{
              totalVoters,
              ballotsCast: totalBallots,
              turnoutPercentage,
              totalRoles: rolesData.length,
              totalCandidates,
            }}
            roleResults={roleResults}
            categoryTurnout={categoryTurnout}
            timelineData={timelineData}
          />
        </Suspense>
      </div>
    </div>
  )
}
