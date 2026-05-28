import { Suspense } from "react"
import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { Settings02Icon } from "@hugeicons/core-free-icons"

export default async function ElectionSettingsPage({
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
          title="Settings" 
          description="Configure election settings"
          icon={Settings02Icon} 
        />
      </Suspense>
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <p className="text-muted-foreground">Election settings coming soon&hellip;</p>
      </div>
    </div>
  )
}
