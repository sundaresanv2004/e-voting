"use client"

import Link from "react-router-dom" // Wait, this is Next.js. I should use next/link.
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, MapsIcon } from "@hugeicons/core-free-icons"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavElection({
  items,
  isEmpty,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
  }[]
  isEmpty?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()

  if (isEmpty) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Election</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-3 mb-2 rounded-lg border border-dashed border-sidebar-border bg-sidebar-accent/30 text-center">
              <HugeiconsIcon icon={MapsIcon} className="mx-auto mb-2 h-4 w-4 text-sidebar-foreground/50" />
              <p className="text-[11px] font-medium text-sidebar-foreground/60 leading-tight">
                No active election found
              </p>
            </div>
            <SidebarMenuButton 
              className="w-full justify-start gap-2 text-primary hover:text-primary transition-colors"
              onClick={() => router.push("/admin/organization/elections?new=true")}
            >
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="h-4 w-4" />
              <span className="font-semibold text-xs">Create New Election</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Election</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url
          
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                isActive={isActive}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
