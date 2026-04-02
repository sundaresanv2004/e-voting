"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import Cookies from "js-cookie"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { UnfoldMoreIcon, PlusSignIcon, Archive01Icon } from "@hugeicons/core-free-icons"

const ELECTION_COOKIE_KEY = "last_election_id"

export function ElectionSwitcher({
  elections,
}: {
  elections: {
    id: string
    name: string
    logo: React.ReactNode
    plan: string
  }[]
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const params = useParams()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Find the active election based on URL, then Cookie, then latest
  const activeElectionId = params.electionId as string
  const cookieElectionId = mounted ? Cookies.get(ELECTION_COOKIE_KEY) : undefined

  const activeElection =
    elections.find(e => e.id === activeElectionId) ??
    elections.find(e => e.id === cookieElectionId) ??
    elections[0]

  // Persist discovery
  React.useEffect(() => {
    if (activeElection?.id) {
      Cookies.set(ELECTION_COOKIE_KEY, activeElection.id, { expires: 30 })
    }
  }, [activeElection?.id])

  const onSelect = (electionId: string) => {
    Cookies.set(ELECTION_COOKIE_KEY, electionId, { expires: 30 })
    router.push(`/admin/election/${electionId}`)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={activeElection ? activeElection.name : "Select Election"}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {activeElection ? (
                  activeElection.logo
                ) : (
                  <HugeiconsIcon
                    icon={Archive01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">
                  {activeElection ? activeElection.name : "No Election"}
                </span>
                <span className="truncate text-xs text-muted-foreground font-normal">
                  {activeElection ? activeElection.plan : "None available"}
                </span>
              </div>
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                strokeWidth={2}
                className="ml-auto opacity-50 group-data-[collapsible=icon]:hidden"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground tracking-wider px-2 py-1.5">
              Available Elections
            </DropdownMenuLabel>
            {elections.length === 0 && (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground italic">
                No elections found
              </div>
            )}
            {elections.map((election, index) => (
              <DropdownMenuItem
                key={election.id}
                onClick={() => onSelect(election.id)}
                className="gap-2 p-2 focus:bg-sidebar-accent transition-colors"
              >
                <div className="flex size-6 items-center justify-center rounded border bg-background group-hover:border-primary/50">
                  {election.logo}
                </div>
                <span className="flex-1 truncate font-medium">
                  {election.name}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="w-full justify-start gap-2 text-primary hover:cursor-pointer focus:text-primary transition-colors data-[state=collapsed]:justify-center"
              onClick={() =>
                router.push("/admin/organization/elections?new=true")
              }
            >
              <div className="flex size-6 items-center justify-center rounded-md border border-primary/20 bg-primary/5 shadow-xs">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2.5}
                  className="size-3.5"
                />
              </div>
              <div className="flex-1">Create Election</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
