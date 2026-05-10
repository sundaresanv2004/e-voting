"use client"

import React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsIcon,
  UserGroupIcon,
  LaptopIcon,
  Settings05Icon,
  DashboardCircleIcon,
  ArrowRight01Icon
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface QuickNavigateProps {
  electionCount: number
  memberCount: number
  systemCount: number
}

const navItems = [
  {
    key: "elections",
    label: "Elections",
    href: "/admin/organization/elections",
    icon: MapsIcon,
    hoverText: "group-hover:text-amber-600",
  },
  {
    key: "members",
    label: "Members",
    href: "/admin/organization/members",
    icon: UserGroupIcon,
    hoverText: "group-hover:text-cyan-600",
  },
  {
    key: "systems",
    label: "Systems",
    href: "/admin/organization/systems",
    icon: LaptopIcon,
    hoverText: "group-hover:text-emerald-600",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/organization/settings",
    icon: Settings05Icon,
    hoverText: "group-hover:text-indigo-600",
  },
]

export function QuickNavigate({ electionCount, memberCount, systemCount }: QuickNavigateProps) {
  const getMetric = (key: string) => {
    switch (key) {
      case "elections": return "Manage campaigns & active polls"
      case "members": return "Team roles & access control"
      case "systems": return "Hardware fleet & device pairing"
      case "settings": return "Global organization preferences"
      default: return ""
    }
  }

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden py-0 gap-0">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 py-3 px-4">
        <div className="space-y-0.5">
          <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
            <HugeiconsIcon icon={DashboardCircleIcon} className="h-5 w-5 text-primary" />
            Management Core
          </CardTitle>
          <CardDescription className="text-[11px] font-bold">Quick navigation menu</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {navItems.map((item, index) => {
            const isBottomRow = index >= navItems.length - 2
            const isLast = index === navItems.length - 1

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`p-6 hover:bg-muted/40 transition-all border-b sm:border-r sm:[&:nth-child(2n)]:border-r-0 flex items-center justify-between group ${isBottomRow ? 'sm:border-b-0' : ''} ${isLast ? 'border-b-0' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 bg-muted text-muted-foreground ${item.hoverText}`}>
                    <HugeiconsIcon icon={item.icon} className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-black text-sm tracking-tight">{item.label}</p>
                    <p className="text-[11px] font-bold text-muted-foreground tracking-tight">{getMetric(item.key)}</p>
                  </div>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all shrink-0" />
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}


