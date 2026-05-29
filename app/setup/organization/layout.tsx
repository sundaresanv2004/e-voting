import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function SetupOrganizationLayout({
  children,
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
      members: { take: 1 }
    }
  })

  // Redirect to organisation if they already have an org
  if (freshUser?.members && freshUser.members.length > 0) {
    redirect("/organisation")
  }

  return <>{children}</>
}
