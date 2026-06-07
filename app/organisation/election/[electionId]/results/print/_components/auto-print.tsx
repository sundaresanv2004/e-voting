"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PrinterIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function AutoPrint() {
  React.useEffect(() => {
    // A slight delay to ensure all images and fonts are fully loaded
    const timer = setTimeout(() => {
      window.print()
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-8 right-8 z-50 print:hidden">
      <Button 
        onClick={() => window.print()}
        size="lg"
        className="rounded-full shadow-2xl gap-2 font-semibold"
      >
        <HugeiconsIcon icon={PrinterIcon} className="w-5 h-5" />
        Print Results
      </Button>
    </div>
  )
}
