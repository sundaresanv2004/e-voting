import { Skeleton } from "@/components/ui/skeleton"

/**
 * Shared skeleton for election sub-pages that feature:
 * - ElectionPageHeader (election name, status badge, action buttons)
 * - A data table with toolbar (search + filters)
 */
function ElectionSubPageHeaderSkeleton({ showActions = true }: { showActions?: boolean }) {
  return (
    <div className="relative border-b bg-background/50 backdrop-blur-sm">
      <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full mx-auto max-w-[1400px]">
        <div className="flex items-center gap-5">
          <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        {showActions && (
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        )}
      </div>
    </div>
  )
}

function DataTableSkeleton({ columns }: { columns: string[] }) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="border-b px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Skeleton className="h-9 w-56 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Table header */}
      <div className="border-b px-4 py-3 bg-muted/30">
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((col) => (
            <Skeleton key={col} className="h-4 w-full max-w-[100px]" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid gap-4 px-4 py-4 items-center"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            {/* First column is always a name+subtitle combo */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            {/* Remaining columns */}
            {columns.slice(1).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full max-w-[100px]" />
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="border-t px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-4 w-44" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

export { ElectionSubPageHeaderSkeleton, DataTableSkeleton }
