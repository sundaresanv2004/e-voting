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
import { ElectionStatus, SystemStatus, UserRole, AuditEntityType } from "@prisma/client"
import { AutoRefresh } from "@/components/auto-refresh"

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
    latestAuditLogs,
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
    // Latest Activity Pulse from Audit Logs
    db.adminAuditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    }),
  ])


  if (!organization) {
    redirect("/setup/organization")
  }

  // Construct Activity Feed from Audit Logs
  const activities: ActivityItem[] = latestAuditLogs.map(log => {
    let type: "ELECTION" | "SYSTEM" | "MEMBER" = "ELECTION"
    if (log.entityType === AuditEntityType.CANDIDATE || log.entityType === AuditEntityType.ELECTION_ROLE || log.entityType === AuditEntityType.ELECTION) {
      type = "ELECTION"
    } else if (log.entityType === AuditEntityType.SYSTEM) {
      type = "SYSTEM"
    } else if (log.entityType === AuditEntityType.USER || log.entityType === AuditEntityType.MEMBER || log.entityType === AuditEntityType.ACCESS) {
      type = "MEMBER"
    }

    // Determine Title & Description based on action
    const adminName = log.admin?.name || log.admin?.email || "Administrator"
    let title = log.description || log.action.replace(/_/g, " ")
    let description = `Actioned by ${adminName}`

    // Custom formatting for common actions
    if (log.action === "ELECTION_CREATED") {
      title = (log.metadata as any)?.name || "New Election"
      description = "Election initialization complete"
    } else if (log.action === "MEMBER_ADDED") {
      title = log.admin?.name || log.admin?.email || "New Member"
      description = `Joined as ${(log.metadata as any)?.role || "Member"}`
    } else if (log.action === "MEMBER_UPDATED") {
      description = `Role updated to ${(log.metadata as any)?.after?.role || "Member"}`
    } else if (log.action === "SYSTEM_APPROVED") {
      description = "Hardware security clearance granted"
    }

    return {
      id: log.id,
      type,
      title,
      description,
      timestamp: log.createdAt,
      status: (log.metadata as any)?.status || (log.metadata as any)?.newStatus || (log.metadata as any)?.role || undefined
    }
  })

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
      <AutoRefresh intervalMs={25000} />
      {/* Header */}
      <DashboardHeader
        orgName={organization.name}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-8 py-4 space-y-4 max-w-[1400px] mx-auto w-full">
        {/* Metric Cards */}
        <MetricCards
          totalElections={totalElections}
          activeElections={activeElections}
          totalMembers={totalMembers}
          approvedSystems={approvedSystems}
          pendingSystems={pendingSystems}
        />

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column — 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <ElectionsOverview elections={electionsForOverview} />
            <ActivityTimeline activities={activities} />
          </div>

          {/* Right Column — 1/3 */}
          <div className="space-y-4">
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
