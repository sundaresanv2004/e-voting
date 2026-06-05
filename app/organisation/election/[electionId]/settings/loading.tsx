import { Skeleton } from "@/components/ui/skeleton"

export default function ElectionSettingsLoading() {
  return (
    <div className="flex flex-col flex-1 w-full">
      {/* ElectionPageHeader skeleton */}
      <div className="relative border-b bg-background/50 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full mx-auto max-w-[1400px]">
          <div className="flex items-center gap-5">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        {/* Tabs: General | Preferences */}
        <div className="flex gap-2 mb-8">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* General settings form */}
        <div className="space-y-6">
          {/* Identity card */}
          <div className="rounded-2xl border bg-card p-6 space-y-6">
            <div className="space-y-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
            {/* Time range pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>

          {/* Preferences / Toggles card */}
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-60" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full shrink-0" />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-2xl border border-destructive/30 bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-9 w-32 rounded-lg shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
