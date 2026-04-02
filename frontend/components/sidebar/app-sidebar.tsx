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
import {
  LayoutBottomIcon,
  AudioWave01Icon,
  CommandIcon,
  ComputerTerminalIcon,
  RoboticIcon,
  Settings05Icon,
  PieChartIcon,
  MapsIcon,
  UserGroupIcon,
  ShieldKeyIcon,
} from "@hugeicons/core-free-icons"

// This is sample data targeting our generic route structure.
// Later, this will be fetched dynamically or built via a context provider.
const activeElectionId = "placeholder-election-id"

const data = {
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
      title: "Dashboard",
      url: `/admin/election/${activeElectionId}`,
      icon: (
        <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
      ),
      isActive: true,
    },
    {
      title: "Candidates",
      url: `/admin/election/${activeElectionId}/candidates`,
      icon: (
        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Roles",
      url: `/admin/election/${activeElectionId}/roles`,
      icon: (
        <HugeiconsIcon icon={ShieldKeyIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Results",
      url: `/admin/election/${activeElectionId}/results`,
      icon: (
        <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Settings",
      url: `/admin/election/${activeElectionId}/settings`,
      icon: (
        <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      ),
    },
  ],
  organizationNav: [
    {
      name: "Dashboard",
      url: "/admin/organization",
      icon: (
        <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Elections",
      url: "/admin/organization/elections",
      icon: (
        <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Members",
      url: "/admin/organization/members",
      icon: (
        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Systems",
      url: "/admin/organization/systems",
      icon: (
        <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Settings",
      url: "/admin/organization/settings",
      icon: (
        <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <ElectionSwitcher elections={data.elections} />
      </SidebarHeader>
      <SidebarContent>
        <NavElection items={data.navMain} />
        <NavOrganization organizationNav={data.organizationNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
