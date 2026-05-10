import React from "react"
import { MembersHeroSkeleton } from "./_components/MembersHero"
import { MembersListSkeleton } from "./_components/MembersList"

/**
 * Loading page for the Organization Members page.
 * Recreates the members layout using modular skeleton components.
 */
export default function MembersLoading() {
  return (
    <div className="flex flex-col w-full">
      <MembersHeroSkeleton />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <div className="grid grid-cols-1 gap-8">
          <MembersListSkeleton />
        </div>
      </div>
    </div>
  )
}
