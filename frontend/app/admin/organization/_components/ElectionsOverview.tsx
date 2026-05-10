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
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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
  allowNota: boolean
  allowMultipleVotes: boolean
}

interface ElectionsOverviewProps {
  elections: ElectionSummary[]
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  UPCOMING: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  PAUSED: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function ElectionsOverview({ elections }: ElectionsOverviewProps) {
  const router = useRouter()

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={MapsIcon} className="h-5 w-5 text-amber-500" />
            Election Campaigns
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            {elections.length === 0 ? "No active campaigns" : `Managing ${elections.length} profile${elections.length > 1 ? "s" : ""}`}
          </CardDescription>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-[10px] uppercase font-bold tracking-wider px-2 gap-1"
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
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center mb-3 transition-colors shadow-sm border border-border/50">
              <HugeiconsIcon icon={PlusSignIcon} className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-black text-foreground group-hover:text-primary transition-colors">
              Initialize First Campaign
            </p>
          </button>
        ) : (
          <div className="divide-y divide-border/50">
            {elections.map((election) => {
              const style = statusStyles[election.status] || statusStyles.UPCOMING
              const isCancelled = election.status === "CANCELLED"
              return (
                <button
                  key={election.id}
                  onClick={() => router.push(`/admin/election/${election.id}`)}
                  className={`w-full flex items-center justify-between p-6 hover:bg-muted/40 transition-all cursor-pointer text-left group relative ${isCancelled ? "opacity-50 hover:opacity-70" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <HugeiconsIcon icon={MapsIcon} className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors ${isCancelled ? "line-through" : ""}`}>{election.name}</p>
                        <Badge variant="outline" className={`text-[9px] font-black uppercase tracking-widest px-2 py-0 border-none rounded-full ${style}`}>
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
                        {election.allowNota && (
                          <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full ring-1 ring-amber-500/20">
                            NOTA
                          </span>
                        )}
                        {election.allowMultipleVotes && (
                          <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded-full ring-1 ring-indigo-500/20">
                            Multi-Vote
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
export function ElectionsOverviewSkeleton() {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-7 w-20" />
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

