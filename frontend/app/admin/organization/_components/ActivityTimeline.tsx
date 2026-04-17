"use client"

import React from "react"
import { formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsIcon,
  LaptopIcon,
  UserAdd01Icon,
  Archive01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
}

const activityConfig = {
  ELECTION: { icon: MapsIcon, color: "text-amber-600", bg: "bg-amber-500/10" },
  SYSTEM: { icon: LaptopIcon, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  MEMBER: { icon: UserAdd01Icon, color: "text-cyan-600", bg: "bg-cyan-500/10" },
}

const statusBadgeStyles: Record<string, string> = {
  // Election Status
  ACTIVE: "bg-green-500/10 text-green-600 border-green-500/20",
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
}


export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card className="border-border/50 overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b pt-6">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={Archive01Icon} className="h-5 w-5 text-indigo-500" />
            Operational Pulse
          </CardTitle>
          <CardDescription className="text-xs font-medium">
            Real-time feed of organizational events
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4 shadow-sm border border-border/50">
              <HugeiconsIcon icon={Archive01Icon} className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-sm font-black text-foreground mb-1">Pulse Synchronized</h3>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              No recent events detected. Your organizational heartbeat will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type] || { icon: MapsIcon, color: "text-muted-foreground", bg: "bg-muted" }
              const Icon = config.icon
              const badgeStyle = activity.status ? (statusBadgeStyles[activity.status] || "") : ""
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-5 hover:bg-muted/30 transition-all group relative"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 duration-300 shadow-sm ring-1 ring-border/50 ${config.bg}`}>
                    <HugeiconsIcon icon={Icon} className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-black leading-tight text-foreground/90 group-hover:text-foreground transition-colors truncate">
                        {activity.title}
                      </p>
                      <time className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60 whitespace-nowrap shrink-0 tabular-nums bg-muted/50 px-2 py-0.5 rounded-full border border-border/40">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </time>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-1 group-hover:text-muted-foreground/80 transition-colors">
                      {activity.description}
                    </p>
                    {activity.status && (
                      <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0 border-none rounded-full ${badgeStyle}`}>
                        {activity.status}
                      </Badge>
                    )}
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
