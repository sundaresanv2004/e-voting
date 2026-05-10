import React from "react"
import { VoterHeroSkeleton } from "./_components/voter-hero"
import { VoterListSkeleton } from "./_components/VoterList"

/**
 * Loading page for the Election Voters page.
 * Recreates the voters layout using modular skeleton components.
 */
export default function VotersLoading() {
  return (
    <div className="flex flex-col w-full min-h-full">
      <VoterHeroSkeleton />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <VoterListSkeleton />
      </div>
    </div>
  )
}
