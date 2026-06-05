"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, Home01Icon, ArrowLeft01Icon } from '@hugeicons/core-free-icons'

export default function OrganisationError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Organisation boundary error:", error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-6 lg:p-12 min-h-[70vh]">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
        <div className="p-4 rounded-full bg-destructive/10 border border-destructive/20 shadow-sm backdrop-blur-sm text-destructive">
          <HugeiconsIcon icon={Alert01Icon} className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Oops!</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
          <p className="text-muted-foreground text-sm max-w-[320px] mx-auto">
            An unexpected error occurred while processing your request within the organisation dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button onClick={reset} size="lg" variant="default">
            Try again
          </Button>
          <Link href="/organisation/elections">
            <Button size="lg" variant="outline" className="gap-2">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
              Go Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
