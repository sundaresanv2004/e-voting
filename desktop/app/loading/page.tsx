"use client"

import { LoadingScreen } from "@/components/shared/loading-screen"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export default function LoadingDemoPage() {
    return (
        <div className="relative w-full h-full">
            <div className="absolute top-4 left-4 z-50">
                <Button variant="ghost" asChild>
                    <Link href="/auth/login" className="flex items-center gap-2">
                        <HugeiconsIcon icon={ArrowLeft02Icon} className="size-4" />
                        Back to Login
                    </Link>
                </Button>
            </div>
            <LoadingScreen 
                title="Premium Loading UI" 
                description="This is how users see the app while it's preparing content." 
            />
        </div>
    )
}
