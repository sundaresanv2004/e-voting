"use client"

import React from "react"
import { formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsIcon,
  LaptopIcon,
  UserAdd01Icon,
  Archive01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export interface ActivityItem {
  id: string
  type: "ELECTION" | "SYSTEM" | "MEMBER"
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

const activityConfig = {
  ELECTION: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  SYSTEM: { icon: LaptopIcon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  MEMBER: { icon: UserAdd01Icon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
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
          /* ~6 items visible (each ~72px tall) then scroll */
          <div className="divide-y divide-border/50 max-h-[432px] overflow-y-auto">
            {activities.map((activity) => {
              const config = activityConfig[activity.type] || { icon: MapsIcon, color: "text-muted-foreground", bg: "bg-muted" }
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

