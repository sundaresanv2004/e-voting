import React from "react"
import { AuditHeroSkeleton } from "./_components/AuditHero"
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

      <div className="flex-1 px-4 md:px-8 py-8 max-w-[1400px] mx-auto w-full">
        <Card className="border-border/50 overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="p-6 flex flex-col gap-4 md:flex-row md:items-start">
                  {/* Icon Section Skeleton */}
                  <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />

                  {/* Content Section Skeleton */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-20 rounded-full" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-4 rounded-full hidden sm:block" />
                      <Skeleton className="h-3 w-48" />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-20" />
                    </div>
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
