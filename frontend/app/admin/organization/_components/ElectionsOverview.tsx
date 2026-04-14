"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsIcon,
  ArrowRight01Icon,
  PlusSignIcon,
  Calendar02Icon,
  UserGroupIcon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface ElectionSummary {
  id: string
  name: string
  status: string
  startTime: Date
  endTime: Date
  _count: {
    candidates: number
    roles: number
  }
}

interface ElectionsOverviewProps {
  elections: ElectionSummary[]
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  UPCOMING: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  COMPLETED: "bg-secondary text-secondary-foreground",
}

export function ElectionsOverview({ elections }: ElectionsOverviewProps) {
  const router = useRouter()

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b py-3 px-5">
        <div className="space-y-1">
          <CardTitle className="text-base font-black tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={MapsIcon} className="h-4 w-4 text-amber-500" />
            Election Campaigns
          </CardTitle>
          <CardDescription className="text-[10px] font-medium">
            {elections.length === 0 ? "No active campaigns" : `Managing ${elections.length} profile${elections.length > 1 ? "s" : ""}`}
          </CardDescription>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 h-7 font-bold text-[10px] uppercase tracking-wider"
          onClick={() => router.push("/admin/organization/elections")}
        >
          View All
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {elections.length === 0 ? (
          <button
            onClick={() => router.push("/admin/organization/elections?new=true")}
            className="w-full flex flex-col items-center justify-center py-10 px-6 hover:bg-muted/30 transition-all cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm border border-border/50">
              <HugeiconsIcon icon={PlusSignIcon} className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
              Initialize First Campaign
            </p>
          </button>
        ) : (
          <div className="divide-y divide-border/40">
            {elections.map((election) => {
              const style = statusStyles[election.status] || statusStyles.UPCOMING
              return (
                <button
                  key={election.id}
                  onClick={() => router.push(`/admin/election/${election.id}`)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-muted/40 transition-all cursor-pointer text-left group relative"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary group-hover:bg-primary/10 group-hover:text-primary transition-colors ring-1 ring-border/50 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <HugeiconsIcon icon={MapsIcon} className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <p className="text-sm font-black leading-none truncate tracking-tight text-foreground group-hover:text-primary transition-colors">{election.name}</p>
                      <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0 border-none rounded-full ${style}`}>
                        {election.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 bg-muted/80 px-1.5 py-0.5 rounded-full ring-1 ring-border/50">
                        <HugeiconsIcon icon={Calendar02Icon} className="h-2.5 w-2.5 text-primary/70" />
                        {format(new Date(election.startTime), "MMM d")} – {format(new Date(election.endTime), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HugeiconsIcon icon={ShieldKeyIcon} className="h-2.5 w-2.5" />
                        {election._count.roles} Pos.
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 h-7 w-7 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm">
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
