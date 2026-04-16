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
    <Card className="border-border/50 overflow-hidden py-0 gap-0">
      <CardHeader className="border-b pt-6 px-4">
        <CardTitle className="text-xs font-bold tracking-widest text-muted-foreground/80">Navigation</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border border-border/40 hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer text-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-card/10 shadow-sm ring-1 ring-border/50 transition-transform group-hover:scale-110 duration-300 relative z-10`}>
                <HugeiconsIcon icon={item.icon} className={`h-5 w-5 ${item.iconColor}`} strokeWidth={2} />
              </div>
              <div className="relative z-10">
                <p className="text-xs font-black tracking-tight leading-none group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-[10px] font-bold text-muted-foreground mt-1 tracking-tight">{getMetric(item.key)}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
