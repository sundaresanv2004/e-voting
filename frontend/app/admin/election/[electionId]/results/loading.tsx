import React from "react"
import { ResultsHeroSkeleton } from "./_components/ResultsHero"
import { ResultsDashboardSkeleton } from "./_components/ResultsDashboard"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading page for the Election Results page.
 * Recreates the results layout using modular skeleton components.
 */
export default function ResultsLoading() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <ResultsHeroSkeleton />

      <div className="flex-1 py-8 px-4 md:px-8 w-full">
        {/* Banner Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
        
        <ResultsDashboardSkeleton />
      </div>
    </div>
  )
}
