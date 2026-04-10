"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, Home01Icon, RefreshIcon } from '@hugeicons/core-free-icons'
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect"
import SetTheme from "@/components/shared/setTheme"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-4 pt-20 md:p-8 relative overflow-hidden bg-gradient-to-b from-background via-background to-background dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 w-full">
      <div className="absolute top-4 right-4 z-50">
          <SetTheme/>
      </div>

      {/* Ripple Background */}
      <div
          className="absolute inset-0 opacity-80 dark:opacity-60 pointer-events-none"
          style={{
              maskImage:
                  "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
              WebkitMaskImage:
                  "radial-gradient(ellipse 120% 80% at 50% 30%, black 0%, black 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.1) 88%, transparent 100%)",
          }}
      >
          <div
              className="dark:block hidden absolute inset-0"
              style={{
                  maskImage:
                      "radial-gradient(ellipse 140% 100% at 50% 30%, black 0%, black 15%, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.12) 85%, rgba(0,0,0,0.04) 93%, transparent 100%)",
                  WebkitMaskImage:
                      "radial-gradient(ellipse 140% 100% at 50% 30%, black 0%, black 15%, rgba(0,0,0,0.95) 25%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.7) 45%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.25) 75%, rgba(0,0,0,0.12) 85%, rgba(0,0,0,0.04) 93%, transparent 100%)",
              }}
          >
              <BackgroundRippleEffect rows={12} cols={24} cellSize={60}/>
          </div>
          <div className="light:block dark:hidden shadow-[inset_0_-100px_100px_rgba(255,255,255,1)]">
              <BackgroundRippleEffect rows={12} cols={24} cellSize={60}/>
          </div>
      </div>

      <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-background via-transparent to-transparent opacity-50 dark:from-gray-950 dark:via-transparent dark:to-transparent dark:opacity-60"/>
      
      {/* Red-tinted background gradient for the error page */}
      <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-40 bg-linear-to-br from-destructive/20 via-transparent to-destructive/10"/>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center text-center space-y-6">
        <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-destructive/20 blur-md animate-pulse"></div>
            <div className="relative p-6 rounded-full bg-background border border-destructive/20 shadow-lg text-destructive">
                <HugeiconsIcon icon={Alert01Icon} className="w-16 h-16" />
            </div>
        </div>
        
        <div className="space-y-3">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1 text-sm font-medium rounded-full bg-destructive/10 text-destructive border border-destructive/20 mb-2">
                <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-destructive" />
                <span>Runtime Error</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Something went wrong</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-[320px] mx-auto leading-relaxed">
                An unexpected error occurred while processing your request. Our team has been notified.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <Button onClick={reset} size="lg" variant="default" className="w-full sm:w-auto hover:cursor-pointer gap-2">
                <HugeiconsIcon icon={RefreshIcon} className="w-4 h-4" />
                Try Again
            </Button>
            <Link href="/">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                    <HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
                    Return Home
                </Button>
            </Link>
        </div>
      </div>
    </div>
  )
}
