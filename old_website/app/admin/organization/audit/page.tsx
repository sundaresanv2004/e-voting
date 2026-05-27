import { format } from "date-fns"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Archive01Icon } from "@hugeicons/core-free-icons"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { requireOrgAdmin } from "@/lib/authz"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import AuditHero from "./_components/AuditHero"
import { AuditFilters } from "./_components/AuditFilters"
import { AuditMetadata } from "./_components/AuditMetadata"
import { actionConfig, typeConfig, statusBadgeStyles } from "../_components/activity-config"
import { AuditEntityType, AuditStatus, Prisma } from "@prisma/client"
import { DashboardPoller } from "../_components/DashboardPoller"

export const revalidate = 30

type AuditSearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const entityTypes = Object.values(AuditEntityType)
const auditStatuses = Object.values(AuditStatus)

const entityBadgeStyles: Record<string, string> = {
  ORGANIZATION: "bg-indigo-500/10 text-indigo-600",
  ELECTION: "bg-amber-500/10 text-amber-600",
  SYSTEM: "bg-emerald-500/10 text-emerald-600",
  MEMBER: "bg-cyan-500/10 text-cyan-600",
  USER: "bg-blue-500/10 text-blue-600",
  SECURITY: "bg-rose-500/10 text-rose-600",
  SETTINGS: "bg-slate-500/10 text-slate-600",
  VOTER: "bg-violet-500/10 text-violet-600",
  CANDIDATE: "bg-purple-500/10 text-purple-600",
  ELECTION_ROLE: "bg-amber-600/10 text-amber-700",
  AUTH: "bg-rose-600/10 text-rose-700",
  DEFAULT: "bg-gray-500/10 text-gray-600",
}

function getParam(params: Awaited<AuditSearchParams>, key: string) {
  const value = params[key]
  return Array.isArray(value) ? value[0] : value
}

function getDateBoundary(value: string | undefined, endOfDay = false) {
  if (!value) return undefined

  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function formatMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") return null

  const entries = Object.entries(metadata as Record<string, unknown>)
    .filter(([, value]) => value !== null && value !== undefined)
    .slice(0, 4)

  if (entries.length === 0) return null

  return entries.map(([key, value]) => {
    const renderedValue = typeof value === "object"
      ? JSON.stringify(value)
      : String(value)

    return `${key}: ${renderedValue}`
  }).join(" · ")
}

