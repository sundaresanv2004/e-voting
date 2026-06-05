"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

interface AutoRefreshProps {
  intervalMs: number
}

export function AutoRefresh({ intervalMs }: AutoRefreshProps) {
  const router = useRouter()

  React.useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [intervalMs, router])

  return null
}
