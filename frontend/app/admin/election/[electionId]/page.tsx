import { auth } from "@/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  UserGroupIcon, 
  UserCircleIcon, 
  InvoiceIcon, 
  Calendar01Icon,
  MapsIcon,
  ShieldKeyIcon,
  DashboardCircleIcon,
  ArrowRight01Icon,
  Settings02Icon,
  Archive01Icon,
  ComputerIcon,
  Building06Icon,
  Activity01Icon
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"
import { requireElectionAccess } from "@/lib/authz"
import { UserRole, AuditEntityType, SystemStatus } from "@prisma/client"
import { CopyRevealCode } from "./_components/CopyRevealCode"
import { ActivityTimeline, type ActivityItem } from "../../organization/_components/ActivityTimeline"
import { TurnoutVelocity } from "../../organization/_components/TurnoutVelocity"
import Image from "next/image"

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
        return {
            id: log.id,
            type: "ELECTION",
            title: log.description || log.action.replace(/_/g, " "),
            description: `By ${adminName}`,
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
            {/* Premium Header Style */}
            <div className="relative overflow-hidden bg-background/50 border-b lg:backdrop-blur-xl">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/5 blur-[100px] animate-pulse" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-blue-500/5 blur-[100px] animate-pulse" />
                </div>

                <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="absolute -inset-1 rounded-[18px] bg-gradient-to-tr from-primary/40 to-blue-500/40 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-card text-primary shadow-sm ring-1 ring-border/50 overflow-hidden transition-transform group-hover:rotate-3 duration-300">
                                {organization.logo ? (
                                    <Image src={organization.logo} alt={organization.name} fill className="object-cover" sizes="56px" />
                                ) : (
                                    <HugeiconsIcon icon={Building06Icon} className="h-7 w-7 relative z-10" color="currentColor" />
                                )}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                    {election.name}
                                </h1>
                                <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none ${statusStyles[election.status]}`}>
                                    {election.status}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-semibold tracking-wide">
                                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-primary/70" />
                                <p>{format(election.startTime, "PPP")} — {format(election.endTime, "PPP")}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/election/${electionId}/settings`}>
                            <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm active:scale-[0.98] transition-all">
                                <HugeiconsIcon icon={Settings02Icon} className="h-4 w-4" />
                                <span>Settings</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
                {/* Metric Cards Row */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard title="Voters" value={election._count.voters} description="Total Registered" icon={UserCircleIcon} color="text-blue-600" />
                    <MetricCard 
                        title="Turnout" 
                        value={`${turnoutPct}%`} 
                        description={`${election._count.ballots} Ballots Cast`} 
                        icon={InvoiceIcon} 
                        color={turnoutPct > 50 ? "text-emerald-600" : "text-amber-600"} 
                    />
                    <MetricCard title="Candidates" value={totalCandidates} description={`Across ${election._count.roles} Positions`} icon={UserGroupIcon} color="text-indigo-600" />
                    <MetricCard title="Systems" value={activeSystems} description={`${pendingSystems} Awaiting Setup`} icon={ComputerIcon} color="text-purple-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Management Core */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Turnout Summary Chart */}
                        {election._count.ballots > 0 && (
                            <TurnoutVelocity data={turnoutData} />
                        )}
                        
                        <Card className="border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="border-b bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black tracking-tight">Management Core</CardTitle>
                                        <CardDescription className="text-xs font-bold uppercase tracking-wider">Configure and monitor your election</CardDescription>
                                    </div>
                                    <HugeiconsIcon icon={DashboardCircleIcon} className="h-8 w-8 text-primary/20" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2">
                                    <NavEntry 
                                        title="Voter Database" 
                                        desc="Admission IDs & Eligibility" 
                                        href={`/admin/election/${electionId}/voters`} 
                                        icon={UserCircleIcon} 
                                    />
                                    <NavEntry 
                                        title="Candidate Slate" 
                                        desc="Profiles & Symbol Setup" 
                                        href={`/admin/election/${electionId}/candidates`} 
                                        icon={UserGroupIcon} 
                                    />
                                    <NavEntry 
                                        title="Contested Roles" 
                                        desc="Position Configuration" 
                                        href={`/admin/election/${electionId}/roles`} 
                                        icon={ShieldKeyIcon} 
                                    />
                                    <NavEntry 
                                        title="Results" 
                                        desc="Data Verification & Export" 
                                        href={`/admin/election/${electionId}/results`} 
                                        icon={InvoiceIcon} 
                                        isSpecial
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Roles & Candidates Summary */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                    <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-indigo-500" />
                                    Candidate Slate Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {election.roles.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">No roles configured yet.</div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {election.roles.map((role) => (
                                            <div key={role.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{role.name}</p>
                                                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-0.5">
                                                        {role._count.candidates} Candidates
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {role.candidates.length > 0 ? (
                                                        <>
                                                            {role.candidates.map(c => (
                                                                <Badge key={c.name} variant="secondary" className="text-[10px] font-bold bg-muted/50">
                                                                    {c.name}
                                                                </Badge>
                                                            ))}
                                                            {role._count.candidates > 3 && (
                                                                <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                                                                    +{role._count.candidates - 3} more
                                                                </Badge>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground/60 italic">No candidates</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Security Pulse */}
                        <ActivityTimeline activities={activities} />
                    </div>

                    {/* Sidebar: Access & Information */}
                    <div className="space-y-6">
                        <Card className="border-border/50 shadow-sm bg-primary/[0.01]">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-black tracking-tight">Access Control</CardTitle>
                                <CardDescription className="text-[10px] font-black uppercase tracking-widest">Election authorization details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <CopyRevealCode code={election.code} electionId={electionId} />
                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                                    <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1.5">
                                        <HugeiconsIcon icon={Archive01Icon} className="h-3 w-3" />
                                        Important Note
                                    </p>
                                    <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                                        Use the access code above in the <strong>Desktop Terminal App</strong> to pair hardware devices for this specific election. 
                                        Sharing this code allows device authorization.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Secondary Stats */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground/70">Configuration</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b last:border-0">
                                    <span className="text-xs font-bold text-muted-foreground">Multiple Voting</span>
                                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter">
                                        {election.settings?.allowMultipleVotes ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b last:border-0">
                                    <span className="text-xs font-bold text-muted-foreground">NOTA Option</span>
                                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter">
                                        {election.settings?.allowNota ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b last:border-0">
                                    <span className="text-xs font-bold text-muted-foreground">Offline Voting</span>
                                    <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-tighter">
                                        {election.settings?.allowOfflineVoting ? "Primary" : "Disabled"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, description, icon, color }: any) {
  return (
    <Card className="relative overflow-hidden group transition-all duration-300 border-border/50">
      <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-colors" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          {title}
        </CardTitle>
        <HugeiconsIcon icon={icon} className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tighter">{value}</div>
        <p className="text-[10px] font-bold text-muted-foreground/70 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function NavEntry({ title, desc, href, icon, isSpecial }: any) {
    return (
        <Link 
            href={href}
            className={`p-6 hover:bg-muted/40 transition-all border-b sm:border-r last:border-b-0 sm:[&:nth-child(2n)]:border-r-0 flex items-center justify-between group ${isSpecial ? "bg-primary/[0.02]" : ""}`}
        >
            <div className="flex items-center gap-4">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 ${isSpecial ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
                    <HugeiconsIcon icon={icon} className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                    <p className="font-black text-sm tracking-tight">{title}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{desc}</p>
                </div>
            </div>
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Link>
    )
}
