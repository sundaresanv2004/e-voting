import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { requireOrgMember } from "@/lib/auth/access"
import { cookies } from "next/headers"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // All members may enter this layout. Individual pages enforce requireOrgAdmin where needed.
  const { member } = await requireOrgMember()

  const activeOrgId = member.organizationId

  const elections = await db.election.findMany({
    where: { organizationId: activeOrgId, deletedAt: null },
    include: { settings: { select: { lockResult: true } } },
    orderBy: { createdAt: "desc" },
  })

  const formattedElections = elections.map((election) => ({
    id: election.id,
    name: election.name,
    status: election.status,
    code: election.code,
    lockResult: election.settings?.lockResult ?? false,
  }))

  const cookieStore = await cookies()
  const defaultElectionId = cookieStore.get("last_election_id")?.value

  // org_admin / admin → show as ORG_ADMIN in sidebar; any other role stays as-is
  const userRole = member.role === "org_admin" || member.role === "admin" ? "ORG_ADMIN" : member.role.toUpperCase()

  return (
    <SidebarProvider>
      <AppSidebar elections={formattedElections} userRole={userRole} defaultElectionId={defaultElectionId} />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

