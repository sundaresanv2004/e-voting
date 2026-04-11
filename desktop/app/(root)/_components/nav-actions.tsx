"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Layout01Icon } from "@hugeicons/core-free-icons"

export function RootNavActions() {
    const pathname = usePathname()

    if (pathname.includes("/user")) {
        return (
            <Link href="/admin/organization">
                <Button variant="default" size="sm">
                    <HugeiconsIcon icon={Layout01Icon} className="w-4 h-4" />
                    Dashboard
                </Button>
            </Link>
        )
    }

    return (
        <Link href="/user">
            <Button variant="default" size="sm">
                <HugeiconsIcon icon={UserIcon} className="w-4 h-4" />
                Profile
            </Button>
        </Link>
    )
}
