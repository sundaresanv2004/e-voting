import { Skeleton } from "@/components/ui/skeleton"

export default function AuditLogsLoading() {
  return (
    <div className="flex-1 w-full min-h-screen bg-background rounded-2xl">
      {/* PageHeader skeleton */}
      <div className="relative border-b bg-background/50 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full mx-auto">
          <div className="flex items-center gap-5">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 space-y-6 max-w-[1400px] mx-auto w-full">
        {/* AuditMetrics: 4 stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Success", "Failure", "Warning", "Info"].map((label) => (
            <div key={label} className="rounded-2xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>

        {/* AuditFilters: search + dropdowns + date range */}
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-56 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>

        {/* AuditLogList */}
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-4">
              <div className="flex items-start gap-4">
                {/* Status icon */}
                <Skeleton className="h-9 w-9 rounded-lg shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full max-w-md" />
                  <div className="flex items-center gap-4 flex-wrap">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20 shrink-0" />
              </div>
            </div>
          ))}
        </div>

        {/* AuditPagination */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-lg" />
            ))}
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
