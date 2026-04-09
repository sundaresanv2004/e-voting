import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import ResultsHero from "./_components/ResultsHero"
import { ResultsDashboard } from "./_components/ResultsDashboard"

export default async function ResultsPage({
  params
}: {
  params: Promise<{ electionId: string }>
}) {
  const session = await auth()
  const electionId = (await params).electionId

  if (!session?.user?.organizationId) redirect("/auth/login")

  // Fetch election and core counters
  const election = await db.election.findUnique({
    where: { 
      id: electionId,
      organizationId: session.user.organizationId 
    },
    select: {
      name: true,
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

  // Calculate results data
  const totalBallots = election._count.ballots
  const totalVoters = election._count.voters
  const turnoutPercentage = totalVoters > 0 ? (totalBallots / totalVoters) * 100 : 0

  const roleResults = rolesData.map(role => {
    const totalVotes = role.candidates.reduce((sum, c) => sum + c._count.votes, 0)
    
    const candidates = role.candidates.map(candidate => ({
      id: candidate.id,
      name: candidate.name,
      profileImage: candidate.profileImage,
      voteCount: candidate._count.votes,
      percentage: totalVotes > 0 ? (candidate._count.votes / totalVotes) * 100 : 0,
      isLeading: false // We'll calculate this below
    }))

    // Sort by vote count descending
    candidates.sort((a, b) => b.voteCount - a.voteCount)

    // Mark the leading candidate(s)
    if (candidates.length > 0 && candidates[0].voteCount > 0) {
      candidates[0].isLeading = true
    }

    return {
      id: role.id,
      name: role.name,
      candidates,
      totalVotes
    }
  })

  return (
    <div className="flex flex-col w-full min-h-screen">
      <ResultsHero 
        title="Election Results" 
        subtitle={election.name} 
      />

      <div className="flex-1 py-10 px-4 md:px-8 w-full max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <ResultsDashboard 
          stats={{
            totalVoters,
            ballotsCast: totalBallots,
            turnoutPercentage
          }}
          roleResults={roleResults}
        />
      </div>
    </div>
  )
}
