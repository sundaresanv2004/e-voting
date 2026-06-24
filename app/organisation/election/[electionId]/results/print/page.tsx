import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { requireOrgMember } from "@/lib/auth/access"
import { AutoPrint } from "./_components/auto-print"
import { PrintableImage } from "./_components/printable-image"
import Image from "next/image"
import { format } from "date-fns"

export const revalidate = 30

export default async function PrintResultsPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  const { member } = await requireOrgMember()
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Local"

  if (member.role !== "org_admin" && member.role !== "staff") {
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
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white text-black font-sans">
        <h1 className="text-2xl font-bold">Results are Locked</h1>
        <p className="mt-2 text-gray-600">The results for this election are currently locked for security and secrecy. No one can view or print the results until they are unlocked.</p>
      </div>
    )
  }

  const allowCustomBranding = election.organization.settings?.allowCustomBranding ?? false

  // ── Fetch all data in parallel ─────────────────────────────────────────────
  const [
    rolesData,
    ballots,
    uniqueVotersVoted,
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
    db.voter.count({ where: { electionId, ballotCount: { gt: 0 } } }),
  ])

  // ── Aggregations ─────────────────────────────────────────────────────────────
  const totalBallots = election._count.ballots
  const totalVoters = election._count.voters
  const anonymousBallotCount = ballots.filter(b => b.isAnonymous).length
  const namedBallotCount = totalBallots - anonymousBallotCount
  
  const turnoutPercentage = totalVoters > 0 ? (namedBallotCount / totalVoters) * 100 : 0
  const participationRate = totalVoters > 0 ? (uniqueVotersVoted / totalVoters) * 100 : 0
  const totalCandidates = rolesData.reduce((sum, r) => sum + r.candidates.length, 0)

  // Role results with leading detection
  const roleResults = rolesData.map((role) => {
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

    if (candidates.length > 0 && candidates[0].voteCount > 0) {
      const topCount = candidates[0].voteCount
      candidates.forEach((c) => { if (c.voteCount === topCount) c.isLeading = true })
    }

    return { id: role.id, name: role.name, order: role.order, totalVotes, candidates }
  })

  return (
    <div className="min-h-screen bg-white text-black font-sans p-8 md:p-12 print:p-0 print:max-w-none print:w-full print:mx-0 light max-w-[1000px] mx-auto selection:bg-gray-200">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hide app layout chrome on screen so the print page looks like a clean document */
        aside, [data-sidebar], [data-slot="sidebar"], header, [data-slot="page-header"], nav { display: none !important; }
        body > *:not(script):not(style):not(noscript):not([data-radix-portal]), #__next, main, [data-slot="sidebar-inset"], [data-slot="page-content"] { 
          width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important;
        }
        @media print {
          @page { margin: 0; }
          body { padding: 0 8mm; }
        }
      `}} />
      <AutoPrint />

      <table className="w-full border-collapse border-0">
        {/* Invisible header to simulate top page margin on every printed page */}
        <thead className="table-header-group">
          <tr><td className="h-12 border-0"></td></tr>
        </thead>
        
        <tbody className="table-row-group">
          <tr><td className="border-0 p-0">

      {/* ── Header Section ── */}
      <div className="flex flex-col items-center text-center mb-10 pb-6 border-b-2 border-gray-200 print:break-inside-avoid">
        {allowCustomBranding && election.organization.logo && (
          <div className="mb-6 w-full flex justify-center">
            <div className="relative w-full max-w-[240px] aspect-[16/4]">
              {/* Using PrintableImage for print reliability and fast pre-loading */}
              <PrintableImage 
                src={election.organization.logo} 
                alt={election.organization.name} 
                fallbackText="Org Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">
          {election.organization.name}
        </h1>
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          {election.name}
        </h2>
        
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-gray-300 bg-gray-50 text-gray-800 font-semibold text-sm">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Official Results
        </div>
      </div>

      {/* ── Overall Summary ── */}
      <div className="mb-10 print:break-inside-avoid">
        <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Election Summary
        </h3>
        <div className={`grid grid-cols-2 gap-4 ${totalVoters > 0 ? 'md:grid-cols-4' : ''}`}>
          {totalVoters > 0 && (
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Eligible Voters</span>
              <span className="text-2xl font-black text-gray-900">{totalVoters.toLocaleString()}</span>
            </div>
          )}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center text-center">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Ballots Cast</span>
            <span className="text-2xl font-black text-gray-900">{totalBallots.toLocaleString()}</span>
          </div>
          {totalVoters > 0 && (
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Turnout</span>
              <span className="text-2xl font-black text-gray-900">{turnoutPercentage.toFixed(1)}%</span>
            </div>
          )}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center text-center">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Positions</span>
            <span className="text-2xl font-black text-gray-900">{rolesData.length}</span>
          </div>
        </div>
      </div>

      {/* ── Winners Summary ── */}
      <div className="mb-12">
        <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 mb-4 border-b border-gray-200 pb-2">
          Winners Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roleResults.map((role) => {
            const winners = role.candidates.filter(c => c.isLeading);
            if (winners.length === 0 || winners[0].voteCount === 0) return null;

            return (
              <div key={role.id} className="border border-gray-300 rounded-xl overflow-hidden print:break-inside-avoid shadow-sm">
                <div className="bg-green-600 text-white px-4 py-2 font-bold uppercase text-sm flex justify-between items-center">
                  <span>{role.name}</span>
                  <span className="text-green-100 text-xs">{role.totalVotes} Total Votes</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {winners.map((winner) => (
                    <div key={winner.id} className="p-4 flex items-center gap-4 bg-green-50/30">
                      <div className="shrink-0">
                        {/* Profile Image */}
                        {winner.profileImage ? (
                          <div className="w-24 aspect-[3/4] rounded-lg border border-gray-300 bg-gray-100 p-0.5 overflow-hidden flex flex-col items-center justify-center relative shrink-0">
                            <div className="relative w-full h-full">
                              <PrintableImage 
                                src={winner.profileImage} 
                                alt={winner.name} 
                                fallbackText="No Image"
                                className="w-full h-full object-cover rounded-md" 
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 aspect-[3/4] rounded-lg border border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400 shrink-0 p-1">
                            <span className="text-[8px] uppercase font-bold tracking-wider text-center leading-tight">No Image</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 leading-tight">{winner.name}</h4>
                        <p className="text-sm text-green-700 font-semibold mt-0.5">{winner.voteCount.toLocaleString()} Votes ({winner.percentage.toFixed(1)}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Detailed Role Summary ── */}
      <div className="mb-8">
        <h3 className="text-lg font-bold uppercase tracking-widest text-gray-900 mb-6 border-b border-gray-200 pb-2">
          Detailed Results By Position
        </h3>
        
        <div className="space-y-8">
          {roleResults.map((role, idx) => (
            <div key={role.id} className="print:break-inside-avoid">
              <div className="flex justify-between items-end mb-3">
                <h4 className="font-bold text-gray-900 text-base">
                  <span className="text-gray-400 mr-2">{String(idx + 1).padStart(2, '0')}</span> 
                  {role.name.toUpperCase()}
                </h4>
                <div className="text-sm font-semibold text-gray-500">
                  {role.totalVotes.toLocaleString()} Votes Cast
                </div>
              </div>
              
              <div className="border border-gray-300 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="py-2.5 px-4 font-bold text-gray-700 w-12 text-center">#</th>
                      <th className="py-2.5 px-4 font-bold text-gray-700">Candidate</th>
                      <th className="py-2.5 px-4 font-bold text-gray-700 text-right w-32">Votes</th>
                      <th className="py-2.5 px-4 font-bold text-gray-700 text-right w-24">Share</th>
                      <th className="py-2.5 px-4 font-bold text-gray-700 text-center w-32">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {role.candidates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 px-4 text-center text-gray-500 italic">No candidates</td>
                      </tr>
                    ) : (
                      role.candidates.map((c, i) => (
                        <tr key={c.id} className={c.isLeading && c.voteCount > 0 ? "bg-green-50/50" : ""}>
                          <td className="py-2.5 px-4 text-center font-medium text-gray-500">{i + 1}</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900">{c.name}</td>
                          <td className="py-2.5 px-4 text-right font-semibold text-gray-800">{c.voteCount.toLocaleString()}</td>
                          <td className="py-2.5 px-4 text-right text-gray-600">{c.percentage.toFixed(1)}%</td>
                          <td className="py-2.5 px-4 text-center">
                            {c.isLeading && c.voteCount > 0 ? (
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                WINNER
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

          </td></tr>
        </tbody>

        {/* Repeating footer on every printed page */}
        <tfoot className="table-footer-group">
          <tr><td className="border-0 align-bottom pt-8 pb-12">
            <div className="w-full bg-white pt-4 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-500 font-medium">
              <div>
                Official Document • {election.organization.name}
              </div>
              <div className="text-right">
                Printed on {format(new Date(), "MMM d, yyyy h:mm:ss a")} • IP: {ip}
              </div>
            </div>
          </td></tr>
        </tfoot>
      </table>

    </div>
  )
}
