import { Skeleton } from "@/components/ui/skeleton"

export default function RolesLoading() {
  return (
    <div className="flex flex-col flex-1 w-full">
      {/* ElectionPageHeader skeleton */}
      <div className="relative border-b bg-background/50 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full mx-auto max-w-[1400px]">
          <div className="flex items-center gap-5">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        {/* Data Table */}
        <div className="rounded-2xl border bg-card overflow-hidden">
          {/* Toolbar */}
          <div className="border-b px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Skeleton className="h-9 w-56 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>

          {/* Table header */}
          <div className="border-b px-4 py-3 bg-muted/30">
            <div className="grid grid-cols-5 gap-4">
              {["Role / Position", "Order", "Candidates", "Vote Limit", "Actions"].map((col) => (
                <Skeleton key={col} className="h-4 w-full max-w-[100px]" />
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-5 gap-4 px-4 py-4 items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-8 rounded-full" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-12" />
                <div className="flex gap-2 justify-end">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <Skeleton className="h-4 w-44" />
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
