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
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  UPCOMING: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  COMPLETED: "bg-secondary text-secondary-foreground border-transparent",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  REJECTED: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  REVOKED: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
  EXPIRED: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates across your organization</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <HugeiconsIcon icon={Archive01Icon} className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium mb-1">No recent activity</h3>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              Activity will appear here as you manage elections, staff, and hardware.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {activities.map((activity, index) => {
              const config = activityConfig[activity.type] || { icon: MapsIcon, color: "text-muted-foreground", bg: "bg-muted" }
              const Icon = config.icon
              const badgeStyle = activity.status ? (statusBadgeStyles[activity.status] || "") : ""
              return (
                <div
                  key={activity.id}
                  className={`flex items-start gap-4 py-3 ${index !== activities.length - 1 ? "border-b" : ""}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md mt-0.5 ${config.bg}`}>
                    <HugeiconsIcon icon={Icon} className={`h-4 w-4 ${config.color}`} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium leading-tight truncate">
                        {activity.title}
                      </p>
                      <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0 tabular-nums">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </time>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                      {activity.description}
                    </p>
                    {activity.status && (
                      <Badge variant="outline" className={`text-[10px] font-semibold h-5 ${badgeStyle}`}>
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
