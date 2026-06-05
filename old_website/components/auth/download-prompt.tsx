"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ComputerIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export function DownloadPrompt() {
    const pathname = usePathname()

    if (pathname !== "/auth/vote") return null

    return (
        <Button
            asChild
            variant="outline"
        >
            <Link href="/download">
                <HugeiconsIcon icon={ComputerIcon} className="w-4 h-4" />
                <span className="hidden sm:inline">Download Offline App</span>
                <span className="sm:hidden">App</span>
            </Link>
        </Button>
    )
}
