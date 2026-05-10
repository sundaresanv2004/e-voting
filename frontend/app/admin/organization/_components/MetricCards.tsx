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
  color?: string
}

function MetricCard({ title, value, description, icon, color }: MetricCardProps) {
  return (
    <Card className="relative overflow-hidden group border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          {title}
        </CardTitle>
        <HugeiconsIcon icon={icon} className={`h-4 w-4 ${color || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black tracking-tighter">{value}</div>
        <p className="text-[10px] font-bold text-muted-foreground/70 mt-1">{description}</p>
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
}

export function MetricCards({
  totalElections,
  activeElections,
  upcomingElections,
  totalMembers,
  approvedSystems,
  pendingSystems,
}: MetricCardsProps) {
  const electionDesc = (() => {
    const parts: string[] = []
    if (activeElections > 0) parts.push(`${activeElections} live`)
    if (upcomingElections > 0) parts.push(`${upcomingElections} upcoming`)
    return parts.length > 0 ? parts.join(" · ") : "No active elections"
  })()

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {/* Election Campaigns */}
      <MetricCard
        title="Election Campaigns"
        value={totalElections}
        description={electionDesc}
        icon={MapsIcon}
        color="text-amber-600"
      />

      {/* Organization Core */}
      <MetricCard
        title="Members"
        value={totalMembers}
        description="Admins, staff, and viewers"
        icon={UserGroupIcon}
        color="text-cyan-600"
      />

      {/* Hardware Fleet */}
      <MetricCard
        title="Voting Devices"
        value={approvedSystems}
        description={pendingSystems > 0 ? `${pendingSystems} awaiting approval` : "Approved devices"}
        icon={ComputerIcon}
        color="text-emerald-600"
      />
    </div>
  )
}

