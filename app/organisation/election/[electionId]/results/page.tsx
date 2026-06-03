import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { ChartHistogramIcon } from "@hugeicons/core-free-icons"

import { db } from "@/lib/db"
import { requireOrgMember } from "@/lib/auth/access"
import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { HugeiconsIcon } from "@hugeicons/react"
import { LockPasswordIcon } from "@hugeicons/core-free-icons"

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

  if (member.role === "viewer") {
    redirect(`/organisation/election/${electionId}`)
  }

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
        select: { isFinalized: true, finalizedAt: true, generatedAt: true, generatedBy: { select: { name: true } } },
      },
      settings: {
        select: {
          lockResult: true,
          allowOnlineVoting: true,
          authorizeVoters: true,
          showCandidateProfiles: true,
          showCandidateSymbols: true,
          shuffleCandidates: true,
          allowMultipleVotes: true,
          allowNota: true,
          showSummary: true,
          quickElection: true,
          maxVotesPerUser: true,
        },
      },
      _count: { select: { ballots: true, voters: true } },
    },
  })

  if (!election) notFound()

  if (election.settings?.lockResult) {
    return (
      <div className="flex flex-col flex-1 w-full">
        <ElectionPageHeader 
          electionId={electionId} 
          title="Results" 
          description="Election results and analytics"
          icon={ChartHistogramIcon} 
        />
        <div className="px-4 md:px-8 py-16 max-w-[800px] mx-auto w-full flex flex-col mt-8">
          <Alert variant="default" className="bg-muted/30 border-muted">
            <HugeiconsIcon icon={LockPasswordIcon} className="size-5 !text-current mt-0.5" />
            <AlertTitle className="font-semibold text-lg ml-2">Results are Locked</AlertTitle>
            <AlertDescription className="text-muted-foreground text-sm mt-1 ml-2 leading-relaxed">
              The results for this election are currently locked for security and secrecy. No one can view the results or generate reports until they are unlocked.
              <br /><br />
              To view the results, please go to the <strong>Election Settings</strong> and disable the "Lock Results Page" option.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const allowCustomBranding = election.organization.settings?.allowCustomBranding ?? false

  // ── Fetch all data in parallel ─────────────────────────────────────────────
  const [
    rolesData,
    ballots,
    categories,
    uniqueVotersVoted,
    nonVoters,
    notaCount,
  ] = await Promise.all([
    db.electionRole.findMany({
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
    }),
    db.ballot.findMany({
      where: {
        electionId,
        election: { organizationId: member.organizationId, deletedAt: null },
        deletedAt: null,
      },
      select: { createdAt: true, categoryId: true, voterId: true, isAnonymous: true, ipAddress: true },
      orderBy: { createdAt: "asc" },
    }),
    db.electionCategory.findMany({
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
    }),
    db.voter.count({ where: { electionId, ballotCount: { gt: 0 } } }),
    db.voter.findMany({
      where: { electionId, ballotCount: 0 },
      select: { id: true, name: true, uniqueId: true, category: { select: { name: true } } },
      orderBy: { name: "asc" },
      take: 200,
    }),
    db.vote.count({
      where: { ballot: { electionId }, candidateId: null, deletedAt: null },
    }),
  ])

  // ── Aggregations ─────────────────────────────────────────────────────────────

  const totalBallots = election._count.ballots
  const totalVoters = election._count.voters
  const anonymousBallotCount = ballots.filter(b => b.isAnonymous).length
  const namedBallotCount = totalBallots - anonymousBallotCount
  
  const turnoutPercentage = totalVoters > 0 ? (namedBallotCount / totalVoters) * 100 : 0
  const participationRate = totalVoters > 0 ? (uniqueVotersVoted / totalVoters) * 100 : 0
  
  const ipDiversity = new Set(ballots.map(b => b.ipAddress).filter(Boolean)).size
  
  // Determine if election is anonymous based on ballots or setting (if we had one)
  // For now, if any ballot is anonymous, we'll consider it anonymous for privacy
  const isAnonymous = anonymousBallotCount > 0

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
  const categoryTurnout: CategoryTurnout[] = categories.map((cat) => {
    const namedBallotsInCat = ballots.filter(b => b.categoryId === cat.id && !b.isAnonymous).length
    return {
      id: cat.id,
      name: cat.name,
      code: cat.code,
      totalVoters: cat._count.voters,
      ballotsCast: namedBallotsInCat,
      turnoutPercentage: cat._count.voters > 0
        ? (namedBallotsInCat / cat._count.voters) * 100
        : 0,
    }
  })

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

  // IP Stats computation
  const ipStatsMap: Record<string, { count: number; lastActivity: Date }> = {}
  ballots.forEach((b) => {
    if (!b.ipAddress) return
    const ip = b.ipAddress
    if (!ipStatsMap[ip]) {
      ipStatsMap[ip] = { count: 0, lastActivity: b.createdAt }
    }
    ipStatsMap[ip].count += 1
    if (new Date(b.createdAt) > new Date(ipStatsMap[ip].lastActivity)) {
      ipStatsMap[ip].lastActivity = b.createdAt
    }
  })
  const ipStats = Object.entries(ipStatsMap)
    .map(([ipAddress, data]) => ({
      ipAddress,
      ballotCount: data.count,
      lastActivity: data.lastActivity,
    }))
    .sort((a, b) => b.ballotCount - a.ballotCount)

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
      anonymousBallots: anonymousBallotCount,
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
            electionId={electionId}
            electionName={election.name}
            electionStatus={election.status}
            isFinalized={election.result?.isFinalized ?? false}
            finalizedAt={election.result?.finalizedAt ?? null}
            stats={{
              totalVoters,
              ballotsCast: totalBallots,
              turnoutPercentage,
              participationRate,
              totalRoles: rolesData.length,
              totalCandidates,
            }}
            roleResults={roleResults}
            categoryTurnout={categoryTurnout}
            timelineData={timelineData}
            uniqueVotersVoted={uniqueVotersVoted}
            nonVoters={nonVoters}
            notaCount={election.settings?.allowNota ? notaCount : 0}
            anonymousBallotCount={anonymousBallotCount}
            ipDiversity={ipDiversity}
            ipStats={ipStats}
            electionSettings={election.settings!}
            isAnonymous={isAnonymous}
            userRole={member.role}
          />
        </Suspense>
      </div>
    </div>
  )
}
