import React from "react"
import { SystemsHeroSkeleton } from "./_components/SystemsHero"
import { SystemsListSkeleton } from "./_components/SystemsList"

/**
 * Loading page for the Authorized Systems page.
 * Recreates the systems layout using modular skeleton components.
 */
export default function SystemsLoading() {
  return (
    <div className="flex flex-col w-full">
      <SystemsHeroSkeleton />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <SystemsListSkeleton />
      </div>
    </div>
  )
}
