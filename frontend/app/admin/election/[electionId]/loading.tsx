import React from "react"
import { DashboardHeaderSkeleton } from "./_components/DashboardHeader"
import { MetricCardsSkeleton } from "./_components/MetricCards"
import { ManagementCoreSkeleton } from "./_components/ManagementCore"
import { TurnoutVelocitySkeleton } from "../../organization/_components/TurnoutVelocity"
import { ActivityTimelineSkeleton } from "../../organization/_components/ActivityTimeline"
import { RolesSnapshotSkeleton } from "./_components/RolesSnapshot"
import { VotersSnapshotSkeleton } from "./_components/VotersSnapshot"
import { AccessControlCardSkeleton } from "./_components/AccessControlCard"
import { ConfigurationCardSkeleton } from "./_components/ConfigurationCard"

/**
 * Loading page for the Election Dashboard.
 * Recreates the dashboard layout using modular skeleton components.
 */
export default function ElectionDashboardLoading() {
  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      <DashboardHeaderSkeleton />

      <div className="flex-1 px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        <MetricCardsSkeleton />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Management Core */}
          <div className="lg:col-span-2 space-y-6">
            <TurnoutVelocitySkeleton />
            <ManagementCoreSkeleton />
            <ActivityTimelineSkeleton />
          </div>

          {/* Sidebar: Access & Information */}
          <div className="space-y-6">
            <RolesSnapshotSkeleton />
            <VotersSnapshotSkeleton />
            <AccessControlCardSkeleton />
            <ConfigurationCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}
