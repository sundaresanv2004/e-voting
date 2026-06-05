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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import { UnfoldMoreIcon, PlusSignIcon, Archive01Icon, CheckmarkBadge01Icon } from "@hugeicons/core-free-icons"

const ELECTION_COOKIE_KEY = "last_election_id"

export function ElectionSwitcher({
  elections,
  userRole,
  activeElectionId,
}: {
  elections: {
    id: string
    name: string
    logo: React.ReactNode
    plan: string
  }[]
  userRole?: string
  activeElectionId?: string
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const activeElection =
    (activeElectionId ? elections.find(e => e.id === activeElectionId) : null) ??
    elections[0]

  // Persist discovery
  React.useEffect(() => {
    if (activeElection?.id) {
      Cookies.set(ELECTION_COOKIE_KEY, activeElection.id, { expires: 30 })
    }
  }, [activeElection?.id])

  const onSelect = (electionId: string) => {
    Cookies.set(ELECTION_COOKIE_KEY, electionId, { expires: 30 })
    router.push(`/organisation/election/${electionId}`)
  }

  return (
    <TooltipProvider delayDuration={0}>
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate font-medium cursor-default">
                        {activeElection ? activeElection.name : "No Election"}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-[10px] font-bold uppercase tracking-widest z-50">
                      {activeElection ? activeElection.name : "No Election"}
                    </TooltipContent>
                  </Tooltip>
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
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                Elections
              </DropdownMenuLabel>
              {elections.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground italic">
                  No elections found
                </div>
              )}
              {elections.map((election) => {
                const isActive = activeElection?.id === election.id
                return (
                  <DropdownMenuItem
                    key={election.id}
                    onClick={() => onSelect(election.id)}
                    className={isActive ? "text-primary" : ""}
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-lg border bg-background">
                      {election.logo}
                    </div>
                    <div className="flex flex-col flex-1 overflow-hidden">
                      <span className="truncate font-medium">
                        {election.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground font-normal capitalize">
                        {election.plan?.toLowerCase() || "active"}
                      </span>
                    </div>
                    {isActive && (
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} className="ml-auto size-4 text-primary shrink-0" strokeWidth={2} />
                    )}
                  </DropdownMenuItem>
                )
              })}
              {userRole === "ORG_ADMIN" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="info"
                    onClick={() => router.push("/organisation/elections?new=true")}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.5} className="size-3.5" />
                    Create Election
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </TooltipProvider>
  )
}
