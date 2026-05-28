import { Suspense } from "react"
import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { Shield02Icon } from "@hugeicons/core-free-icons"

export default async function RolesPage({
  params,
}: {
  params: Promise<{ electionId: string }>
}) {
  const { electionId } = await params
  
  return (
    <div className="flex flex-col flex-1 w-full">
      <Suspense fallback={<div className="h-40 border-b bg-background/50 animate-pulse" />}>
        <ElectionPageHeader 
          electionId={electionId} 
          title="Roles" 
          description="Manage election access roles"
          icon={Shield02Icon} 
        />
      </Suspense>
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <p className="text-muted-foreground">Roles page coming soon&hellip;</p>
      </div>
    </div>
  )
}
