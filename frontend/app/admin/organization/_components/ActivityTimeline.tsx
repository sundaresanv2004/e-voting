"use client"

import React from "react"
import { formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsIcon,
  Archive01Icon,
  ArrowRight01Icon,
  Settings02Icon,
  ViewIcon,
  ComputerIcon,
  LockKeyIcon,
  Alert01Icon,
  Building06Icon,
  UserGroupIcon,
  UserRemove01Icon,
  Analytics01Icon,
  ShieldKeyIcon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export interface ActivityItem {
  id: string
  type: "ELECTION" | "SYSTEM" | "MEMBER"
  action?: string
  title: string
  description: string
  timestamp: Date
  status?: string
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  title?: string
  description?: string
  auditHref?: string
}

// Fallback by broad type
const typeConfig = {
  ELECTION: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  SYSTEM: { icon: ComputerIcon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  MEMBER: { icon: UserGroupIcon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
}

// Action-specific icons take priority
const actionConfig: Record<string, { icon: any; color: string; bg: string }> = {
  // Election lifecycle
  ELECTION_CREATED: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_UPDATED: { icon: Settings02Icon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_STATUS_CHANGED: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_SETTINGS_UPDATED: { icon: Settings02Icon, color: "text-amber-600", bg: "bg-amber-500/10" },
  SETTINGS_UPDATED: { icon: Settings02Icon, color: "text-amber-600", bg: "bg-amber-500/10" },
  // Election code
  ELECTION_CODE_REVEALED: { icon: ViewIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ELECTION_CODE_COPIED: { icon: ViewIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  // Organization code
  ORG_CODE_REVEALED: { icon: ViewIcon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  ORG_CODE_COPIED: { icon: ViewIcon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  // Candidates & roles
  CANDIDATE_ADDED: { icon: UserGroupIcon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  CANDIDATE_DELETED: { icon: UserGroupIcon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  ROLE_CREATED: { icon: ShieldKeyIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  ROLE_DELETED: { icon: ShieldKeyIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  // Voters
  VOTER_ADDED: { icon: UserCircleIcon, color: "text-blue-600", bg: "bg-blue-500/10" },
  VOTER_DELETED: { icon: UserCircleIcon, color: "text-blue-600", bg: "bg-blue-500/10" },
  // Results
  RESULTS_GENERATED: { icon: Analytics01Icon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  RESULTS_PUBLISHED: { icon: Analytics01Icon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  // Members
  MEMBER_ADDED: { icon: UserGroupIcon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
  MEMBER_UPDATED: { icon: UserGroupIcon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
  MEMBER_LEFT: { icon: UserRemove01Icon, color: "text-rose-600", bg: "bg-rose-500/10" },
  MEMBER_REMOVED: { icon: UserRemove01Icon, color: "text-rose-600", bg: "bg-rose-500/10" },
  // Systems
  SYSTEM_APPROVED: { icon: ComputerIcon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  SYSTEM_REVOKED: { icon: LockKeyIcon, color: "text-zinc-600", bg: "bg-zinc-500/10" },
  SYSTEM_REJECTED: { icon: Alert01Icon, color: "text-red-600", bg: "bg-red-500/10" },
  SYSTEM_CONNECTED: { icon: ComputerIcon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  // Organization
  ORGANIZATION_CREATED: { icon: Building06Icon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  ORGANIZATION_UPDATED: { icon: Building06Icon, color: "text-indigo-600", bg: "bg-indigo-500/10" },
}

const statusBadgeStyles: Record<string, string> = {
  // Election Status
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  PAUSED: "bg-amber-500/10 text-amber-600 border-amber-500/20",

  // System Status
  APPROVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  REJECTED: "bg-red-500/10 text-red-600 border-red-500/20",
  REVOKED: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
  EXPIRED: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  SUSPENDED: "bg-purple-500/10 text-purple-600 border-purple-500/20",

  // Member Roles
  ORG_ADMIN: "bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  STAFF: "bg-sky-50/50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  VIEWER: "bg-slate-50/50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
  // General Status
  SUCCESS: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  FAILED: "bg-red-500/10 text-red-600 border-red-500/20",
}

export function ActivityTimeline({
  activities,
  title = "Organization Activity",
  description = "Recent member, system, and security events",
  auditHref = "/admin/organization/audit",
}: ActivityTimelineProps) {
  const router = useRouter()

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={Archive01Icon} className="h-5 w-5 text-indigo-500" />
            {title}
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            {description}
          </CardDescription>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-[10px] uppercase font-bold tracking-wider px-2 gap-1"
          onClick={() => router.push(auditHref)}
        >
          View All
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
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
          /* ~8 items visible (each ~72px tall) then scroll */
          <div className="divide-y divide-border/50 max-h-[576px] overflow-y-auto">
            {activities.map((activity) => {
              const config = (activity.action && actionConfig[activity.action])
                || typeConfig[activity.type]
                || typeConfig.MEMBER
              const Icon = config.icon
              const badgeStyle = activity.status ? (statusBadgeStyles[activity.status] || "") : ""
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-6 hover:bg-muted/40 transition-all group relative"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ring-1 ring-border/50 ${config.bg}`}>
                    <HugeiconsIcon icon={Icon} className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-black leading-tight text-foreground/90 group-hover:text-foreground transition-colors truncate">
                        {activity.title}
                      </p>
                      <Badge variant="secondary" className="text-[11px] font-medium whitespace-nowrap shrink-0 tabular-nums px-2 py-0 h-5 rounded-full ring-1 ring-border/5">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">
                        {activity.description}
                      </p>
                      {activity.status && (
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0 border-none rounded-full shrink-0 ${badgeStyle}`}>
                          {activity.status}
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

