"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Cookies from "js-cookie"

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

const ELECTION_COOKIE_KEY = "last_election_id"

export function AppSidebar({ 
  elections: _elections,
  ...props 
}: React.ComponentProps<typeof Sidebar> & {
  elections: {
    id: string
    name: string
    status: string
    code: string
  }[]
}) {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // 1. Determine active election ID from URL, then Cookie, then latest fetch
  const urlElectionId = params.electionId as string
  const cookieElectionId = mounted ? Cookies.get(ELECTION_COOKIE_KEY) : undefined
  
  const activeElectionId = 
    urlElectionId ?? 
    cookieElectionId ?? 
    _elections[0]?.id

  // 2. Format elections for switcher
  const elections = _elections.map((election) => ({
    id: election.id,
    name: election.name,
    logo: <HugeiconsIcon icon={AudioWave01Icon} strokeWidth={2} />,
    plan: election.status,
  }))

  const navMain = [
    {
      title: "Dashboard",
      url: `/admin/election/${activeElectionId}`,
      icon: (
        <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
      ),
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
  ]

  const organizationNav = [
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
  ]

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <ElectionSwitcher elections={elections} />
      </SidebarHeader>
      <SidebarContent>
        <NavElection 
          items={navMain} 
          isEmpty={elections.length === 0}
        />
        <NavOrganization organizationNav={organizationNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
