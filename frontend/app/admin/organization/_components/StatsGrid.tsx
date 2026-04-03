"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Building01Icon, 
  Map01Icon, 
  UserGroupIcon, 
  CheckmarkCircle02Icon, 
  ComputerIcon, 
  Alert01Icon, 
  Tick02Icon,
  MapsIcon
} from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"

interface StatItemProps {
  label: string
  value: string | number
  subValue?: string
  icon: any
  variant?: "emerald" | "amber" | "indigo" | "sky" | "slate"
}

function StatItem({ label, value, subValue, icon, variant = "indigo" }: StatItemProps) {
  const getVariantStyles = (v: string) => {
    switch (v) {
      case "emerald": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5 ring-emerald-500/20"
      case "amber": return "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-amber-500/5 ring-amber-500/20"
      case "sky": return "bg-sky-500/10 text-sky-600 border-sky-500/20 shadow-sky-500/5 ring-sky-500/20"
      case "slate": return "bg-slate-500/10 text-slate-600 border-slate-500/20 shadow-slate-500/5 ring-slate-500/20"
      default: return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 shadow-indigo-500/5 ring-indigo-500/20"
    }
  }

  return (
    <Card className="border shadow-none overflow-hidden hover:shadow-md hover:border-primary/20 transition-all group active:scale-95 duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
              {subValue && (
                <span className="text-xs text-muted-foreground font-medium">{subValue}</span>
              )}
            </div>
          </div>
          <div className={`p-4 rounded-2xl border shadow-sm ring-1 transition-transform group-hover:scale-110 duration-200 ${getVariantStyles(variant)}`}>
            <HugeiconsIcon icon={icon} className="h-6 w-6" strokeWidth={1.5} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  totalElections: number
  activeElections: number
  totalMembers: number
  approvedSystems: number
  pendingSystems: number
  totalBallots: number
}

export function StatsGrid({
  totalElections,
  activeElections,
  totalMembers,
  approvedSystems,
  pendingSystems,
  totalBallots,
}: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8 max-w-7xl mx-auto -mt-6">
      <StatItem 
        label="Total Elections" 
        value={totalElections} 
        subValue={activeElections > 0 ? `${activeElections} Active` : "None Active"}
        icon={MapsIcon} 
        variant={activeElections > 0 ? "emerald" : "indigo"}
      />
      <StatItem 
        label="Organization Staff" 
        value={totalMembers} 
        subValue="Admins & Staff"
        icon={UserGroupIcon} 
        variant="indigo"
      />
      <StatItem 
        label="Voter Hardware" 
        value={approvedSystems} 
        subValue={pendingSystems > 0 ? `${pendingSystems} Pending` : "Fully Synced"}
        icon={ComputerIcon} 
        variant={pendingSystems > 0 ? "amber" : "emerald"}
      />
      <StatItem 
        label="Participation" 
        value={totalBallots} 
        subValue="Ballots Cast"
        icon={Tick02Icon} 
        variant="sky"
      />
    </div>
  )
}
