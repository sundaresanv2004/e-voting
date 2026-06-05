import React from "react"
import { DashboardHeaderSkeleton } from "./_components/DashboardHeader"
import { MetricCardsSkeleton } from "./_components/MetricCards"
import { ElectionsOverviewSkeleton } from "./_components/ElectionsOverview"
import { HardwareHealthSkeleton } from "./_components/HardwareHealth"
import { TeamSnapshotSkeleton } from "./_components/TeamSnapshot"
import { QuickNavigateSkeleton } from "./_components/QuickNavigate"
import { ActivityTimelineSkeleton } from "./_components/ActivityTimeline"
import { OrgCodeCardSkeleton } from "./_components/OrgCodeCard"

/**
 * Loading page for the Organization Dashboard.
 * Recreates the dashboard layout using modular skeleton components.
 */
export default function OrganizationDashboardLoading() {
  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      {/* Header Skeleton */}
      <DashboardHeaderSkeleton />

      {/* Main Content Skeleton */}
      <div className="flex-1 px-4 md:px-8 py-4 space-y-4 max-w-[1400px] mx-auto w-full">
        {/* Metric Cards Skeleton */}
        <MetricCardsSkeleton />

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column — 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <ElectionsOverviewSkeleton />
            <QuickNavigateSkeleton />
            <ActivityTimelineSkeleton />
          </div>

          {/* Right Column — 1/3 */}
          <div className="space-y-4">
            <HardwareHealthSkeleton />
            <TeamSnapshotSkeleton />
            <OrgCodeCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
