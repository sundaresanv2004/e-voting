import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Building06Icon,
  UserGroupIcon,
  Settings02Icon,
  ShieldKeyIcon,
  MapsIcon,
  UserCircleIcon,
  Archive01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { formatDistanceToNow } from "date-fns"
import { Prisma, AuditEntityType, AuditStatus } from "@prisma/client"
import Link from "next/link"

type AuditLogWithAdmin = Prisma.AdminAuditLogGetPayload<{
  include: { admin: { select: { name: true; email: true } } }
}>

interface OrgActivityFeedProps {
  logs: AuditLogWithAdmin[]
}

const ENTITY_ICON_MAP: Partial<Record<AuditEntityType, any>> = {
  [AuditEntityType.ORGANIZATION]: Building06Icon,
  [AuditEntityType.MEMBER]: UserGroupIcon,
  [AuditEntityType.SETTINGS]: Settings02Icon,
  [AuditEntityType.SECURITY]: ShieldKeyIcon,
  [AuditEntityType.AUTH]: ShieldKeyIcon,
  [AuditEntityType.ACCESS]: UserCircleIcon,
  [AuditEntityType.ELECTION]: MapsIcon,
}

const ENTITY_COLOR_MAP: Partial<Record<AuditEntityType, string>> = {
  [AuditEntityType.ORGANIZATION]: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  [AuditEntityType.MEMBER]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  [AuditEntityType.SETTINGS]: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  [AuditEntityType.SECURITY]: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  [AuditEntityType.AUTH]: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  [AuditEntityType.ACCESS]: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  [AuditEntityType.ELECTION]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
}

const STATUS_BADGE: Record<AuditStatus, { label: string; style: string }> = {
  SUCCESS: { label: "Success", style: "text-emerald-500 bg-emerald-500/10" },
  FAILURE: { label: "Failed", style: "text-destructive bg-destructive/10" },
  WARNING: { label: "Warning", style: "text-amber-500 bg-amber-500/10" },
  INFO: { label: "Info", style: "text-blue-500 bg-blue-500/10" },
}

function formatAction(action: string) {
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function OrgActivityFeed({ logs }: OrgActivityFeedProps) {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={Archive01Icon} className="h-5 w-5 text-indigo-500" />
            Recent Activity
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            Latest admin actions in your organization
          </CardDescription>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-[10px] uppercase font-bold tracking-wider px-2 gap-1"
          asChild
        >
          <Link href="/organisation/audit-logs">
            View All
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-sm border border-border/50">
              <HugeiconsIcon icon={Archive01Icon} className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-black text-foreground mb-1">Pulse Synchronized</h3>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              No recent events detected. Activity will appear here as actions are taken.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-[576px] overflow-y-auto">
            {logs.map((log) => {
              const Icon = ENTITY_ICON_MAP[log.entityType] ?? Settings02Icon
              const colorClass = ENTITY_COLOR_MAP[log.entityType] ?? "bg-slate-500/10 text-slate-600"
              const actor = log.admin?.name || log.admin?.email || "System"
              const statusBadge = STATUS_BADGE[log.status]
              const title = log.description || formatAction(log.action)
              const description = `By ${actor}`

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-6 hover:bg-muted/40 transition-all group relative"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-border/50 ${colorClass}`}>
                    <HugeiconsIcon icon={Icon} className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-black leading-tight text-foreground/90 group-hover:text-foreground transition-colors truncate">
                        {title}
                      </p>
                      <Badge variant="secondary" className="text-[11px] font-medium whitespace-nowrap shrink-0 tabular-nums px-2 py-0 h-5 rounded-full ring-1 ring-border/5">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">
                        {description}
                      </p>
                      {log.status && log.status !== "SUCCESS" && (
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0 border-none rounded-full shrink-0 ${statusBadge.style}`}>
                          {statusBadge.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
