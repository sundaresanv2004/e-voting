import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
    MapsIcon, 
    UserGroupIcon, 
    ComputerIcon,
    ArrowRight01Icon
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user?.id) {
        redirect("/auth/login")
    }

    const freshUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
            members: {
                take: 1,
                include: {
                    organization: true
                }
            }
        },
    })

    const org = freshUser?.members?.[0]?.organization

    if (!org) {
        redirect("/setup/organization")
    }

    return (
        <div className="flex-1 px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome to {org.name}</h1>
                <p className="text-muted-foreground">Manage your elections, members, and systems from the dashboard.</p>
            </div>

            {/* Metric Cards - Sleek modern glassmorphism aesthetic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 backdrop-blur-xl border-primary/10 hover:border-primary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <HugeiconsIcon icon={MapsIcon} className="h-4 w-4 text-blue-500" strokeWidth={2} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-xl border-primary/10 hover:border-primary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4 text-green-500" strokeWidth={2} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            You are the only member
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-xl border-primary/10 hover:border-primary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Authorized Systems</CardTitle>
                        <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4 text-purple-500" strokeWidth={2} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Pending authorizations
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <Card className="border border-border/50 bg-card/40 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Actions performed across your organization.</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                        No recent activity found.
                    </CardContent>
                </Card>

                <Card className="border border-border/50 bg-card/40 backdrop-blur-md flex flex-col justify-between">
                    <CardHeader>
                        <CardTitle>Quick Start</CardTitle>
                        <CardDescription>Get your organization up and running quickly.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-between hover:bg-primary/5 border-primary/20" asChild>
                            <Link href="/organisation/elections/new">
                                <span>Create an Election</span>
                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-between hover:bg-primary/5 border-primary/20" asChild>
                            <Link href="/organisation/members/invite">
                                <span>Invite Members</span>
                                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
