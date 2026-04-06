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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Elections</CardTitle>
          <CardDescription>
            {elections.length === 0 ? "No elections created yet" : `You have ${elections.length} election${elections.length > 1 ? "s" : ""}`}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => router.push("/admin/organization/elections")}
        >
          View All
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {elections.length === 0 ? (
          <button
            onClick={() => router.push("/admin/organization/elections?new=true")}
            className="w-full flex flex-col items-center justify-center py-10 rounded-lg border border-dashed hover:border-foreground/20 hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <HugeiconsIcon icon={PlusSignIcon} className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              Create your first election
            </p>
          </button>
        ) : (
          <div className="space-y-4">
            {elections.map((election) => {
              const style = statusStyles[election.status] || statusStyles.UPCOMING
              return (
                <button
                  key={election.id}
                  onClick={() => router.push(`/admin/election/${election.id}`)}
                  className="w-full flex items-center gap-4 p-3 -mx-1 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-left group"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <HugeiconsIcon icon={MapsIcon} className="h-4 w-4 text-amber-600" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none truncate">{election.name}</p>
                      <Badge variant="outline" className={`text-[10px] font-semibold shrink-0 ${style}`}>
                        {election.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Calendar02Icon} className="h-3 w-3" />
                        {format(new Date(election.startTime), "MMM d")} – {format(new Date(election.endTime), "MMM d, yyyy")}
                      </span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={ShieldKeyIcon} className="h-3 w-3" />
                        {election._count.roles}
                      </span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={UserGroupIcon} className="h-3 w-3" />
                        {election._count.candidates}
                      </span>
                    </div>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
