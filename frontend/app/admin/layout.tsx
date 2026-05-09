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

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  // H1 FIX: Always do a fresh DB lookup — never trust the JWT for role/org status.
  // This prevents stale-session exploits where a revoked admin retains access until token expiry.
  const freshUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      organizationId: true,
      isActive: true,
      hasAllElectionsAccess: true,
      organization: {
        select: {
          isActive: true,
        },
      },
    },
  })

  if (!freshUser || !freshUser.isActive) {
    redirect("/auth/error?error=AccessDenied")
  }

  if (!freshUser.organizationId) {
    redirect("/setup/organization")
  }

  if (!freshUser.organization?.isActive) {
    redirect("/auth/error?error=AccessDenied")
  }

  let elections = []

  if (freshUser.role === "ORG_ADMIN") {
    elections = await db.election.findMany({
      where: { organizationId: freshUser.organizationId },
      orderBy: { createdAt: "desc" },
    })
  } else {
    if (freshUser.hasAllElectionsAccess) {
      elections = await db.election.findMany({
        where: { organizationId: freshUser.organizationId },
        orderBy: { createdAt: "desc" },
      })
    } else {
      const access = await db.userElectionAccess.findMany({
        where: { userId: freshUser.id },
        include: { election: true },
        orderBy: { createdAt: "desc" },
      })
      elections = access.map((a) => a.election)
    }
  }

  // Format elections for the switcher
  const formattedElections = elections.map((election) => ({
    id: election.id,
    name: election.name,
    status: election.status,
    code: election.code,
  }))

  return (
    <SidebarProvider>
      <AppSidebar elections={formattedElections} userRole={freshUser.role} />
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
