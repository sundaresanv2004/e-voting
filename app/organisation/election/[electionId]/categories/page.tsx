import { Suspense } from "react"
import { ElectionPageHeader } from "@/components/shared/election-page-header"
import { GridIcon } from "@hugeicons/core-free-icons"

export default async function CategoriesPage({
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
          title="Categories" 
          description="Manage election categories"
          icon={GridIcon} 
        />
      </Suspense>
      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <p className="text-muted-foreground">Categories page coming soon&hellip;</p>
      </div>
    </div>
  )
}
