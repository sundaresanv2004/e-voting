"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsIcon,
  UserGroupIcon,
  ComputerIcon,
  Alert01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: any
  iconClassName?: string
  subLabel?: string
}

function MetricCard({ title, value, description, icon, iconClassName, subLabel }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden group transition-all duration-300 border-border/50">
      <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-colors" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
          {title}
        </CardTitle>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-card/10 shadow-sm ring-1 ring-border/50 transition-transform group-hover:scale-110 duration-300`}>
          <HugeiconsIcon icon={icon} className={`h-4 w-4 ${iconClassName || "text-muted-foreground"}`} />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-[11px] font-medium text-muted-foreground leading-none flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 w-fit">
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          {description}
        </p>
        {subLabel && (
          <p className="text-[10px] font-semibold text-muted-foreground/60 pt-0.5 pl-1">{subLabel}</p>
        )}
      </CardContent>
    </Card>
  )
}

interface MetricCardsProps {
  totalElections: number
  activeElections: number
  upcomingElections: number
  totalMembers: number
  approvedSystems: number
  pendingSystems: number
  lockedUserCount: number
}

export function MetricCards({
  totalElections,
  activeElections,
  upcomingElections,
  totalMembers,
  approvedSystems,
  pendingSystems,
  lockedUserCount,
}: MetricCardsProps) {
  const electionDesc = (() => {
    const parts: string[] = []
    if (activeElections > 0) parts.push(`${activeElections} live`)
    if (upcomingElections > 0) parts.push(`${upcomingElections} upcoming`)
    return parts.length > 0 ? parts.join(" · ") : "No active elections"
  })()

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* Election Campaigns */}
      <MetricCard
        title="Election Campaigns"
        value={totalElections}
        description={electionDesc}
        icon={MapsIcon}
        iconClassName="text-amber-600"
      />

      {/* Organization Core */}
      <MetricCard
        title="Members"
        value={totalMembers}
        description="Admins, staff, and viewers"
        icon={UserGroupIcon}
        iconClassName="text-cyan-600"
      />

      {/* Hardware Fleet */}
      <MetricCard
        title="Voting Devices"
        value={approvedSystems}
        description={pendingSystems > 0 ? `${pendingSystems} awaiting approval` : "Approved devices"}
        icon={ComputerIcon}
        iconClassName="text-emerald-600"
      />

      <MetricCard
        title="Locked Accounts"
        value={lockedUserCount}
        description={lockedUserCount > 0 ? "Needs admin review" : "No active lockouts"}
        icon={Alert01Icon}
        iconClassName={lockedUserCount > 0 ? "text-destructive" : "text-muted-foreground"}
      />
    </div>
  )
}
