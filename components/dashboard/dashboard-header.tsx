"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Home01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ThemeSwitch } from "@/components/shared/theme-switch"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DashboardHeader() {
  const pathname = usePathname()

  // Simple Breadcrumb logic: /admin/organization/members -> Organization > Members
  const pathSegments = pathname.split('/').filter(Boolean)
  const isElectionContext = pathSegments.includes('election')
  const isOrganizationContext = pathSegments.includes('organization')
  const isUserContext = pathSegments.includes('user')

  let contextLabel = "Dashboard"
  let contextHref = "/dashboard"
  if (isElectionContext) {
    contextLabel = "Election"
    // If we have an ID like /dashboard/election/[id]/...
    if (pathSegments.length > 2) {
      contextHref = `/dashboard/election/${pathSegments[2]}`
    }
  }
  if (isOrganizationContext) {
    contextLabel = "Organization"
    contextHref = "/dashboard/organization"
  }
  if (isUserContext) {
    contextLabel = "User"
    contextHref = "/dashboard/user/settings"
  }

  let pageLabel = "Dashboard"
  // Heuristic for dashboard vs subpage:
  // /dashboard/organization (2 segments) or /dashboard/election/id (3 segments) are dashboards.
  if (isOrganizationContext && pathSegments.length > 2) {
    const last = pathSegments[pathSegments.length - 1]
    pageLabel = last.charAt(0).toUpperCase() + last.slice(1)
  } else if (isElectionContext && pathSegments.length > 3) {
    const last = pathSegments[pathSegments.length - 1]
    pageLabel = last.charAt(0).toUpperCase() + last.slice(1)
  } else if (isUserContext && pathSegments.length > 2) {
    const last = pathSegments[pathSegments.length - 1]
    pageLabel = last.charAt(0).toUpperCase() + last.slice(1)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="-ml-1" />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">
              Toggle Sidebar
            </TooltipContent>
          </Tooltip>
          <div className="h-4 w-px bg-border/60 mx-1.5" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={contextHref} className="font-medium">
                    {contextLabel}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-semibold text-foreground">{pageLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
              >
                <Link href="/">
                  <HugeiconsIcon icon={Home01Icon} className="h-4 w-4" strokeWidth={2} />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] font-bold uppercase tracking-widest">
              Go Home
            </TooltipContent>
          </Tooltip>
          <div className="h-4 w-px bg-border/60 mx-1" />
          <ThemeSwitch />
        </div>
      </header>
    </TooltipProvider>
  )
}
