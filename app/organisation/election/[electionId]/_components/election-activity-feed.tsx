import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Archive01Icon,
  ArrowRight01Icon,
  UserGroupIcon,
  ShieldKeyIcon,
  UserCircleIcon,
  Settings02Icon,
  MapsIcon,
  Tag01Icon,
  Building06Icon,
} from "@hugeicons/core-free-icons"
import { formatDistanceToNow } from "date-fns"
import { AuditEntityType, AuditStatus, Prisma } from "@prisma/client"
import Link from "next/link"

type AuditLogWithAdmin = Prisma.AdminAuditLogGetPayload<{
  include: { admin: { select: { name: true; email: true } } }
}>

interface ElectionActivityFeedProps {
  logs: AuditLogWithAdmin[]
  electionId: string
  userRole?: string
}

const ENTITY_ICON_MAP: Partial<Record<AuditEntityType, any>> = {
  [AuditEntityType.ELECTION]: MapsIcon,
  [AuditEntityType.ELECTION_ROLE]: ShieldKeyIcon,
  [AuditEntityType.ELECTION_CATEGORY]: Tag01Icon,
  [AuditEntityType.CANDIDATE]: UserGroupIcon,
  [AuditEntityType.VOTER]: UserCircleIcon,
  [AuditEntityType.SETTINGS]: Settings02Icon,
  [AuditEntityType.SECURITY]: ShieldKeyIcon,
  [AuditEntityType.RESULT]: Archive01Icon,
  [AuditEntityType.BALLOT]: Archive01Icon,
  [AuditEntityType.ORGANIZATION]: Building06Icon,
}

const ENTITY_COLOR_MAP: Partial<Record<AuditEntityType, string>> = {
  [AuditEntityType.ELECTION]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [AuditEntityType.ELECTION_ROLE]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [AuditEntityType.ELECTION_CATEGORY]: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  [AuditEntityType.CANDIDATE]: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  [AuditEntityType.VOTER]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  [AuditEntityType.SETTINGS]: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  [AuditEntityType.SECURITY]: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  [AuditEntityType.RESULT]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [AuditEntityType.BALLOT]: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
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

function humanizeLog(log: AuditLogWithAdmin): { title: string; description: string } {
  const adminName = log.admin?.name || log.admin?.email || "Administrator"
  const meta = log.metadata as Record<string, any> | null

  switch (log.action) {
    case "ELECTION_CREATED":
    case "ELECTION_UPDATED":
      return {
        title: meta?.name || formatAction(log.action),
        description: `${log.action === "ELECTION_CREATED" ? "Created" : "Updated"} by ${adminName}`,
      }
    case "ELECTION_STATUS_CHANGED":
      return {
        title: `Status changed to ${meta?.status || "unknown"}`,
        description: `By ${adminName}`,
      }
    case "CANDIDATE_ADDED":
    case "CANDIDATE_UPDATED":
    case "CANDIDATE_REMOVED":
      return {
        title: meta?.name ? `Candidate: ${meta.name}` : formatAction(log.action),
        description:
          log.action === "CANDIDATE_ADDED"
            ? `Added by ${adminName}`
            : log.action === "CANDIDATE_UPDATED"
              ? `Updated by ${adminName}`
              : `Removed by ${adminName}`,
      }
    case "ROLE_CREATED":
    case "ROLE_UPDATED":
    case "ROLE_DELETED":
      return {
        title: meta?.name ? `Role: ${meta.name}` : formatAction(log.action),
        description:
          log.action === "ROLE_CREATED"
            ? `Created by ${adminName}`
            : log.action === "ROLE_UPDATED"
              ? `Updated by ${adminName}`
              : `Deleted by ${adminName}`,
      }
    case "VOTER_CREATED":
    case "VOTER_ADDED":
    case "VOTER_UPDATED":
    case "VOTER_REMOVED":
    case "VOTER_DELETED":
      return {
        title: meta?.name ? `Voter: ${meta.name}` : formatAction(log.action),
        description:
          log.action === "VOTER_CREATED" || log.action === "VOTER_ADDED"
            ? `Registered by ${adminName}`
            : log.action === "VOTER_UPDATED"
              ? `Profile updated by ${adminName}`
              : `Removed by ${adminName}`,
      }
    case "VOTERS_BULK_IMPORT":
      return {
        title: "Bulk Voter Import",
        description: `Imported ${meta?.count || 0} voters by ${adminName}`,
      }
    case "VOTER_VOTE_RESET":
      return {
        title: `Reset Vote: ${meta?.name || "Voter"}`,
        description: `Ballot cleared by ${adminName}`,
      }
    case "ELECTION_CODE_REVEALED":
      return { title: "Election code revealed", description: `By ${adminName}` }
    case "ELECTION_CODE_COPIED":
      return { title: "Election code copied", description: `By ${adminName}` }
    case "ELECTION_SETTINGS_UPDATED":
    case "ELECTION_CORE_UPDATED":
      return {
        title: log.description || "Settings updated",
        description: `Configuration changed by ${adminName}`,
      }
    default:
      return {
        title: log.description || formatAction(log.action),
        description: `By ${adminName}`,
      }
  }
}

export function ElectionActivityFeed({ logs, electionId, userRole }: ElectionActivityFeedProps) {
  return (
    <Card className="overflow-hidden border-border/50 shadow-sm py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-4 py-3">
        <div className="space-y-0.5">
          <CardTitle className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <HugeiconsIcon icon={Archive01Icon} className="h-5 w-5 text-indigo-500" />
            Election Activity
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            Recent changes and events for this election
          </CardDescription>
        </div>
        {userRole !== "staff" && userRole !== "viewer" && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 gap-1 px-2 text-[10px] font-bold uppercase tracking-wider"
            asChild
          >
            <Link href="/organisation/audit-logs">
              View All
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-muted shadow-sm">
              <HugeiconsIcon icon={Archive01Icon} className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="mb-1 text-sm font-black text-foreground">No activity yet</h3>
            <p className="max-w-[240px] text-xs text-muted-foreground">
              Activity will appear here as changes are made to this election.
            </p>
          </div>
        ) : (
          <div className="max-h-[560px] divide-y divide-border/50 overflow-y-auto">
            {logs.map((log) => {
              const Icon = ENTITY_ICON_MAP[log.entityType] ?? Settings02Icon
              const colorClass =
                ENTITY_COLOR_MAP[log.entityType] ?? "bg-slate-500/10 text-slate-600"
              const statusBadge = STATUS_BADGE[log.status]
              const { title, description } = humanizeLog(log)

              return (
                <div
                  key={log.id}
                  className="group relative flex items-start gap-4 p-6 transition-all hover:bg-muted/40"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-border/50 ${colorClass}`}
                  >
                    <HugeiconsIcon icon={Icon} className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-black leading-tight text-foreground/90 transition-colors group-hover:text-foreground">
                        {title}
                      </p>
                      <Badge
                        variant="secondary"
                        className="h-5 shrink-0 whitespace-nowrap rounded-full px-2 py-0 text-[11px] font-medium tabular-nums ring-1 ring-border/5"
                      >
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <p className="line-clamp-1 text-xs font-medium leading-relaxed text-muted-foreground transition-colors group-hover:text-muted-foreground/80">
                        {description}
                      </p>
                      {log.status && log.status !== "SUCCESS" && (
                        <Badge
                          variant="outline"
                          className={`shrink-0 rounded-full border-none px-2 py-0 text-[9px] font-black uppercase tracking-widest ${statusBadge.style}`}
                        >
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
