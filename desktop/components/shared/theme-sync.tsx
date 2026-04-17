"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function ThemeSync() {
  const { theme } = useTheme()

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const electron = (window as any).electron
    if (electron?.setTheme && theme) {
      // theme can be 'light', 'dark', or 'system'
      electron.setTheme(theme)
    }
  }, [theme])

  return null
}
