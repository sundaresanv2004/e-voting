"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, LaptopIcon } from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface HardwareHealthProps {
  approved: number
  pending: number
  rejected: number
  revoked: number
}

export function HardwareHealth({ approved, pending, rejected, revoked }: HardwareHealthProps) {
  const router = useRouter()
  const total = approved + pending + rejected + revoked

  const segments = [
    { label: "Approved", count: approved, barClass: "bg-emerald-500", dotClass: "bg-emerald-500" },
    { label: "Pending", count: pending, barClass: "bg-amber-500", dotClass: "bg-amber-500" },
    { label: "Rejected", count: rejected, barClass: "bg-red-500", dotClass: "bg-red-500" },
    { label: "Revoked", count: revoked, barClass: "bg-zinc-400 dark:bg-zinc-500", dotClass: "bg-zinc-400 dark:bg-zinc-500" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Systems</CardTitle>
          <CardDescription>
            {total} registered {total === 1 ? "device" : "devices"}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => router.push("/admin/organization/systems")}
        >
          Manage
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <HugeiconsIcon icon={LaptopIcon} className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No devices connected yet</p>
          </div>
        ) : (
          <>
            {/* Horizontal status bar */}
            <div className="flex h-2 rounded-full overflow-hidden bg-muted">
              {segments.map((seg) => {
                if (seg.count === 0) return null
                return (
                  <div
                    key={seg.label}
                    className={`${seg.barClass} transition-all duration-300`}
                    style={{ width: `${(seg.count / total) * 100}%` }}
                  />
                )
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4">
              {segments.map((seg) => (
                <div key={seg.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${seg.dotClass}`} />
                    <span className="text-xs text-muted-foreground">{seg.label}</span>
                  </div>
                  <span className="text-xs font-medium tabular-nums">{seg.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
