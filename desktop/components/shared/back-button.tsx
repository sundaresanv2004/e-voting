"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { useTerminal } from "./terminal-context";

export function BackButton() {
    const router = useRouter()
    const pathname = usePathname()

    const { terminal } = useTerminal()

    const handleBack = () => {
        // If we are on an auth or verify page
        if (pathname.startsWith('/auth') || pathname.startsWith('/verify')) {
            // For APPROVED systems (like on /auth/vote), back should take to dashboard
            if (terminal.systemStatus === "APPROVED") {
                router.push('/dashboard')
            } else {
                router.push('/')
            }
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
