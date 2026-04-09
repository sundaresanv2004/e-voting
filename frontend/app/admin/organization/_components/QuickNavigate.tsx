"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MapsIcon,
  UserGroupIcon,
  LaptopIcon,
  Settings05Icon,
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
    iconColor: "text-amber-600",
  },
  {
    key: "members",
    label: "Members",
    href: "/admin/organization/members",
    icon: UserGroupIcon,
    iconColor: "text-cyan-600",
  },
  {
    key: "systems",
    label: "Systems",
    href: "/admin/organization/systems",
    icon: LaptopIcon,
    iconColor: "text-emerald-600",
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/organization/settings",
    icon: Settings05Icon,
    iconColor: "text-indigo-600",
  },
]

export function QuickNavigate({ electionCount, memberCount, systemCount }: QuickNavigateProps) {
  const router = useRouter()

  const getMetric = (key: string) => {
    switch (key) {
      case "elections": return `${electionCount} ${electionCount === 1 ? "election" : "elections"}`
      case "members": return `${memberCount} ${memberCount === 1 ? "member" : "members"}`
      case "systems": return `${systemCount} ${systemCount === 1 ? "device" : "devices"}`
      case "settings": return "Configure"
      default: return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Links</CardTitle>
        <CardDescription>Navigate to a section</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-start gap-2.5 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer text-left group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <HugeiconsIcon icon={item.icon} className={`h-4 w-4 ${item.iconColor}`} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{getMetric(item.key)}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
