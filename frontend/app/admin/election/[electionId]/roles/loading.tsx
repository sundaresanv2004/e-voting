import React from "react"
import { RoleHeroSkeleton } from "./_components/role-hero"
import { RolesListSkeleton } from "./_components/RolesList"

/**
 * Loading page for the Election Roles page.
 * Recreates the roles layout using modular skeleton components.
 */
export default function RolesLoading() {
  return (
    <div className="flex flex-col w-full min-h-full">
      <RoleHeroSkeleton />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <RolesListSkeleton />
      </div>
    </div>
  )
}
