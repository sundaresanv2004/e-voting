"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsIcon,
  UserGroupIcon,
  ComputerIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  icon: any
  iconClassName?: string
}

function MetricCard({ title, value, description, icon, iconClassName }: MetricCardProps) {
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
        <div className="text-3xl font-black tracking-tight">{value}</div>
        <p className="text-[11px] font-medium text-muted-foreground leading-none flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 w-fit">
          <span className="h-1 w-1 rounded-full bg-primary/40" />
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

interface MetricCardsProps {
  totalElections: number
  activeElections: number
  totalMembers: number
  approvedSystems: number
  pendingSystems: number
}

export function MetricCards({
  totalElections,
  activeElections,
  totalMembers,
  approvedSystems,
  pendingSystems,
}: MetricCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <MetricCard
        title="Election Campaigns"
        value={totalElections}
        description={activeElections > 0 ? `${activeElections} live campaigns` : "No active shifts"}
        icon={MapsIcon}
        iconClassName="text-amber-600"
      />
      <MetricCard
        title="Organization Core"
        value={totalMembers}
        description="Active pulse team"
        icon={UserGroupIcon}
        iconClassName="text-cyan-600"
      />
      <MetricCard
        title="Hardware Fleet"
        value={approvedSystems}
        description={pendingSystems > 0 ? `${pendingSystems} devices awaiting sync` : "Fleet synchronized"}
        icon={ComputerIcon}
        iconClassName="text-emerald-600"
      />
    </div>
  )
}
