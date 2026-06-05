import { Skeleton } from "@/components/ui/skeleton"

export default function ElectionsLoading() {
  return (
    <div className="flex-1 w-full">
      {/* PageHeader skeleton */}
      <div className="relative border-b bg-background/50 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full mx-auto">
          <div className="flex items-center gap-5">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          {/* Action button */}
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 space-y-8 max-w-[1400px] mx-auto w-full">
        {/* Toolbar: search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          {/* Table header */}
          <div className="border-b px-4 py-3 bg-muted/30">
            <div className="grid grid-cols-6 gap-4">
              {["Name", "Code", "Status", "Created By", "Dates", "Actions"].map((col) => (
                <Skeleton key={col} className="h-4 w-full max-w-[100px]" />
              ))}
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 px-4 py-4 items-center">
                {/* Name col */}
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                {/* Code */}
                <Skeleton className="h-5 w-16 rounded-full" />
                {/* Status badge */}
                <Skeleton className="h-5 w-20 rounded-full" />
                {/* Created by */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-24" />
                </div>
                {/* Dates */}
                <div className="space-y-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-28" />
                </div>
                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
