"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { Home01Icon } from '@hugeicons/core-free-icons'

export function HomeButton() {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            className="group gap-2"
            onClick={() => router.push("/")}
        >
            <HugeiconsIcon
                icon={Home01Icon}
                size={20}
                className="transition-transform group-hover:scale-110"
            />
            <span className="font-medium">Home</span>
        </Button>
    )
}
