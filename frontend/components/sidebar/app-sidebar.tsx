"use client"

import * as React from "react"

import { NavElection } from "@/components/sidebar/nav-election"
import { NavOrganization } from "@/components/sidebar/nav-organization"
import { NavUser } from "@/components/sidebar/nav-user"
import { ElectionSwitcher } from "@/components/sidebar/election-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { LayoutBottomIcon, AudioWave01Icon, CommandIcon, ComputerTerminalIcon, RoboticIcon, BookOpen02Icon, Settings05Icon, CropIcon, PieChartIcon, MapsIcon } from "@hugeicons/core-free-icons"

// This is sample data targeting our generic route structure.
// Later, this will be fetched dynamically or built via a context provider.
const activeElectionId = "placeholder-election-id"

const data = {
  user: {
    name: "System Admin",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  elections: [
    {
      name: "Student Council 2026",
      logo: (
        <HugeiconsIcon icon={AudioWave01Icon} strokeWidth={2} />
      ),
      plan: "Active",
    },
    {
      name: "Board Member Election",
      logo: (
        <HugeiconsIcon icon={CommandIcon} strokeWidth={2} />
      ),
      plan: "Draft",
    },
  ],
  navMain: [
    {
      title: "Election Overview",
      url: `/admin/election/${activeElectionId}`,
      icon: (
        <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
      ),
      isActive: true,
      items: [],
    },
    {
      title: "Candidates",
      url: `/admin/election/${activeElectionId}/candidates`,
      icon: (
        <HugeiconsIcon icon={CropIcon} strokeWidth={2} />
      ),
      items: [], // Expandable if we want sub-menus later
    },
    {
      title: "Voters",
      url: `/admin/election/${activeElectionId}/voters`,
      icon: (
        <HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />
      ),
      items: [],
    },
    {
      title: "Results",
      url: `/admin/election/${activeElectionId}/results`,
      icon: (
        <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />
      ),
      items: [],
    },
    {
      title: "Election Settings",
      url: `/admin/election/${activeElectionId}/settings`,
      icon: (
        <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      ),
      items: [],
    },
  ],
  organizationNav: [
    {
      name: "Org Dashboard",
      url: "/admin/organization",
      icon: (
        <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
      ),
    },
    {
      name: "All Elections",
      url: "/admin/organization/elections",
      icon: (
        <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Members",
      url: "/admin/organization/members",
      icon: (
        <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Authorized Systems",
      url: "/admin/organization/systems",
      icon: (
        <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Org Settings",
      url: "/admin/organization/settings",
      icon: (
        <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <ElectionSwitcher elections={data.elections} />
      </SidebarHeader>
      <SidebarContent>
        <NavElection items={data.navMain} />
        <NavOrganization organizationNav={data.organizationNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
