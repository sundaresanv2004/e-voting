import Link from "next/link"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft02Icon, Archive01Icon } from "@hugeicons/core-free-icons"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { requireOrgAdmin } from "@/lib/authz"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AuditHero from "./_components/AuditHero"
import { actionConfig, typeConfig, statusBadgeStyles } from "../_components/activity-config"
import { AuditEntityType } from "@prisma/client"

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

export default async function OrganizationAuditPage() {
  const session = await auth()
  const access = await requireOrgAdmin(session?.user)

  const auditLogs = await db.adminAuditLog.findMany({
    where: { organizationId: access.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      admin: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      <AuditHero
        title="Organization Audit"
        description="Comprehensive history of administrative actions"
      />

      <div className="flex-1 px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <Card className="border-border/50 shadow-sm overflow-hidden py-0">
          <CardContent className="p-0">
            {auditLogs.length === 0 ? (
              <div className="p-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 opacity-50">
                  <HugeiconsIcon icon={Archive01Icon} className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-black tracking-tight">Records are Clear</h3>
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
                      <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-border/50 transition-transform group-hover:scale-105 ${config.bg}`}>
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

                        {metadataText && (
                          <div className="mt-2 p-3 rounded-lg bg-muted/40 border border-border/40 max-w-2xl">
                            <p className="text-[11px] font-mono text-muted-foreground/90 leading-relaxed break-all">
                              {metadataText}
                            </p>
                          </div>
                        )}
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

