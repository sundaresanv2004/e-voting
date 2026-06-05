import React from "react"
import { ElectionSettingsHeroSkeleton } from "./_components/ElectionSettingsHero"
import { ElectionSettingsContainerSkeleton } from "./_components/ElectionSettingsContainer"

/**
 * Loading page for the Election Settings page.
 * Recreates the settings layout using modular skeleton components.
 */
export default function ElectionSettingsLoading() {
  return (
    <div className="flex flex-col w-full min-h-full">
      <ElectionSettingsHeroSkeleton />

      <div className="flex-1 py-6 px-4 md:px-8 w-full">
        <ElectionSettingsContainerSkeleton />
      </div>
    </div>
  )
}
