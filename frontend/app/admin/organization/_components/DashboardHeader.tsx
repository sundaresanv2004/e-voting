"use client"

import React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  UserAdd01Icon,
  LaptopIcon,
  Calendar02Icon,
  Building06Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  orgName: string
}

export function DashboardHeader({ orgName }: DashboardHeaderProps) {
  const router = useRouter()

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="relative overflow-hidden bg-background/50 border-b lg:backdrop-blur-xl">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-primary/5 blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-blue-500/5 blur-[100px] animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-blue-500/[0.03]" />
      </div>

      <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-[18px] bg-gradient-to-tr from-primary/40 to-blue-500/40 opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-card text-primary shadow-sm ring-1 ring-border/50 transition-transform group-hover:rotate-3 duration-300">
              <HugeiconsIcon icon={Building06Icon} className="h-7 w-7 relative z-10" color="currentColor" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-black tracking-tight text-foreground md:text-3xl lg:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {orgName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-semibold tracking-wide">
              <HugeiconsIcon icon={Calendar02Icon} className="h-4 w-4 text-primary/70" color="currentColor" />
              <p>{currentDate}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/admin/organization/elections?new=true")}
            className="gap-2 shadow-lg shadow-primary/10 active:scale-[0.98] transition-all"
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              className="h-4 w-4"
              strokeWidth={2.5}
            />
            <span>Create Election</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-background/50 backdrop-blur-sm active:scale-[0.98] transition-all"
            onClick={() => router.push("/admin/organization/members")}
          >
            <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4" />
            <span className="hidden sm:inline">Add Member</span>
            <span className="sm:hidden text-xs">Member</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/organization/systems")}
            className="hidden lg:inline-flex gap-2 bg-background/50 backdrop-blur-sm active:scale-[0.98] transition-all"
          >
            <HugeiconsIcon icon={LaptopIcon} className="h-4 w-4" />
            <span>Authorize Device</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
