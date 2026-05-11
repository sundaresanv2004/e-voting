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
import { Skeleton } from "@/components/ui/skeleton"

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

import { typeConfig, actionConfig, statusBadgeStyles } from "./activity-config"

export function ActivityTimeline({
  activities,
  title = "Organization Activity",
  description = "Recent member, system, and security events",
  auditHref,
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
        {auditHref && (
          <Button
            variant="secondary"
            size="sm"
            className="h-7 text-[10px] uppercase font-bold tracking-wider px-2 gap-1"
            onClick={() => router.push(auditHref)}
          >
            View All
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
          </Button>
        )}
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
export function ActivityTimelineSkeleton() {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40 rounded-lg" />
          <Skeleton className="h-3 w-32 rounded-full" />
        </div>
        <Skeleton className="h-7 w-20 rounded-full" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start gap-4 p-6">
              <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

