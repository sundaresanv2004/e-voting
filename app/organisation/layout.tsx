import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const freshUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      isActive: true,
      members: {
        take: 1,
        include: {
            organization: true
        }
      }
    },
  })

  if (!freshUser || !freshUser.isActive) {
    redirect("/auth/error?error=AccessDenied")
  }

  if (!freshUser.members || freshUser.members.length === 0) {
    redirect("/setup/organization")
  }

  const activeOrgId = freshUser.members[0].organizationId;

  const elections = await db.election.findMany({
    where: { organizationId: activeOrgId },
    orderBy: { createdAt: "desc" },
  })

  const formattedElections = elections.map((election) => ({
    id: election.id,
    name: election.name,
    status: election.status,
    code: election.code,
  }))

  // If the user is an owner/admin of the org, treat them as ORG_ADMIN for sidebar
  const userRole = freshUser.members[0].role === "owner" || freshUser.members[0].role === "admin" 
    ? "ORG_ADMIN" 
    : freshUser.role;

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
