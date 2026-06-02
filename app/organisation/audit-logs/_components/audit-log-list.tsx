import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { format } from "date-fns"
import { Prisma } from "@prisma/client"
import {
  ShieldKeyIcon,
  Building06Icon,
  MapsIcon,
  UserGroupIcon,
  Settings02Icon,
  Shield02Icon,
  GridIcon,
  UserCircleIcon,
  Analytics01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"

const ENTITY_ICONS: Record<string, any> = {
  ORGANIZATION: Building06Icon,
  ELECTION: MapsIcon,
  ELECTION_ROLE: Shield02Icon,
  ELECTION_CATEGORY: GridIcon,
  CANDIDATE: UserGroupIcon,
  BALLOT: Analytics01Icon,
  VOTER: UserCircleIcon,
  SETTINGS: Settings02Icon,
  MEMBER: UserGroupIcon,
  USER: UserGroupIcon,
  SECURITY: ShieldKeyIcon,
  AUTH: ShieldKeyIcon,
  DEFAULT: Settings02Icon,
}

const ENTITY_COLORS: Record<string, string> = {
  ORGANIZATION: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-500/20",
  ELECTION: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
  ELECTION_ROLE: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20",
  ELECTION_CATEGORY: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20",
  CANDIDATE: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-500/20",
  BALLOT: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 border-teal-500/20",
  VOTER: "bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400 border-pink-500/20",
  SETTINGS: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border-slate-500/20",
  MEMBER: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
  USER: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
  SECURITY: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
  AUTH: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20",
  DEFAULT: "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20",
}

const STATUS_VARIANTS: Record<string, any> = {
  SUCCESS: "successOutline",
  FAILURE: "destructive",
  WARNING: "warningOutline",
  INFO: "infoOutline",
}

type AuditLogWithAdmin = Prisma.AdminAuditLogGetPayload<{
  include: {
    admin: {
      select: {
        name: true
        email: true
      }
    }
  }
}>

interface AuditLogListProps {
  logs: AuditLogWithAdmin[]
}

export function AuditLogList({ logs }: AuditLogListProps) {
  if (logs.length === 0) {
    return (
      <Card className="border-border/50 bg-card/20 backdrop-blur-sm p-16 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 opacity-50 border border-border/50">
          <HugeiconsIcon icon={ShieldKeyIcon} className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground/90">No audit records found</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
          Try modifying your search or filter configuration.
        </p>
      </Card>
    )
  }

  return (
    <Card className="py-0">
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {logs.map((log) => {
            const actor = log.admin?.name || log.admin?.email || "System"
            const icon = ENTITY_ICONS[log.entityType] || ENTITY_ICONS.DEFAULT
            const colorClass = ENTITY_COLORS[log.entityType] || ENTITY_COLORS.DEFAULT
            const rawTitle = log.description || log.action.replace(/_/g, " ")
            const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1)

            return (
              <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-start gap-4 justify-between transition-all hover:bg-muted/30 group">
                {/* Left: Icon and core details */}
                <div className="flex items-start gap-4">
                  <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center border shadow-sm ring-border/20 ${colorClass}`}>
                    <HugeiconsIcon icon={icon} className="h-5.5 w-5.5" strokeWidth={2} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base tracking-tight text-foreground/90">{title}</span>
                      <Badge variant={STATUS_VARIANTS[log.status] || "default"} className="text-[9px] uppercase tracking-wider py-0 px-2 rounded-full h-4 font-black">
                        {log.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap sm:items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/80 font-semibold">
                      <p>Actor: <span className="text-foreground/70 font-bold">{actor}</span></p>
                      <span className="hidden sm:inline text-border/70">•</span>
                      <p className="tabular-nums font-medium flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar01Icon} className="h-3.5 w-3.5" />
                        {format(log.createdAt, "PPP · pp")}
                      </p>
                      {log.ipAddress && (
                        <>
                          <span className="hidden sm:inline text-border/70">•</span>
                          <p className="font-mono text-[10px] text-muted-foreground/60">{log.ipAddress}</p>
                        </>
                      )}
                    </div>

                    {/* Metadata Inspector (Server-side Collapsible Details) */}
                    {log.metadata && Object.keys(log.metadata as Record<string, any>).length > 0 && (
                      <details className="group/details mt-2.5">
                        <summary className="text-[11px] font-bold text-primary/80 hover:text-primary transition-colors cursor-pointer select-none">
                          Inspect Payload Metadata
                        </summary>
                        <div className="mt-2 p-3 text-[11px] font-mono bg-muted/40 border border-border/40 rounded-2xl overflow-x-auto text-muted-foreground max-w-full leading-relaxed shadow-inner">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                </div>

                {/* Right: Record Identity info */}
                <div className="sm:text-right shrink-0 border-t sm:border-t-0 border-border/30 pt-3 sm:pt-0">
                  <span className="text-[10px] font-black font-mono text-muted-foreground/40 uppercase tracking-wider block">
                    Entity Target ID
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground/70 select-all block mt-0.5 max-w-[200px] truncate sm:max-w-none">
                    {log.entityId || log.id}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
