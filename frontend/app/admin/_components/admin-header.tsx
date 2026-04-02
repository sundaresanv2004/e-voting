"use client"

import { usePathname } from "next/navigation"
import SetTheme from "@/components/shared/setTheme"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function AdminHeader() {
  const pathname = usePathname()

  // Simple Breadcrumb logic: /admin/organization/members -> Organization > Members
  const pathSegments = pathname.split('/').filter(Boolean)
  const isElectionContext = pathSegments.includes('election')
  const isOrganizationContext = pathSegments.includes('organization')

  let contextLabel = "Admin"
  if (isElectionContext) contextLabel = "Election"
  if (isOrganizationContext) contextLabel = "Organization"

  let pageLabel = "Dashboard"
  // Heuristic for dashboard vs subpage:
  // /admin/organization (2 segments) or /admin/election/id (3 segments) are dashboards.
  if (isOrganizationContext && pathSegments.length > 2) {
    const last = pathSegments[pathSegments.length - 1]
    pageLabel = last.charAt(0).toUpperCase() + last.slice(1)
  } else if (isElectionContext && pathSegments.length > 3) {
    const last = pathSegments[pathSegments.length - 1]
    pageLabel = last.charAt(0).toUpperCase() + last.slice(1)
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <span className="font-medium text-muted-foreground">{contextLabel}</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">{pageLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <SetTheme />
      </div>
    </header>
  )
}
