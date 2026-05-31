"use client"

import { useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"

const POLL_INTERVAL_MS = 30_000 // 30 seconds

interface ResultsPollerProps {
  enabled: boolean
}

/**
 * ResultsPoller — invisible client component that refreshes the server-rendered
 * results data every 30 seconds by calling router.refresh().
 *
 * Pauses polling when the tab is inactive and resumes + refreshes immediately
 * when the user returns. Only active when `enabled` is true.
 */
export function ResultsPoller({ enabled }: ResultsPollerProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const poll = () => {
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
        poll()
        startPolling()
      } else {
        stopPolling()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    startPolling()

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      stopPolling()
    }
  }, [enabled, router])

  return null
}
