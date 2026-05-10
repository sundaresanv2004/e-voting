"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar02Icon, Building06Icon } from "@hugeicons/core-free-icons"

interface DashboardHeaderProps {
  orgName: string
  orgLogo: string | null
  userRole: string
  allowSystemConnection: boolean
}

export function DashboardHeader({ orgName, orgLogo }: DashboardHeaderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentDate = mounted
    ? new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : ""

  return (
    <div className="relative bg-background/50 border-b">
      <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full max-w-[1400px] mx-auto">
        <div className="flex items-center gap-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-card text-primary shadow-sm ring-1 ring-border/50 overflow-hidden">
            {orgLogo ? (
              <Image
                src={orgLogo}
                alt={`${orgName} logo`}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <HugeiconsIcon icon={Building06Icon} className="h-7 w-7 relative z-10" color="currentColor" />
            )}
          </div>
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-3xl lg:text-3xl">
              {orgName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-semibold tracking-wide">
              <HugeiconsIcon icon={Calendar02Icon} className="h-4 w-4 text-primary/70" color="currentColor" />
              <p>{currentDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
