"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TeamSnapshotProps {
  adminCount: number
  staffCount: number
  viewerCount: number
  totalMembers: number
}

export function TeamSnapshot({ adminCount, staffCount, viewerCount, totalMembers }: TeamSnapshotProps) {
  const router = useRouter()

  const roles = [
    { label: "Admins", count: adminCount, barClass: "bg-indigo-500", dotClass: "bg-indigo-500" },
    { label: "Staff", count: staffCount, barClass: "bg-sky-500", dotClass: "bg-sky-500" },
    { label: "Viewers", count: viewerCount, barClass: "bg-slate-400 dark:bg-slate-500", dotClass: "bg-slate-400 dark:bg-slate-500" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-base">Team</CardTitle>
          <CardDescription>
            {totalMembers} {totalMembers === 1 ? "member" : "members"}
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={() => router.push("/admin/organization/members")}
        >
          Manage
          <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {totalMembers === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">No members yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => {
              const pct = totalMembers > 0 ? (role.count / totalMembers) * 100 : 0
              return (
                <div key={role.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${role.dotClass}`} />
                      <span className="text-muted-foreground">{role.label}</span>
                    </div>
                    <span className="font-medium tabular-nums">{role.count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${role.barClass} transition-all duration-300`}
                      style={{ width: `${Math.max(pct, role.count > 0 ? 4 : 0)}%` }}
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
