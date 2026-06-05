"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Home01Icon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default function AdminNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-6 lg:p-12 min-h-[70vh]">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
        <div className="p-4 rounded-full bg-muted/50 border border-border/50 shadow-sm backdrop-blur-sm">
          <HugeiconsIcon icon={Search01Icon} className="w-12 h-12 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-[300px] mx-auto">
            The administrative page you&apos;re looking for doesn&apos;t exist or has been relocated.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Button size="lg" variant="outline" className="gap-2" onClick={() => window.history.back()}>
            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
            Go Back
          </Button>
          <Link href="/admin/organization">
            <Button size="lg" className="gap-2">
              <HugeiconsIcon icon={Home01Icon} className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
