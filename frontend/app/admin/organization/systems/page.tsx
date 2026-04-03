import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import SystemsHero from "./_components/SystemsHero"
import { SystemsList } from "./_components/SystemsList"

export default async function AuthorizedSystemsPage() {
  const session = await auth()
  if (!session?.user?.organizationId) redirect("/setup/organization")

  const organization = await db.organization.findUnique({
    where: { id: session.user.organizationId },
    select: { code: true }
  })

  if (!organization) redirect("/setup/organization")

  const systems = await db.authorizedSystem.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/5">
      <SystemsHero orgCode={organization.code} />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <SystemsList initialSystems={systems as any} />
      </div>
    </div>
  )
}
