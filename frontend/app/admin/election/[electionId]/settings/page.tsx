import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getElectionData } from "./_actions"
import ElectionSettingsHero from "./_components/ElectionSettingsHero"
import { ElectionSettingsContainer } from "./_components/ElectionSettingsContainer"

export default async function ElectionSettingsPage({
  params
}: {
  params: Promise<{ electionId: string }>
}) {
  const session = await auth()
  const electionId = (await params).electionId

  if (!session?.user?.organizationId) redirect("/auth/login")

  const election = await getElectionData(electionId)

  if (!election) {
    redirect("/admin/organization/elections")
  }

  return (
    <div className="flex flex-col w-full min-h-screen">
      <ElectionSettingsHero 
        title="Election Settings" 
        subtitle={election.name} 
      />

      <div className="flex-1 py-10 px-4 md:px-8 w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <ElectionSettingsContainer 
          election={{
            id: election.id,
            name: election.name,
            code: election.code,
            startTime: election.startTime,
            endTime: election.endTime,
            status: election.status,
            settings: election.settings ? {
              requireSystemAuth: election.settings.requireSystemAuth,
              allSystemsAllowed: election.settings.allSystemsAllowed,
              authorizeVoters: election.settings.authorizeVoters,
            } : null
          }} 
        />
      </div>
    </div>
  )
}
