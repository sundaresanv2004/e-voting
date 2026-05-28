import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function ElectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) redirect("/auth/login")

  return (
    <div className="flex flex-col w-full flex-1">
      <main className="flex-1 w-full flex flex-col">
        {children}
      </main>
    </div>
  )
}
