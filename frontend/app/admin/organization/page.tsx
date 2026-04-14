import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { DashboardHeader } from "./_components/DashboardHeader"
import { MetricCards } from "./_components/MetricCards"
import { ElectionsOverview, type ElectionSummary } from "./_components/ElectionsOverview"
import { HardwareHealth } from "./_components/HardwareHealth"
import { TeamSnapshot } from "./_components/TeamSnapshot"
import { QuickNavigate } from "./_components/QuickNavigate"
import { ActivityTimeline, type ActivityItem } from "./_components/ActivityTimeline"
import { ElectionStatus, SystemStatus, UserRole } from "@prisma/client"
import { SuccessToastListener } from "@/components/auth/success-toast-listener"
import { Suspense } from "react"

export default async function OrganizationDashboardPage() {
  const session = await auth()
  const orgId = session?.user?.organizationId

  if (!orgId) {
    redirect("/setup/organization")
  }

  // Fetch all dashboard data in parallel for maximum performance
  const [
    organization,
    totalElections,
    activeElections,
    totalMembers,
    adminCount,
    staffCount,
    viewerCount,
    approvedSystems,
    pendingSystems,
    rejectedSystems,
    revokedSystems,
    latestElections,
    latestSystems,
  ] = await Promise.all([
    db.organization.findUnique({
      where: { id: orgId },
      select: { name: true }
    }),
    db.election.count({ where: { organizationId: orgId } }),
    db.election.count({
      where: {
        organizationId: orgId,
        status: ElectionStatus.ACTIVE
      }
    }),
    db.user.count({ where: { organizationId: orgId } }),
    db.user.count({ where: { organizationId: orgId, role: UserRole.ORG_ADMIN } }),
    db.user.count({ where: { organizationId: orgId, role: UserRole.STAFF } }),
    db.user.count({ where: { organizationId: orgId, role: UserRole.VIEWER } }),
    db.authorizedSystem.count({
      where: { organizationId: orgId, status: SystemStatus.APPROVED }
    }),
    db.authorizedSystem.count({
      where: { organizationId: orgId, status: SystemStatus.PENDING }
    }),
    db.authorizedSystem.count({
      where: { organizationId: orgId, status: SystemStatus.REJECTED }
    }),
    db.authorizedSystem.count({
      where: { organizationId: orgId, status: SystemStatus.REVOKED }
    }),
    // Elections with counts for the overview widget
    db.election.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        startTime: true,
        endTime: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            roles: true,
          }
        },
        roles: {
          select: {
            _count: {
              select: { candidates: true }
            }
          }
        }
      }
    }),
    // Latest systems for activity feed
    db.authorizedSystem.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: "desc" },
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
      description: `Election created — ${e.status.toLowerCase()}`,
      timestamp: e.updatedAt,
      status: e.status,
    })),
    ...latestSystems.map(s => ({
      id: s.id,
      type: "SYSTEM" as const,
      title: s.name || s.hostName || "Unnamed System",
      description: s.updatedAt > s.createdAt 
        ? `Status updated to ${s.status}` 
        : `Hardware registration — ${s.macAddress || "unknown MAC"}`,
      timestamp: s.updatedAt,
      status: s.status,
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 6)

  // Format elections for overview
  const electionsForOverview: ElectionSummary[] = latestElections.map(e => ({
    id: e.id,
    name: e.name,
    status: e.status,
    startTime: e.startTime,
    endTime: e.endTime,
    _count: {
      roles: e._count.roles,
      candidates: e.roles.reduce((acc, role) => acc + role._count.candidates, 0),
    },
  }))

  const totalSystems = approvedSystems + pendingSystems + rejectedSystems + revokedSystems

  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      <Suspense fallback={null}>
        <SuccessToastListener />
      </Suspense>
      {/* Header */}
      <DashboardHeader
        orgName={organization.name}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-8 py-6 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* Metric Cards */}
        <MetricCards
          totalElections={totalElections}
          activeElections={activeElections}
          totalMembers={totalMembers}
          approvedSystems={approvedSystems}
          pendingSystems={pendingSystems}
        />

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <ElectionsOverview elections={electionsForOverview} />
            <ActivityTimeline activities={activities} />
          </div>

          {/* Right Column — 1/3 */}
          <div className="space-y-6">
            <HardwareHealth
              approved={approvedSystems}
              pending={pendingSystems}
              rejected={rejectedSystems}
              revoked={revokedSystems}
            />
            <TeamSnapshot
              adminCount={adminCount}
              staffCount={staffCount}
              viewerCount={viewerCount}
              totalMembers={totalMembers}
            />
            <QuickNavigate
              electionCount={totalElections}
              memberCount={totalMembers}
              systemCount={totalSystems}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
