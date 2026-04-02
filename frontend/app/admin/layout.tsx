import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { AdminHeader } from "@/app/admin/_components/admin-header"
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

  // Fetch real elections for this organization
  const elections = await db.election.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Format elections for the switcher (adding default logos/plans for now)
  const formattedElections = elections.map((election) => ({
    id: election.id,
    name: election.name,
    status: election.status,
    code: election.code,
  }))

  return (
    <SidebarProvider>
      <AppSidebar elections={formattedElections} />
      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
