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
import { OrgCodeCard } from "./_components/OrgCodeCard"
import { ElectionStatus, SystemStatus, UserRole, AuditEntityType } from "@prisma/client"
import { requireOrgAdmin } from "@/lib/authz"

export default async function OrganizationDashboardPage() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  const orgId = access.organizationId

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
    suspendedSystems,
    expiredSystems,
    latestElections,
    latestAuditLogs,
    lockedUserCount,
    upcomingElections,
    userRoleCount,
  ] = await Promise.all([

    db.organization.findUnique({
      where: { id: orgId },
      select: {
        name: true,
        logo: true,           // L6: display org logo in header
        code: true,
        settings: {
          select: {
            allowSystemConnection: true  // L2: gate "Authorize Device" button
          }
        }
      }
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
    db.authorizedSystem.count({
      where: { organizationId: orgId, status: SystemStatus.SUSPENDED }
    }),
    db.authorizedSystem.count({
      where: { organizationId: orgId, status: SystemStatus.EXPIRED }
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
        },
        settings: {
          select: {
            allowNota: true,
            allowMultipleVotes: true,
          }
        }
      }
    }),
    // Latest Activity Pulse from Audit Logs
    db.adminAuditLog.findMany({
      where: {
        organizationId: orgId,
        entityType: {
          in: [
            AuditEntityType.ORGANIZATION,
            AuditEntityType.USER,
            AuditEntityType.SYSTEM,
            AuditEntityType.SETTINGS,
            AuditEntityType.AUTH,
            AuditEntityType.SECURITY,
            AuditEntityType.MEMBER,
            AuditEntityType.ACCESS,
            AuditEntityType.ELECTION,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        admin: {
          select: { name: true, email: true }
        }
      }
    }),
    db.user.count({
      where: {
        organizationId: orgId,
        lockedUntil: { gt: new Date() }
      }
    }),
    // M7: Count upcoming elections for display
    db.election.count({
      where: {
        organizationId: orgId,
        status: ElectionStatus.UPCOMING
      }
    }),
    // L5: Count USER-role members (base role — may not have been assigned a proper role yet)
    db.user.count({
      where: { organizationId: orgId, role: UserRole.USER }
    }),
  ])


  if (!organization) {
    redirect("/setup/organization")
  }

  // Construct Activity Feed from Audit Logs
  const activities: ActivityItem[] = latestAuditLogs
    .filter(log => {
      const electionActions = ["RESULTS_GENERATED", "RESULTS_PUBLISHED", "CANDIDATE_ADDED", "CANDIDATE_DELETED", "VOTER_ADDED", "VOTER_DELETED"]
      return !electionActions.includes(log.action)
    })
    .map(log => {
      let type: "ELECTION" | "SYSTEM" | "MEMBER" = "MEMBER"
      if (log.entityType === AuditEntityType.CANDIDATE || log.entityType === AuditEntityType.ELECTION_ROLE || log.entityType === AuditEntityType.ELECTION || log.entityType === AuditEntityType.VOTER || log.entityType === AuditEntityType.BALLOT || log.entityType === AuditEntityType.RESULT) {
        type = "ELECTION"
      } else if (log.entityType === AuditEntityType.SYSTEM) {
        type = "SYSTEM"
      } else if (log.entityType === AuditEntityType.USER || log.entityType === AuditEntityType.MEMBER || log.entityType === AuditEntityType.ACCESS || log.entityType === AuditEntityType.AUTH || log.entityType === AuditEntityType.SECURITY) {
        type = "MEMBER"
      }

      // H3 FIX: Always preserve actor identity — never discard adminName from any event.
      const adminName = log.admin?.name || log.admin?.email || "Administrator"
      let title = log.description || (log.action.charAt(0).toUpperCase() + log.action.slice(1).toLowerCase()).replace(/_/g, " ")
      let description = `By ${adminName}`

      // Map well-known actions to readable titles and descriptions (actor always appended)
      switch (log.action) {
        case "SETTINGS_UPDATED":
          title = (log.metadata as any)?.name ? `"${(log.metadata as any).name}" updated` : "Settings updated"
          description = `Updated by ${adminName}`
          break
        case "MEMBER_ADDED":
          title = (log.metadata as any)?.memberName || (log.metadata as any)?.email || "New member added"
          description = `Added as ${(log.metadata as any)?.role || "member"} by ${adminName}`
          break
        case "MEMBER_UPDATED":
          title = (log.metadata as any)?.memberName || "Member role updated"
          description = `Role → ${(log.metadata as any)?.after?.role || "updated"} by ${adminName}`
          break
        case "MEMBER_LEFT":
          title = (log.metadata as any)?.name || (log.metadata as any)?.email || "A member"
          description = `Left the organization`
          break
        case "MEMBER_REMOVED": {
          const removedName = (log.metadata as any)?.name || (log.metadata as any)?.email || "A member"
          title = removedName
          description = `Removed from organization by ${adminName}`
          break
        }
        case "MEMBER_EMAIL_COPIED":
          title = (log.metadata as any)?.email
            ? `Member email copied: ${(log.metadata as any).email}`
            : "Member email copied"
          description = `By ${adminName}`
          break
        case "SYSTEM_APPROVED":
          title = (log.metadata as any)?.name || "Device approved"
          description = `Cleared by ${adminName}`
          break
        case "SYSTEM_REVOKED":
        case "SYSTEM_REJECTED":
          title = (log.metadata as any)?.name || "Device access changed"
          description = `By ${adminName}`
          break
        case "ELECTION_CREATED":
        case "ELECTION_UPDATED":
        case "ELECTION_DELETED":
        case "ELECTION_STATUS_CHANGED":
          title = (log.metadata as any)?.name || (log.action.charAt(0).toUpperCase() + log.action.slice(1).toLowerCase()).replace(/_/g, " ")
          let actionWord = "Updated"
          if (log.action === "ELECTION_CREATED") actionWord = "Created"
          if (log.action === "ELECTION_DELETED") actionWord = "Deleted"
          description = `${actionWord} by ${adminName}`
          break
        case "ORGANIZATION_CREATED":
          title = (log.metadata as any)?.name || "Organization created"
          description = `Created by ${adminName}`
          break
        case "ORGANIZATION_UPDATED":
          title = "Organization updated"
          description = `Modified by ${adminName}`
          break
        case "ORG_CODE_REVEALED":
          title = "Organization code revealed"
          description = `By ${adminName}`
          break
        case "ORG_CODE_COPIED":
          title = "Organization code copied"
          description = `By ${adminName}`
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
        default:
          // Keep the generic formatted title but always include actor
          description = `By ${adminName}`
      }

      return {
        id: log.id,
        type,
        action: log.action,
        title,
        description,
        timestamp: log.createdAt,
        status: (log.metadata as any)?.status || (log.metadata as any)?.newStatus || (log.metadata as any)?.role || undefined
      }
    })

  // M2: Sort elections by urgency — ACTIVE first, then UPCOMING, PAUSED, COMPLETED, CANCELLED
  const statusPriority: Record<string, number> = {
    ACTIVE: 0,
    UPCOMING: 1,
    PAUSED: 2,
    COMPLETED: 3,
    CANCELLED: 4,
  }

  // Format elections for overview (M2 sorted)
  const electionsForOverview: ElectionSummary[] = latestElections
    .map(e => ({
      id: e.id,
      name: e.name,
      status: e.status,
      startTime: e.startTime,
      endTime: e.endTime,
      _count: {
        roles: e._count.roles,
        candidates: e.roles.reduce((acc, role) => acc + role._count.candidates, 0),
      },
      allowNota: e.settings?.allowNota || false,
      allowMultipleVotes: e.settings?.allowMultipleVotes || false,
    }))
    .sort((a, b) => {
      const pa = statusPriority[a.status] ?? 5
      const pb = statusPriority[b.status] ?? 5
      if (pa !== pb) return pa - pb
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    })

  const totalSystems = approvedSystems + pendingSystems + rejectedSystems + revokedSystems + suspendedSystems + expiredSystems

  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      {/* Header */}
      <DashboardHeader
        orgName={organization.name}
        orgLogo={organization.logo ?? null}
        userRole={access.role}
        allowSystemConnection={organization.settings?.allowSystemConnection ?? false}
      />

      {/* Main Content */}
      <div className="flex-1 px-4 md:px-8 py-4 space-y-4 max-w-[1400px] mx-auto w-full">
        {/* Metric Cards */}
        <MetricCards
          totalElections={totalElections}
          activeElections={activeElections}
          upcomingElections={upcomingElections}
          totalMembers={totalMembers}
          approvedSystems={approvedSystems}
          pendingSystems={pendingSystems}
        />

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column — 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <ElectionsOverview elections={electionsForOverview} />
            <QuickNavigate
              electionCount={totalElections}
              memberCount={totalMembers}
              systemCount={totalSystems}
            />
            <ActivityTimeline activities={activities} auditHref="/admin/organization/audit" />
          </div>

          {/* Right Column — 1/3 */}
          <div className="space-y-4">
            <HardwareHealth
              approved={approvedSystems}
              pending={pendingSystems}
              rejected={rejectedSystems}
              revoked={revokedSystems}
              suspended={suspendedSystems}
              expired={expiredSystems}
            />
            <TeamSnapshot
              adminCount={adminCount}
              staffCount={staffCount}
              viewerCount={viewerCount}
              userRoleCount={userRoleCount}
              totalMembers={totalMembers}
              lockedUserCount={lockedUserCount}
            />
            <OrgCodeCard code={organization.code} />
          </div>
        </div>
      </div>
    </div>
  )
}
