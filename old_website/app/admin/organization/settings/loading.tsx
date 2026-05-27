import React from "react"
import { SettingsHeroSkeleton } from "./_components/SettingsHero"
import { SettingsContainerSkeleton } from "./_components/SettingsContainer"

/**
 * Loading page for the Organization Settings page.
 * Recreates the settings layout using modular skeleton components.
 */
export default function SettingsLoading() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <SettingsHeroSkeleton />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <SettingsContainerSkeleton />
      </div>
    </div>
  )
}
