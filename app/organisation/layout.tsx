import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireOrgAdmin } from "@/lib/auth/access"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only org_admin / admin may enter this layout.
  // staff and viewer are redirected to /organisation/election.
  const { member } = await requireOrgAdmin("/organisation/election")

  const activeOrgId = member.organizationId

  const elections = await db.election.findMany({
    where: { organizationId: activeOrgId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  })

  const formattedElections = elections.map((election) => ({
    id: election.id,
    name: election.name,
    status: election.status,
    code: election.code,
  }))

  // org_admin / admin → show as ORG_ADMIN in sidebar; any other role stays as-is
  const userRole = "ORG_ADMIN"

  return (
    <SidebarProvider>
      <AppSidebar elections={formattedElections} userRole={userRole} />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

