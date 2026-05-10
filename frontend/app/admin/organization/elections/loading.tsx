import React from "react"
import { ElectionHeroSkeleton } from "./_components/electionHero"
import { ElectionsListSkeleton } from "./_components/ElectionsList"

/**
 * Loading page for the Organization Elections page.
 * Recreates the elections layout using modular skeleton components.
 */
export default function ElectionsLoading() {
  return (
    <div className="flex flex-col w-full min-h-full">
      <ElectionHeroSkeleton />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <ElectionsListSkeleton />
      </div>
    </div>
  )
}
