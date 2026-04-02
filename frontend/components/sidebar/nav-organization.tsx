"use client"

import Link from "next/link"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavOrganization({
  organizationNav,
}: {
  organizationNav: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Organization</SidebarGroupLabel>
      <SidebarMenu>
        {organizationNav.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild tooltip={item.name}>
              <Link href={item.url}>
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
