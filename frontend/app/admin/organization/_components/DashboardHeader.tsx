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
    <div className="relative overflow-hidden border-b">
      <div className="relative z-10 flex flex-col space-y-4 py-6 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full">
        <div className="flex items-center gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-muted text-foreground shadow-sm ring-1 ring-border">
            <HugeiconsIcon icon={Building06Icon} className="h-6 w-6 relative z-10" color="currentColor" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {orgName}
            </h1>
            <div className="flex items-center text-sm text-muted-foreground">
              <HugeiconsIcon icon={Calendar02Icon} className="mr-1.5 h-4 w-4" color="currentColor" />
              <p className="font-medium">{currentDate}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/admin/organization/elections?new=true")}
          >
            <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4" strokeWidth={2.5} />
            <span>Create Election</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/organization/members")}
          >
            <HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4" />
            <span>Invite Member</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/organization/systems")}
            className="hidden sm:inline-flex"
          >
            <HugeiconsIcon icon={LaptopIcon} className="h-4 w-4" />
            <span>Authorize Device</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
