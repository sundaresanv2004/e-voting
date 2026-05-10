import React from "react"
import { CandidateHeroSkeleton } from "./_components/candidate-hero"
import { CandidatesListSkeleton } from "./_components/CandidatesList"

/**
 * Loading page for the Election Candidates page.
 * Recreates the candidates layout using modular skeleton components.
 */
export default function CandidatesLoading() {
  return (
    <div className="flex flex-col w-full min-h-full">
      <CandidateHeroSkeleton />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <CandidatesListSkeleton />
      </div>
    </div>
  )
}
