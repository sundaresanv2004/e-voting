import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import SystemsHero from "./_components/SystemsHero"
import { SystemsList } from "./_components/SystemsList"
import { SystemStatus } from "@prisma/client"

export default async function AuthorizedSystemsPage() {
  const session = await auth()
  if (!session?.user?.organizationId) redirect("/setup/organization")

  // Auto-expire systems that have passed their 30-day authorization window
  await db.authorizedSystem.updateMany({
    where: {
      organizationId: session.user.organizationId,
      status: SystemStatus.APPROVED,
      tokenExpiresAt: { lte: new Date() },
    },
    data: {
      status: SystemStatus.EXPIRED,
      secretToken: null,
      tokenExpiresAt: null,
    },
  })

  const organization = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { code: true }
  })

  if (!organization) redirect("/setup/organization")

  const systems = await db.authorizedSystem.findMany({
    where: { organizationId: session.user.organizationId },
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
          logs: true,
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
