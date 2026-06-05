import { Skeleton } from "@/components/ui/skeleton"

export default function ResultsLoading() {
  return (
    <div className="flex flex-col flex-1 w-full">
      {/* ElectionPageHeader skeleton */}
      <div className="relative border-b bg-background/50 backdrop-blur-sm">
        <div className="relative z-10 flex flex-col space-y-4 py-8 px-4 sm:px-6 lg:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 md:px-8 w-full mx-auto max-w-[1400px]">
          <div className="flex items-center gap-5">
            <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-52" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full space-y-6">
        {/* State banner */}
        <Skeleton className="h-12 w-full rounded-xl" />

        {/* Summary metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-7 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Main results grid — role results cards */}
        <div className="space-y-6">
          {/* Section heading */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Role cards with candidates */}
          {Array.from({ length: 2 }).map((_, ri) => (
            <div key={ri} className="rounded-2xl border bg-card p-6 space-y-5">
              {/* Role name + total votes */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              {/* Candidate rows */}
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, ci) => (
                  <div key={ci} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row — timeline chart + integrity card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
            <Skeleton className="h-9 w-full rounded-lg mt-4" />
          </div>
        </div>
      </div>
    </div>
  )
}
