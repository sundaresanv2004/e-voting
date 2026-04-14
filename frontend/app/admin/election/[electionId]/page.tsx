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
  ArrowRight01Icon
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format } from "date-fns"

export default async function ElectionDashboardPage({
    params
}: {
    params: Promise<{ electionId: string }>
}) {
    const session = await auth()
    const electionId = (await params).electionId
    const orgId = session?.user?.organizationId

    if (!orgId) redirect("/auth/login")

    const election = await db.election.findUnique({
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
                    }
                }
            }
        }
    })

    if (!election) notFound()

    const totalCandidates = election.roles.reduce((acc, role) => acc + role._count.candidates, 0)
    
    // Status color mapping
    const statusColors: Record<string, string> = {
        ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        COMPLETED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
        PAUSED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    }

    const stats = [
        {
            title: "Total Voters",
            value: election._count.voters,
            description: "Registered Admission IDs",
            icon: UserCircleIcon,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
        },
        {
            title: "Ballots Cast",
            value: election._count.ballots,
            description: `${election._count.voters > 0 ? ((election._count.ballots / election._count.voters) * 100).toFixed(1) : 0}% Turnout`,
            icon: InvoiceIcon,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
        },
        {
            title: "Candidates",
            value: totalCandidates,
            description: `Across ${election._count.roles} roles`,
            icon: UserGroupIcon,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
        },
        {
            title: "Positions",
            value: election._count.roles,
            description: "Contested roles",
            icon: ShieldKeyIcon,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
        },
    ]

    return (
        <div className="flex flex-col w-full min-h-screen pb-12">
            {/* Hero Header */}
            <div className="relative overflow-hidden border-b bg-card py-10 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">
                                {election.name}
                            </h1>
                            <Badge variant="outline" className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[election.status] || ""}`}>
                                {election.status}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4" />
                                <span>{format(election.startTime, "MMM d, h:mm a")} — {format(election.endTime, "MMM d, h:mm a")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={MapsIcon} className="w-4 h-4" />
                                <span className="font-mono">Code: {election.code}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/election/${electionId}/settings`}>
                            <Button variant="outline" className="rounded-xl px-6 font-bold">Manage Settings</Button>
                        </Link>
                    </div>
                </div>
                
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, i) => (
                        <Card key={i} className="border-none shadow-sm ring-1 ring-border/50 hover:ring-primary/20 transition-all duration-300 overflow-hidden group">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-4">
                                        <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                            <HugeiconsIcon icon={stat.icon} className="w-6 h-6" strokeWidth={2} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-muted-foreground/70 uppercase tracking-widest">{stat.title}</p>
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-3xl font-black tracking-tight">{stat.value.toLocaleString()}</h3>
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground">{stat.description}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Recent & Controls */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-none shadow-sm ring-1 ring-border/50">
                            <CardHeader className="border-b bg-muted/20 pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-xl font-black">Election Overview</CardTitle>
                                        <CardDescription>Quick access to election management</CardDescription>
                                    </div>
                                    <HugeiconsIcon icon={DashboardCircleIcon} className="w-6 h-6 text-muted-foreground opacity-50" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid grid-cols-1 md:grid-cols-2">
                                    {[
                                        { label: "Voter Management", desc: "Manage students and Admission IDs", href: "voters", icon: UserCircleIcon },
                                        { label: "Candidate Profiles", desc: "Set up candidates and symbols", href: "candidates", icon: UserGroupIcon },
                                        { label: "Election Roles", desc: "Configure positional contests", href: "roles", icon: ShieldKeyIcon },
                                        { label: "Real-time Results", desc: "Monitor ballot counts and data", href: "results", icon: InvoiceIcon },
                                    ].map((item, idx) => (
                                        <Link 
                                            key={idx} 
                                            href={`/admin/election/${electionId}/${item.href}`}
                                            className="p-6 hover:bg-muted/30 transition-colors border-b last:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0 md:[&:nth-child(2n+1)]:border-r flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    <HugeiconsIcon icon={item.icon} className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-bold text-sm tracking-tight">{item.label}</p>
                                                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                </div>
                                            </div>
                                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Side: Info & Context */}
                    <div className="space-y-8">
                        <Card className="border-none shadow-sm ring-1 ring-border/50 bg-primary/[0.02]">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Admin Information</CardTitle>
                                <CardDescription>Key election details for your records</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border shadow-sm">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Election Identifier</p>
                                        <p className="font-mono text-xs font-bold text-primary break-all">{election.id}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-card border shadow-sm">
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Terminal Registration Code</p>
                                        <p className="font-mono text-lg font-black tracking-widest">{election.code}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">Use this code in the Electron App to pair voting terminals.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
