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
        select: { id: true, name: true }
      },
      _count: {
        select: { candidates: true }
      },
      candidates: {
        select: { id: true, name: true, profileImage: true }
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
    <div className="flex flex-col w-full">
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

      <div className="flex-1 py-10 px-4 md:px-8 w-full">
        {roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl border-2 border-dashed border-muted-foreground/20 p-12 text-center bg-muted/5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/5 mb-6 ring-1 ring-primary/10 shadow-inner">
              <HugeiconsIcon icon={ShieldKeyIcon} strokeWidth={1.5} className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2 tracking-tight">Set up Election Roles</h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
              Create the positions that candidates will contest for. You can restrict certain roles to specific voting systems.
            </p>
            {canManage ? (
              <CreateRoleTrigger
                electionId={electionId}
                availableSystems={systems}
                nextSuggestedOrder={nextOrder}
                variant="default"
                size="lg"
              />
            ) : (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest bg-muted px-4 py-2 rounded-xl border">
                Read-only mode for Viewers
              </p>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Manage the contested positions for this election campaign.</p>
              </div>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                {roles.length} Roles Active
              </Badge>
            </div>
            <RolesList
              roles={roles}
              electionId={electionId}
              availableSystems={systems}
              userRole={userRole}
            />
          </div>
        )}
      </div>
    </div>
  )
}
