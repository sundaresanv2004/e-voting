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
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Map URL segment → display label
const PAGE_LABELS: Record<string, string> = {
  organisation: "Organisation",
  elections: "Elections",
  members: "Members",
  settings: "Settings",
  candidates: "Candidates",
  roles: "Roles",
  categories: "Categories",
  voters: "Voters",
  results: "Results",
}

function getBreadcrumb(pathname: string): {
  contextLabel: string
  contextHref: string
  pageLabel: string
} {
  // e.g. ["organisation", "election", "abc123", "candidates"]
  const segments = pathname.split("/").filter(Boolean)

  const electionIdx = segments.indexOf("election")
  const isElectionContext = electionIdx !== -1
  const electionId = isElectionContext ? segments[electionIdx + 1] : undefined

  if (isElectionContext) {
    // Sub-page under an election?
    const subPage = segments[electionIdx + 2] // e.g. "candidates"
    return {
      contextLabel: "Election",
      contextHref: `/organisation/election/${electionId}`,
      pageLabel: subPage ? (PAGE_LABELS[subPage] ?? cap(subPage)) : "Dashboard",
    }
  }

  // Org-level page
  const lastSeg = segments[segments.length - 1]
  const isRoot = lastSeg === "organisation"

  return {
    contextLabel: "Organisation",
    contextHref: "/organisation",
    pageLabel: isRoot ? "Dashboard" : (PAGE_LABELS[lastSeg] ?? cap(lastSeg)),
  }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function DashboardHeader() {
  const pathname = usePathname()
  const { contextLabel, contextHref, pageLabel } = getBreadcrumb(pathname)
  const isRoot = pathname === "/organisation"

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />

        <div className="h-4 w-px bg-border/60 mx-1.5" />

        <Breadcrumb>
          <BreadcrumbList>
            {/* Context crumb — hidden on mobile, hidden when already at root */}
            {!isRoot && (
              <>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link href={contextHref} className="font-medium">
                      {contextLabel}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">
                {pageLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild variant="ghost" size="icon">
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
  )
}
