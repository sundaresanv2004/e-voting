import React from "react"
import { AuditHeroSkeleton } from "./_components/AuditHero"
import { AuditFiltersSkeleton } from "./_components/AuditFilters"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading page for the Organization Audit Log.
 * Recreates the audit layout using modular skeleton components.
 */
export default function AuditLoading() {
  return (
    <div className="flex flex-col w-full min-h-screen pb-16">
      {/* Hero Skeleton */}
      <AuditHeroSkeleton />

      <div className="flex-1 px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full space-y-5">
        <Card className="border-border/50 py-0">
          <CardContent className="p-4 md:p-5 space-y-4">
            <AuditFiltersSkeleton />

            <div className="flex items-center justify-end pt-2">
              <Skeleton className="h-3 w-48 rounded-full" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border bg-muted/10 p-3 space-y-2">
                <Skeleton className="h-2.5 w-20 ml-1 rounded-full" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-6 w-24 rounded-full" />)}
                </div>
              </div>
              <div className="rounded-2xl border bg-muted/10 p-3 space-y-2">
                <Skeleton className="h-2.5 w-20 ml-1 rounded-full" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-6 w-24 rounded-full" />)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-6 flex flex-col gap-4 md:flex-row md:items-start transition-all">
                  <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />

                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-48 rounded-lg" />
                      <Skeleton className="h-4 w-16 rounded-full" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <Skeleton className="h-3 w-32 rounded-full" />
                      <Skeleton className="h-3 w-48 rounded-full" />
                    </div>

                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-10 w-full max-w-3xl rounded-3xl" />
                      <Skeleton className="h-10 w-full max-w-3xl rounded-3xl" />
                    </div>
                  </div>

                  <div className="md:text-right shrink-0 space-y-1">
                    <Skeleton className="h-2 w-16 ml-auto rounded-full" />
                    <Skeleton className="h-3 w-24 ml-auto rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
