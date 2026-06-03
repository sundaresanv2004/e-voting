import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { requireOrgAdmin } from "@/lib/auth/access"
import { AuditEntityType, ElectionStatus } from "@prisma/client"

import { PageHeader } from "@/components/shared/page-header"
import { Building06Icon } from "@hugeicons/core-free-icons"
import { OrgMetricCards } from "./_components/org-metric-cards"
import { OrgTeamSnapshot } from "./_components/org-team-snapshot"
import { OrgActivityFeed } from "./_components/org-activity-feed"
import { OrgCodeCard } from "./_components/org-code-card"
import { OrgQuickNavigate } from "./_components/org-quick-navigate"
import { OrgElectionsOverview } from "./_components/org-elections-overview"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const { member, session } = await requireOrgAdmin()
  const orgId = member.organizationId
  const org = member.organization

  if (!org) redirect("/setup/organization")

  const [
    settings,
    totalMembers,
    adminCount,
    staffCount,
    viewerCount,
    pendingInvites,
    totalElections,
    electionsByStatus,
    recentActivity,
    lockedUserCount,
    ownedOrg,
    latestElections,
  ] = await Promise.all([
    db.organizationSettings.findUnique({
      where: { organizationId: orgId },
      select: { maxElections: true, maxMembers: true }
    }),
    db.member.count({ where: { organizationId: orgId } }),
    db.member.count({ where: { organizationId: orgId, role: "org_admin" } }),
    db.member.count({ where: { organizationId: orgId, role: "staff" } }),
    db.member.count({ where: { organizationId: orgId, role: "viewer" } }),
    db.invitation.count({ where: { organizationId: orgId, status: "pending" } }),
    db.election.count({ where: { organizationId: orgId, deletedAt: null } }),
    db.election.groupBy({
      by: ["status"],
      where: { organizationId: orgId, deletedAt: null },
      _count: { _all: true }
    }),
    db.adminAuditLog.findMany({
      where: {
        organizationId: orgId,
        entityType: {
          in: [
            AuditEntityType.ORGANIZATION,
            AuditEntityType.MEMBER,
            AuditEntityType.SETTINGS,
            AuditEntityType.ACCESS,
            AuditEntityType.AUTH,
            AuditEntityType.SECURITY,
            AuditEntityType.ELECTION,
          ]
        }
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        admin: { select: { name: true, email: true } }
      }
    }),
    db.user.count({
      where: {
        members: { some: { organizationId: orgId } },
        lockedUntil: { gt: new Date() }
      }
    }),
    db.organization.findUnique({
      where: { id: orgId },
      select: { code: true, type: true, logo: true, name: true, createdAt: true, ownerId: true }
    }),
    db.election.findMany({
      where: { organizationId: orgId, deletedAt: null },
      orderBy: [
        { status: "asc" },
        { startTime: "desc" },
      ],
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        startTime: true,
        endTime: true,
        code: true,
        roles: {
          select: {
            _count: { select: { candidates: true } }
          }
        },
        _count: { select: { roles: true } },
        settings: { select: { allowNota: true, allowMultipleVotes: true } },
      }
    })
  ])

  const maxElections = settings?.maxElections ?? 5
  const maxMembers = settings?.maxMembers ?? 100

  // Build status summary map
  const statusMap = Object.fromEntries(
    electionsByStatus.map(e => [e.status, e._count._all])
  ) as Record<ElectionStatus, number>

  const activeCount = statusMap[ElectionStatus.ACTIVE] ?? 0
  const upcomingCount = statusMap[ElectionStatus.UPCOMING] ?? 0
  const completedCount = statusMap[ElectionStatus.COMPLETED] ?? 0
  const pausedCount = statusMap[ElectionStatus.PAUSED] ?? 0

  const isOwner = ownedOrg?.ownerId === session.user.id

  return (
    <div className="flex-1 w-full">
      <PageHeader
        title={org.name}
        description="Here's an overview of your organization's activity, team, and elections."
        icon={Building06Icon}
      />

      <div className="px-4 md:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">

        {/* Row 1 — Metric Cards */}
        <OrgMetricCards
          totalMembers={totalMembers}
          pendingInvites={pendingInvites}
          totalElections={totalElections}
          activeCount={activeCount}
        />

        {/* Row 2 — Two-column main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Elections Overview in old-site style */}
            <OrgElectionsOverview elections={latestElections} />

            {/* Quick Navigate */}
            <OrgQuickNavigate totalElections={totalElections} totalMembers={totalMembers} />

            {/* Activity Feed */}
            <OrgActivityFeed logs={recentActivity} />
          </div>

          {/* Right column (1/3) */}
          <div className="space-y-6">
            {/* Org Code Card */}
            {ownedOrg && (
              <OrgCodeCard
                code={ownedOrg.code}
                orgName={ownedOrg.name}
                orgType={ownedOrg.type}
                createdAt={ownedOrg.createdAt}
              />
            )}



            {/* Team Snapshot */}
            <OrgTeamSnapshot
              totalMembers={totalMembers}
              adminCount={adminCount}
              staffCount={staffCount}
              viewerCount={viewerCount}
            />

            {/* Quick Actions - already replaced by OrgQuickNavigate in left col */}
          </div>
        </div>
      </div>
    </div>
  )
}
