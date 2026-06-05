"use client"

import { useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"

const POLL_INTERVAL_MS = 30_000 // 30 seconds

/**
 * DashboardPoller — invisible client component that refreshes the server-rendered
 * dashboard data every 30 seconds by calling router.refresh().
 * 
 * Uses visibilitychange listeners to pause polling when the tab is inactive
 * and resume/refresh immediately when the user returns.
 */
export function DashboardPoller() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const poll = () => {
      // Use startTransition so React knows this is a non-urgent update
      // and can keep the UI responsive during the data fetch.
      startTransition(() => {
        router.refresh()
      })
    }

    const startPolling = () => {
      if (intervalRef.current) return
      intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
    }

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Refresh immediately when tab becomes active
        poll()
        startPolling()
      } else {
        stopPolling()
      }
    }

    // Initial setup
    document.addEventListener("visibilitychange", handleVisibilityChange)
    startPolling()

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      stopPolling()
    }
  }, [router])

  // isPending is true while the refresh is happening. 
  // We don't render anything, keeping the poll silent.
  return null
}
