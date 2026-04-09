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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <HugeiconsIcon icon={icon} className={`h-4 w-4 ${iconClassName || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
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
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        title="Total Elections"
        value={totalElections}
        description={activeElections > 0 ? `${activeElections} currently active` : "No active elections"}
        icon={MapsIcon}
        iconClassName="text-amber-600"
      />
      <MetricCard
        title="Organization Staff"
        value={totalMembers}
        description="Total members"
        icon={UserGroupIcon}
        iconClassName="text-cyan-600"
      />
      <MetricCard
        title="Authorized Systems"
        value={approvedSystems}
        description={pendingSystems > 0 ? `${pendingSystems} pending approval` : "All systems synced"}
        icon={ComputerIcon}
        iconClassName="text-emerald-600"
      />
    </div>
  )
}
