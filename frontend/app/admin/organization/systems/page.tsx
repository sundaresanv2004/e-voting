import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import SystemsHero from "./_components/SystemsHero"
import { SystemsList } from "./_components/SystemsList"
import { syncSystemExpirations } from "./_actions"

export default async function AuthorizedSystemsPage() {
  const session = await auth()
  const orgId = session?.user?.organizationId
  if (!orgId) redirect("/setup/organization")

  // Auto-expire systems that have passed their authorization window via Action (skip revalidate to avoid render error)
  await syncSystemExpirations(orgId, false)

  const organization = await db.organization.findUnique({
    where: { id: orgId },
    select: { code: true }
  })

  if (!organization) redirect("/setup/organization")

  const systems = await db.authorizedSystem.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    include: {
      approvedBy: {
        select: {
          name: true,
          email: true,
          image: true,
        }
      },
      updatedBy: {
        select: {
          name: true,
          email: true,
          image: true,
        }
      },
      electionAccess: {
        include: {
          election: {
            select: { name: true }
          }
        }
      },
      _count: {
        select: {
          auditLogs: true,
          ballots: true,
        }
      }
    }
  })

  return (
    <div className="flex flex-col w-full">
      <SystemsHero orgCode={organization.code} />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <SystemsList initialSystems={systems as any} />
      </div>
    </div>
  )
}
