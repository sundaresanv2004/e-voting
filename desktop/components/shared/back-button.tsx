"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export function BackButton() {
    const router = useRouter()
    const pathname = usePathname()

    const handleBack = () => {
        // If we are on an auth or verify page, "Back" should always take us Home
        if (pathname.startsWith('/auth') || pathname.startsWith('/verify')) {
            router.push('/')
        } else {
            router.back()
        }
    }

    return (
        <Button 
            variant="ghost" 
            className="group" 
            onClick={handleBack}
        >
            <HugeiconsIcon icon={ArrowLeft01Icon}
                size={20}
                className="transition-transform group-hover:-translate-x-1"
            />
            Back
        </Button>
    )
}
