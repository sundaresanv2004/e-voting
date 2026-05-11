import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { VoterSessionPortal } from "./_components/VoterSessionPortal"

export default async function VotePage({
  params
}: {
  params: Promise<{ code: string }>
}) {
  const code = (await params).code
  
  const election = await db.election.findUnique({
    where: { code: code.toUpperCase() },
    select: {
      id: true,
      name: true,
      status: true,
      organization: {
        select: {
          name: true,
          logo: true
        }
      },
      settings: {
        select: {
          allowOnlineVoting: true
        }
      }
    }
  })

  if (!election || !election.settings?.allowOnlineVoting || election.status !== "ACTIVE") {
      return notFound()
  }

  return (
    <VoterSessionPortal election={election} />
  )
}
