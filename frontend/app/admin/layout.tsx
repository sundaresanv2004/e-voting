import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { AdminHeader } from "@/app/admin/_components/admin-header"
import { AdminErrorBoundary } from "@/app/admin/_components/admin-error-boundary"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect("/setup/organization")
  }

  let elections = []
  
  if (session.user.role === "ORG_ADMIN") {
    elections = await db.election.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
  } else {
    const userRecord = await db.user.findUnique({
      where: { id: session.user.id },
      select: { hasAllElectionsAccess: true },
    })

    if (userRecord?.hasAllElectionsAccess) {
      elections = await db.election.findMany({
        where: { organizationId: session.user.organizationId },
        orderBy: { createdAt: "desc" },
      })
    } else {
      const access = await db.userElectionAccess.findMany({
        where: { userId: session.user.id },
        include: { election: true },
        orderBy: { createdAt: "desc" },
      })
      elections = access.map((a) => a.election)
    }
  }

  // Format elections for the switcher (adding default logos/plans for now)
  const formattedElections = elections.map((election) => ({
    id: election.id,
    name: election.name,
    status: election.status,
    code: election.code,
  }))

  return (
    <SidebarProvider>
      <AppSidebar elections={formattedElections} userRole={session.user.role} />
      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col">
          <AdminErrorBoundary>
            {children}
          </AdminErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
