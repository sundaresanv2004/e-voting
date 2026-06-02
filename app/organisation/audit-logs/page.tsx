import { db } from "@/lib/db"
import { requireOrgAdmin } from "@/lib/auth/access"
import { PageHeader } from "@/components/shared/page-header"
import { Prisma, AuditEntityType, AuditStatus } from "@prisma/client"
import { ShieldKeyIcon } from "@hugeicons/core-free-icons"

import { AuditMetrics } from "./_components/audit-metrics"
import { AuditFilters } from "./_components/audit-filters"
import { AuditLogList } from "./_components/audit-log-list"
import { AuditPagination } from "./_components/audit-pagination"

type AuditSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function getParam(params: Awaited<AuditSearchParams>, key: string): string {
  const val = params[key]
  return Array.isArray(val) ? val[0] || "" : val || ""
}

function getDateBoundary(value: string | undefined, endOfDay = false) {
  if (!value) return undefined
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export default async function AuditLogsPage({ searchParams }: { searchParams: AuditSearchParams }) {
  const { member } = await requireOrgAdmin()
  const orgId = member.organizationId

  const params = await searchParams
  const q = getParam(params, "q")
  const entityTypeParam = getParam(params, "entityType")
  const statusParam = getParam(params, "status")
  const fromParam = getParam(params, "from")
  const toParam = getParam(params, "to")
  const pageParam = getParam(params, "page")

  const entityType = Object.values(AuditEntityType).includes(entityTypeParam as AuditEntityType)
    ? (entityTypeParam as AuditEntityType)
    : undefined

  const status = Object.values(AuditStatus).includes(statusParam as AuditStatus)
    ? (statusParam as AuditStatus)
    : undefined

  const fromDate = getDateBoundary(fromParam)
  const toDate = getDateBoundary(toParam, true)

  const currentPage = Math.max(1, Number(pageParam) || 1)
  const pageSize = 20
  const skip = (currentPage - 1) * pageSize

  // Build prisma query object
  const where: Prisma.AdminAuditLogWhereInput = {
    organizationId: orgId,
    ...(entityType ? { entityType } : {}),
    ...(status ? { status } : {}),
    ...((fromDate || toDate)
      ? { createdAt: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } }
      : {}),
    ...(q
      ? {
        OR: [
          { action: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { entityId: { contains: q, mode: "insensitive" } },
          { admin: { name: { contains: q, mode: "insensitive" } } },
          { admin: { email: { contains: q, mode: "insensitive" } } },
        ],
      }
      : {}),
  }

  // Retrieve logs, total counts, and summary info
  const [logs, totalMatching, statusCounts] = await Promise.all([
    db.adminAuditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: pageSize,
      skip,
      include: {
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    db.adminAuditLog.count({ where }),
    db.adminAuditLog.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: { _all: true },
    }),
  ])

  const totalPages = Math.ceil(totalMatching / pageSize)

  // Count summaries for metrics row
  const successCount = statusCounts.find((sc) => sc.status === "SUCCESS")?._count._all || 0
  const failureCount = statusCounts.find((sc) => sc.status === "FAILURE")?._count._all || 0
  const warningCount = statusCounts.find((sc) => sc.status === "WARNING")?._count._all || 0
  const infoCount = statusCounts.find((sc) => sc.status === "INFO")?._count._all || 0

  return (
    <div className="flex-1 w-full min-h-screen bg-background rounded-2xl">
      <PageHeader
        title="Admin Audit Logs"
        description="Monitor system-wide admin activities, election actions, and security operations."
        icon={ShieldKeyIcon}
      />

      <div className="px-4 md:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">
        <AuditMetrics
          successCount={successCount}
          failureCount={failureCount}
          warningCount={warningCount}
          infoCount={infoCount}
        />

        <AuditFilters
          q={q}
          entityTypeParam={entityTypeParam}
          statusParam={statusParam}
          fromParam={fromParam}
          toParam={toParam}
        />

        <AuditLogList logs={logs} />

        <AuditPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalMatching={totalMatching}
          pageSize={pageSize}
          q={q}
          entityTypeParam={entityTypeParam}
          statusParam={statusParam}
          fromParam={fromParam}
          toParam={toParam}
        />
      </div>
    </div>
  )
}
