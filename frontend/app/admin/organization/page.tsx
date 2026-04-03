import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { DashboardHero } from "./_components/DashboardHero"
import { StatsGrid } from "./_components/StatsGrid"
import { RecentActivity, ActivityItem } from "./_components/RecentActivity"
import { ElectionStatus, SystemStatus } from "@prisma/client"

export default async function OrganizationDashboardPage() {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId) {
    redirect("/setup/organization")
  }

  // Optimize: Fetch all dashboard data in parallel
  const [
    organization,
    totalElections,
    activeElections,
    totalMembers,
    totalSystems,
    pendingSystems,
    totalBallots,
    latestElections,
    latestSystems,
  ] = await Promise.all([
    db.organization.findUnique({
      where: { id: orgId },
      select: { name: true, code: true }
    }),
    db.election.count({ where: { organizationId: orgId } }),
    db.election.count({ 
      where: { 
        organizationId: orgId,
        status: ElectionStatus.ACTIVE 
      } 
    }),
    db.user.count({ where: { organizationId: orgId } }),
    db.authorizedSystem.count({ where: { organizationId: orgId } }),
    db.authorizedSystem.count({ 
      where: { 
        organizationId: orgId,
        status: SystemStatus.PENDING 
      } 
    }),
    db.ballot.count({
      where: {
        election: { organizationId: orgId }
      }
    }),
    // For Activity Feed:
    db.election.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.authorizedSystem.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  if (!organization) {
    redirect("/setup/organization")
  }

  // Construct Activity Feed
  const activities: ActivityItem[] = [
    ...latestElections.map(e => ({
      id: e.id,
      type: "ELECTION" as const,
      title: e.name,
      description: `New election created: ${e.status.toLowerCase()}`,
      timestamp: e.createdAt,
      status: e.status,
    })),
    ...latestSystems.map(s => ({
      id: s.id,
      type: "SYSTEM" as const,
      title: s.name || s.hostName || "Unnamed System",
      description: `New hardware registration request: ${s.macAddress}`,
      timestamp: s.createdAt,
      status: s.status,
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 8)

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/5 pb-20 overflow-x-hidden">
      {/* 🚀 Hero Section: Welcome + Quick Actions */}
      <DashboardHero 
        orgName={organization.name} 
        orgCode={organization.code} 
      />

      {/* 📊 Metrics Section: Stat Cards */}
      <StatsGrid 
        totalElections={totalElections}
        activeElections={activeElections}
        totalMembers={totalMembers}
        approvedSystems={totalSystems - pendingSystems}
        pendingSystems={pendingSystems}
        totalBallots={totalBallots}
      />

      <div className="max-w-7xl mx-auto w-full px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* ⏱️ Activity Timeline */}
            <div className="lg:col-span-2">
                <RecentActivity activities={activities} />
            </div>

            {/* 🎯 Organization Summary Sidebar */}
            <div className="space-y-6">
                <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Quick Insights</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Admin-to-Staff Ratio</span>
                            <span className="text-sm font-bold">1 : {Math.max(0, totalMembers - 1)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Hardware Utilization</span>
                            <span className="text-sm font-bold">{totalSystems > 0 ? "High" : "None"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Overall Participation</span>
                            <span className="text-sm font-bold text-sky-600">{totalBallots > 1000 ? "Active" : "Stable"}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border bg-primary/5 p-6 border-primary/10 space-y-3">
                    <h4 className="text-sm font-bold text-primary">Need Help?</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Need assistance managing your elections or setting up hardware? Check out our administrator guide or contact support.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}