export default async function OrganizationAuditPage({ searchParams }: { searchParams: AuditSearchParams }) {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)
  const params = await searchParams

  const query = getParam(params, "q")?.trim() || ""
  const entityTypeParam = getParam(params, "entityType")?.trim() || ""
  const statusParam = getParam(params, "status")?.trim() || ""
  const from = getDateBoundary(getParam(params, "from"))
  const to = getDateBoundary(getParam(params, "to"), true)

  const entityType = entityTypes.includes(entityTypeParam as AuditEntityType)
    ? entityTypeParam as AuditEntityType
    : undefined
  const status = auditStatuses.includes(statusParam as AuditStatus)
    ? statusParam as AuditStatus
    : undefined

  const where: Prisma.AdminAuditLogWhereInput = {
    organizationId: access.organizationId,
    ...(entityType ? { entityType } : {}),
    ...(status ? { status } : {}),
    ...((from || to) ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    ...(query
      ? {
        OR: [
          { action: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { entityId: { contains: query, mode: "insensitive" } },
          { admin: { name: { contains: query, mode: "insensitive" } } },
          { admin: { email: { contains: query, mode: "insensitive" } } },
        ],
      }
      : {}),
  }

  const auditLogs = await db.adminAuditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      admin: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  const [totalMatching, statusSummary, typeSummary] = await Promise.all([
    db.adminAuditLog.count({ where }),
    db.adminAuditLog.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
    }),
    db.adminAuditLog.groupBy({
      by: ["entityType"],
      where,
      _count: { _all: true },
    }),
  ])

  const hasFilters = Boolean(query || entityType || status || from || to)

  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      <DashboardPoller />
      <AuditHero
        title="Organization Audit"
        description="Comprehensive history of administrative actions"
      />

      <div className="flex-1 px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full space-y-5">
        <Card className="border-border/50 py-0">
          <CardContent className="p-4 md:p-5 space-y-4">
            <AuditFilters
              initialValues={{
                q: query,
                entityType: entityTypeParam,
                status: statusParam,
                from: getParam(params, "from") || "",
                to: getParam(params, "to") || ""
              }}
              entityTypes={entityTypes}
              auditStatuses={auditStatuses}
            />

            <div className="flex items-center justify-end pt-2">
              <p className="text-xs font-bold text-muted-foreground tracking-tight">
                Showing {auditLogs.length} of {totalMatching} matching records
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground mb-2">By Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusSummary.map((item) => (
                    <Badge 
                      key={item.status} 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border-none shadow-sm", 
                        statusBadgeStyles[item.status] || statusBadgeStyles.SUCCESS
                      )}
                    >
                      {item.status}: {item._count._all}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground mb-2">By Entity</p>
                <div className="flex flex-wrap gap-2">
                  {typeSummary.map((item) => (
                    <Badge 
                      key={item.entityType} 
                      variant="outline" 
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border-none shadow-sm", 
                        entityBadgeStyles[item.entityType] || entityBadgeStyles.DEFAULT
                      )}
                    >
                      {item.entityType}: {item._count._all}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 overflow-hidden py-0">
          <CardContent className="p-0">
            {auditLogs.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 opacity-50">
                  <HugeiconsIcon icon={Archive01Icon} className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">Records are Clear</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  No administrative activity has been logged for this organization yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {auditLogs.map((log) => {
                  const actor = log.admin?.name || log.admin?.email || "System"
                  const metadataText = formatMetadata(log.metadata)

                  // Resolve Icon & Config
                  const config = actionConfig[log.action] || (
                    log.entityType === AuditEntityType.SYSTEM ? typeConfig.SYSTEM :
                      (log.entityType === AuditEntityType.USER || log.entityType === AuditEntityType.MEMBER) ? typeConfig.MEMBER :
                        typeConfig.ELECTION
                  ) || typeConfig.ELECTION

                  const Icon = config?.icon || typeConfig.ELECTION.icon

                  // Fix description: Sentence Case for titles
                  const rawTitle = log.description || log.action.replace(/_/g, " ")
                  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).toLowerCase()

                  const statusStyle = statusBadgeStyles[log.status] || statusBadgeStyles.SUCCESS

                  return (
                    <div key={log.id} className="p-6 flex flex-col gap-4 md:flex-row md:items-start transition-all hover:bg-muted/30 group">
                      {/* Icon Section */}
                      <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-border/50 ${config.bg}`}>
                        <HugeiconsIcon icon={Icon} className={`h-6 w-6 ${config.color}`} />
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-black text-base tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
                            {title}
                          </p>
                          <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2 py-0 border-none rounded-full ${statusStyle}`}>
                            {log.status}
                          </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs font-bold text-muted-foreground/80">
                          <p className="flex items-center gap-1.5">
                            By <span className="text-foreground/70 font-black">{actor}</span>
                          </p>
                          <span className="hidden sm:inline text-border">•</span>
                          <p className="font-medium tabular-nums">{format(log.createdAt, "PPP · pp")}</p>
                        </div>

                        <div className="mt-2 space-y-2">
                          {metadataText && (
                            <div className="px-4 py-2.5 rounded-3xl bg-muted/20 border border-border/40 max-w-3xl">
                              <p className="text-[11px] font-mono text-muted-foreground/90 leading-relaxed break-all">
                                {metadataText}
                              </p>
                            </div>
                          )}
                          <AuditMetadata metadata={log.metadata} />
                        </div>
                      </div>

                      {/* ID / Detail Section */}
                      <div className="md:text-right shrink-0">
                        <p className="text-[10px] font-black font-mono text-muted-foreground/40 uppercase tracking-tighter">
                          Record ID
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground/60 select-all">
                          {log.entityId || log.id.slice(0, 8) + "..."}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
