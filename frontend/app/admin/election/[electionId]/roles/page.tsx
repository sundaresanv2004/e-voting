import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShieldKeyIcon } from "@hugeicons/core-free-icons"
import { UserRole } from "@prisma/client"

import RoleHero from "./_components/role-hero"
import { CreateRoleTrigger } from "./_components/create-role-trigger"
import { RolesList } from "./_components/RolesList"
import { Badge } from "@/components/ui/badge"

export default async function RolesPage({
  params
}: {
  params: Promise<{ electionId: string }>
}) {
  const session = await auth()
  const electionId = (await params).electionId

  if (!session?.user?.organizationId) redirect("/auth/login")

  const userRole = session?.user?.role as UserRole
  const canManage = userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF

  // Verify election exists and belongs to the organization
  const election = await db.election.findFirst({
    where: {
      id: electionId,
      organizationId: session.user.organizationId
    },
    select: { name: true }
  })

  if (!election) redirect("/admin/organization/elections")

  const roles = await db.electionRole.findMany({
    where: {
      electionId
    },
    orderBy: {
      order: "asc"
    },
    include: {
      allowedSystems: {
        select: { id: true, name: true, hostName: true }
      },
      _count: {
        select: { candidates: true }
      },
      candidates: {
        select: { id: true, name: true, profileImage: true }
      },
      createdBy: {
        select: { id: true, name: true, email: true, image: true }
      },
      updatedBy: {
        select: { id: true, name: true, email: true, image: true }
      }
    }
  })

  const systems = await db.authorizedSystem.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: "APPROVED"
    },
    select: {
      id: true,
      name: true,
      hostName: true
    }
  })

  const nextOrder = roles.length > 0 ? Math.max(...roles.map(r => r.order)) + 1 : 1

  return (
    <div className="flex flex-col w-full min-h-full">
      <RoleHero title="Election Roles" subtitle={election.name}>
        {canManage && (
          <CreateRoleTrigger
            electionId={electionId}
            availableSystems={systems}
            nextSuggestedOrder={nextOrder}
            listenToParams
          />
        )}
      </RoleHero>

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        {roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-lg border border-dashed p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <HugeiconsIcon icon={ShieldKeyIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Set up Election Roles</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Create the positions that candidates will contest for.
            </p>
            {canManage ? (
              <CreateRoleTrigger
                electionId={electionId}
                availableSystems={systems}
                nextSuggestedOrder={nextOrder}
              />
            ) : (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-muted px-4 py-2 rounded-xl border">
                Read-only mode for Viewers
              </p>
            )}
          </div>
        ) : (
          <RolesList
            roles={roles as any[]}
            electionId={electionId}
            availableSystems={systems}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  )
}
