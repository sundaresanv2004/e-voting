import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import ResultsHero from "./_components/ResultsHero"
import { ResultsDashboard } from "./_components/ResultsDashboard"
import { LiveToggle } from "./_components/LiveToggle"
import { ResultsExport } from "./_components/ResultsExport"

export default async function ResultsPage({
  params
}: {
  params: Promise<{ electionId: string }>
}) {
  const session = await auth()
  const electionId = (await params).electionId

  if (!session?.user?.organizationId) redirect("/auth/login")

  // Fetch election with full context
  const election = await db.election.findUnique({
    where: {
      id: electionId,
      organizationId: session.user.organizationId
    },
    select: {
      name: true,
      status: true,
      startTime: true,
      endTime: true,
      _count: {
        select: {
          ballots: true,
          voters: true
        }
      }
    }
  })

  if (!election) redirect("/admin/organization/elections")

  // Fetch all roles with their candidates and vote counts
  const rolesData = await db.electionRole.findMany({
    where: { electionId },
    orderBy: { order: "asc" },
    include: {
      candidates: {
        include: {
          _count: {
            select: { votes: true }
          }
        }
      }
    }
  })

  // Fetch ballot timeline data (votes over time, grouped by hour)
  const ballots = await db.ballot.findMany({
    where: { electionId },
    select: {
      createdAt: true,
      system: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: "asc" }
  })

  // Calculate results data
  const totalBallots = election._count.ballots
  const totalVoters = election._count.voters
  const turnoutPercentage = totalVoters > 0 ? (totalBallots / totalVoters) * 100 : 0

  // System breakdown
  const systemBreakdown: Record<string, number> = {}
  ballots.forEach(b => {
    const name = b.system.name || "Unknown System"
    systemBreakdown[name] = (systemBreakdown[name] || 0) + 1
  })
  const systemData = Object.entries(systemBreakdown).map(([name, count]) => ({
    name,
    count,
    percentage: totalBallots > 0 ? (count / totalBallots) * 100 : 0
  })).sort((a, b) => b.count - a.count)

  // Voting timeline (hourly)
  const timelineMap: Record<string, number> = {}
  ballots.forEach(b => {
    const hour = new Date(b.createdAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      hour12: true
    })
    timelineMap[hour] = (timelineMap[hour] || 0) + 1
  })
  const timelineData = Object.entries(timelineMap).map(([time, count]) => ({
    time,
    count
  }))

  const roleResults = rolesData.map(role => {
    const totalVotes = role.candidates.reduce((sum, c) => sum + c._count.votes, 0)

    const candidates = role.candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      profileImage: candidate.profileImage,
      symbolImage: candidate.symbolImage,
      voteCount: candidate._count.votes,
      percentage: totalVotes > 0 ? (candidate._count.votes / totalVotes) * 100 : 0,
      isLeading: false
    }))

    // Sort by vote count descending
    candidates.sort((a, b) => b.voteCount - a.voteCount)

    // Mark the leading candidate(s) - handling ties
    if (candidates.length > 0 && candidates[0].voteCount > 0) {
      const topVoteCount = candidates[0].voteCount
      candidates.forEach(c => {
        if (c.voteCount === topVoteCount) {
          c.isLeading = true
        }
      })
    }

    return {
      id: role.id,
      name: role.name,
      order: role.order,
      candidates,
      totalVotes
    }
  })

  const totalCandidates = rolesData.reduce((sum, r) => sum + r.candidates.length, 0)

  return (
    <div className="flex flex-col w-full min-h-screen">
      <ResultsHero
        title="Election Results"
        subtitle={election.name}
        actions={
          <div className="flex items-center gap-6">
            <LiveToggle />
            <ResultsExport data={roleResults} electionName={election.name} />
          </div>
        }
      />

      <div className="flex-1 py-8 px-4 md:px-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <ResultsDashboard
          electionName={election.name}
          electionStatus={election.status}
          stats={{
            totalVoters,
            ballotsCast: totalBallots,
            turnoutPercentage,
            totalRoles: rolesData.length,
            totalCandidates
          }}
          roleResults={roleResults}
          systemData={systemData}
          timelineData={timelineData}
        />
      </div>
    </div>
  )
}
