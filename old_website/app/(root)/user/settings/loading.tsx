import React from "react"
import { UserHeroSkeleton } from "./_components/user-hero"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex flex-col flex-1 w-full max-w-[1400px] mx-auto pt-24 pb-8 px-4 md:px-8 relative">
      <UserHeroSkeleton />

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 mt-4">
        {/* Navigation Sidebar Skeleton */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-none">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl border border-transparent"
              >
                <div className="p-2 rounded-xl bg-muted/50">
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            ))}
          </nav>
        </aside>

        {/* Content Area Skeleton */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col space-y-8">
            <Card className="border-border/40 shadow-sm overflow-hidden p-0 w-full rounded-2xl bg-background/50">
              <CardHeader className="border-b border-border/40 bg-muted/20 py-5">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-muted/50">
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-3 w-64 rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-8 pb-8 space-y-10 w-full">
                {/* Profile Picture Skeleton */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-muted/5 p-6 rounded-2xl border border-border/40">
                  <Skeleton className="h-28 w-28 rounded-full" />
                  <div className="space-y-3 flex-1 w-full pt-2">
                    <Skeleton className="h-4 w-32 rounded mx-auto sm:mx-0" />
                    <Skeleton className="h-3 w-56 rounded mx-auto sm:mx-0" />
                    <div className="flex gap-3 pt-2 justify-center sm:justify-start">
                      <Skeleton className="h-9 w-32 rounded-full" />
                      <Skeleton className="h-9 w-24 rounded-full" />
                    </div>
                  </div>
                </div>

                {/* Input Fields Skeleton */}
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-11 w-full rounded-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
