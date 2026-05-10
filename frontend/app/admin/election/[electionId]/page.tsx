import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { requireElectionAccess } from "@/lib/authz"
import { UserRole, SystemStatus } from "@prisma/client"
import { ActivityTimeline, type ActivityItem } from "../../organization/_components/ActivityTimeline"
import { TurnoutVelocity } from "../../organization/_components/TurnoutVelocity"
import { DashboardHeader } from "./_components/DashboardHeader"
import { MetricCards } from "./_components/MetricCards"
import { ManagementCore } from "./_components/ManagementCore"
import { VotersSnapshot } from "./_components/VotersSnapshot"
import { RolesSnapshot } from "./_components/RolesSnapshot"
import { AccessControlCard } from "./_components/AccessControlCard"
import { ConfigurationCard } from "./_components/ConfigurationCard"
import { DashboardPoller } from "../../organization/_components/DashboardPoller"

export const revalidate = 30

export default async function ElectionDashboardPage({
    params
}: {
    params: Promise<{ electionId: string }>
}) {
    const session = await auth()
    const electionId = (await params).electionId

    const access = await requireElectionAccess(session?.user, electionId, [
        UserRole.ORG_ADMIN,
        UserRole.STAFF,
        UserRole.VIEWER,
    ])

    const orgId = access.organizationId

    // Parallel fetch for election-specific data
    const [
        election,
        organization,
        latestAuditLogs,
        activeSystems,
        pendingSystems,
        recentBallotActivity,
    ] = await Promise.all([
        db.election.findUnique({
            where: { id: electionId, organizationId: orgId },
            include: {
                _count: {
                    select: {
                        voters: true,
                        ballots: true,
                        roles: true,
                    }
                },
                roles: {
                    include: {
                        _count: {
                            select: { candidates: true }
                        },
                        candidates: {
                            take: 3,
                            select: { name: true }
                        }
                    }
                },
                settings: true,
            }
        }),
        db.organization.findUnique({
            where: { id: orgId },
            select: { name: true, logo: true }
        }),
        db.adminAuditLog.findMany({
            where: {
                organizationId: orgId,
                entityId: electionId,
            },
            orderBy: { createdAt: "desc" },
            take: 6,
            include: {
                admin: {
                    select: { name: true, email: true }
                }
            }
        }),
        // Count systems currently assigned to this election
        db.systemElectionAccess.count({
            where: { electionId, system: { status: SystemStatus.APPROVED } }
        }),
        db.systemElectionAccess.count({
            where: { electionId, system: { status: SystemStatus.PENDING } }
        }),
        // Fetch recent ballot activity for turnout velocity
        db.ballot.findMany({
            where: {
                electionId: electionId,
                createdAt: { gt: new Date(Date.now() - 12 * 60 * 60 * 1000) }
            },
            select: { createdAt: true },
            orderBy: { createdAt: "asc" }
        }),
    ])

    if (!election || !organization) notFound()

    const totalCandidates = election.roles.reduce((acc, role) => acc + role._count.candidates, 0)
    const turnoutPct = election._count.voters > 0
        ? Math.round((election._count.ballots / election._count.voters) * 100)
        : 0

    // Status color mapping
    const statusStyles: Record<string, string> = {
        ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        COMPLETED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        PAUSED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
    }

    // Map audit logs to ActivityItems
    const activities: ActivityItem[] = latestAuditLogs.map(log => {
        const adminName = log.admin?.name || log.admin?.email || "Administrator"
        let title = log.description || (log.action.charAt(0).toUpperCase() + log.action.slice(1).toLowerCase()).replace(/_/g, " ")
        let description = `By ${adminName}`

        switch (log.action) {
            case "ELECTION_CREATED":
            case "ELECTION_UPDATED":
            case "ELECTION_STATUS_CHANGED":
                title = (log.metadata as any)?.name || title
                description = `${log.action === "ELECTION_CREATED" ? "Created" : "Updated"} by ${adminName}`
                break
            case "CANDIDATE_ADDED":
            case "CANDIDATE_UPDATED":
                title = (log.metadata as any)?.name ? `"${(log.metadata as any).name}"` : title
                description = `${log.action === "CANDIDATE_ADDED" ? "Candidate added" : "Candidate updated"} by ${adminName}`
                break
            case "CANDIDATE_REMOVED":
            case "CANDIDATE_DELETED":
                title = (log.metadata as any)?.name ? `"${(log.metadata as any).name}"` : title
                description = `Candidate removed by ${adminName}`
                break
            case "ROLE_CREATED":
            case "ROLE_DELETED":
                title = (log.metadata as any)?.title || title
                description = `${log.action === "ROLE_CREATED" ? "Role created" : "Role deleted"} by ${adminName}`
                break
            case "VOTER_ADDED":
            case "VOTER_DELETED":
                title = (log.metadata as any)?.identifier || (log.metadata as any)?.email || title
                description = `${log.action === "VOTER_ADDED" ? "Voter added" : "Voter removed"} by ${adminName}`
                break
            case "ELECTION_CODE_REVEALED":
            case "ELECTION_CODE_COPIED":
                title = "Election code accessed"
                description = `By ${adminName}`
                break
        }

        return {
            id: log.id,
            type: "ELECTION",
            action: log.action,
            title,
            description,
            timestamp: log.createdAt,
            status: "SUCCESS"
        }
    })

    // Prepare data for Turnout Velocity chart
    const turnoutData = Array.from({ length: 12 }, (_, i) => {
        const hour = new Date(Date.now() - (11 - i) * 60 * 60 * 1000)
        hour.setMinutes(0, 0, 0)
        const count = recentBallotActivity.filter(b => {
            const bHour = new Date(b.createdAt)
            bHour.setMinutes(0, 0, 0)
            return bHour.getTime() === hour.getTime()
        }).length
        return {
            time: hour.toLocaleTimeString([], { hour: 'numeric', hour12: true }),
            ballots: count
        }
    })

    return (
        <div className="flex flex-col w-full min-h-screen pb-16">
            <DashboardPoller />
            <DashboardHeader
                election={election}
                organization={organization}
                statusStyles={statusStyles}
            />

            <div className="flex-1 px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
                <MetricCards
                    election={election}
                    turnoutPct={turnoutPct}
                    totalCandidates={totalCandidates}
                    activeSystems={activeSystems}
                    pendingSystems={pendingSystems}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Management Core */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Turnout Summary Chart */}
                        {election._count.ballots > 0 && (
                            <TurnoutVelocity data={turnoutData} />
                        )}

                        <ManagementCore electionId={electionId} />

                        {/* Election Activity */}
                        <ActivityTimeline
                            activities={activities}
                            title="Election Activity"
                            description="Recent changes and events for this election"
                            auditHref={access.role === UserRole.ORG_ADMIN ? "/admin/organization/audit" : undefined}
                        />
                    </div>

                    {/* Sidebar: Access & Information */}
                    <div className="space-y-6">
                        <RolesSnapshot
                            electionId={electionId}
                            roles={election.roles}
                            totalRoles={election._count.roles}
                            totalCandidates={totalCandidates}
                        />

                        <VotersSnapshot
                            electionId={electionId}
                            totalVoters={election._count.voters}
                            totalBallots={election._count.ballots}
                        />

                        <AccessControlCard
                            electionId={electionId}
                            code={election.code}
                        />

                        <ConfigurationCard
                            electionId={electionId}
                            settings={election.settings}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
