"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ComputerIcon } from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface HardwareHealthProps {
  approved: number
  pending: number
  rejected: number
  revoked: number
  suspended: number
  expired: number
}

export function HardwareHealth({ approved, pending, rejected, revoked, suspended, expired }: HardwareHealthProps) {
  const router = useRouter()
  const total = approved + pending + rejected + revoked + suspended + expired

  const segments = [
    { label: "Approved", count: approved, barClass: "bg-emerald-500", dotClass: "bg-emerald-500", warn: false },
    { label: "Pending", count: pending, barClass: "bg-amber-500", dotClass: "bg-amber-500", warn: pending > 0 },
    { label: "Rejected", count: rejected, barClass: "bg-red-500", dotClass: "bg-red-500", warn: rejected > 0 },
    { label: "Revoked", count: revoked, barClass: "bg-zinc-400 dark:bg-zinc-500", dotClass: "bg-zinc-400 dark:bg-zinc-500", warn: false },
    { label: "Suspended", count: suspended, barClass: "bg-purple-500", dotClass: "bg-purple-500", warn: suspended > 0 },
    { label: "Expired", count: expired, barClass: "bg-orange-500", dotClass: "bg-orange-500", warn: expired > 0 },
  ]

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 pt-6 px-4">
        <div className="space-y-0.5">
          <CardTitle className="text-md font-bold tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={ComputerIcon} className="h-5 w-5 text-emerald-500" />
            Hardware Fleet
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">
            {total} Synchronized {total === 1 ? "Device" : "Devices"}
          </CardDescription>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-[10px] uppercase font-black tracking-wider px-2"
          onClick={() => router.push("/admin/organization/systems")}
        >
          Explore
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4 pb-6">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <HugeiconsIcon icon={ComputerIcon} className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No devices connected yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {segments.filter(seg => seg.count > 0 || seg.label === "Approved").map((seg) => {
              const pct = total > 0 ? (seg.count / total) * 100 : 0
              return (
                <div key={seg.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${seg.dotClass}`} />
                      <span className={`font-medium ${seg.warn ? "text-destructive font-bold" : "text-muted-foreground"}`}>
                        {seg.label}
                      </span>
                    </div>
                    <span className={`font-bold tabular-nums ${seg.warn ? "text-destructive" : "text-foreground"}`}>
                      {seg.count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${seg.barClass} transition-all duration-300`}
                      style={{ width: `${Math.max(pct, seg.count > 0 ? 4 : 0)}%` }}
                    />
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

export function HardwareHealthSkeleton() {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 pt-6 px-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        <Skeleton className="h-7 w-16 rounded-full" />
      </CardHeader>
      <CardContent className="pt-4 pb-6 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-4 rounded-full" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
