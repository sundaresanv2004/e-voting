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
  Building06Icon,
  ComputerIcon,
  Settings02Icon,
  Analytics01Icon,
  UserGroupIcon,
  ShieldKeyIcon,
  UserCircleIcon,
  MapsIcon,
  GridIcon,
  Shield02Icon,
} from "@hugeicons/core-free-icons"

const ELECTION_COOKIE_KEY = "last_election_id"

export function AppSidebar({
  elections: _elections,
  userRole,
  defaultElectionId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  elections: {
    id: string
    name: string
    status: string
    code: string
  }[]
  userRole: string
  defaultElectionId?: string
}) {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Determine active election ID from URL, then Client Cookie, then Server Cookie, then latest fetch
  const urlElectionId = params.electionId as string
  const cookieElectionId = mounted ? Cookies.get(ELECTION_COOKIE_KEY) : undefined

  // Ensure we don't use the literal string "undefined" which can happen with some router edge cases
  const isValidId = (id: string | undefined) => id && id !== "undefined" && id !== ""

  const activeElectionId =
    isValidId(urlElectionId) ? urlElectionId :
      isValidId(cookieElectionId) ? cookieElectionId :
        isValidId(defaultElectionId) ? defaultElectionId :
          _elections[0]?.id

  // 2. Format elections for switcher
  const elections = _elections.map((election) => ({
    id: election.id,
    name: election.name,
    logo: <HugeiconsIcon icon={Building06Icon} strokeWidth={2} />,
    plan: election.status,
  }))

  const navMain = [
    {
      title: "Dashboard",
      url: `/organisation/election/${activeElectionId}`,
      icon: (
        <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Candidates",
      url: `/organisation/election/${activeElectionId}/candidates`,
      icon: (
        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Roles",
      url: `/organisation/election/${activeElectionId}/roles`,
      icon: (
        <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Categories",
      url: `/organisation/election/${activeElectionId}/categories`,
      icon: (
        <HugeiconsIcon icon={GridIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Voters",
      url: `/organisation/election/${activeElectionId}/voters`,
      icon: (
        <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
      ),
    },
    {
      title: "Results",
      url: `/organisation/election/${activeElectionId}/results`,
      icon: (
        <HugeiconsIcon icon={Analytics01Icon} strokeWidth={2} />
      ),
    },
    {
      title: "Settings",
      url: `/organisation/election/${activeElectionId}/settings`,
      icon: (
        <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
      ),
    },
  ]

  const organizationNav = [
    {
      name: "Dashboard",
      url: "/organisation",
      icon: (
        <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Elections",
      url: "/organisation/elections",
      icon: (
        <HugeiconsIcon icon={MapsIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Members",
      url: "/organisation/members",
      icon: (
        <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Settings",
      url: "/organisation/settings",
      icon: (
        <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} />
      ),
    },
  ]

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <ElectionSwitcher elections={elections} userRole={userRole} activeElectionId={activeElectionId} />
      </SidebarHeader>
      <SidebarContent>
        <NavElection
          items={navMain}
          isEmpty={elections.length === 0}
          userRole={userRole}
        />
        {userRole === "ORG_ADMIN" && <NavOrganization organizationNav={organizationNav} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
