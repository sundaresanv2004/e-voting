"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export function BackButton() {
    const router = useRouter()

    return (
        <Button variant="ghost" className="group" onClick={() => router.back()}>
            <HugeiconsIcon icon={ArrowLeft01Icon}
                className="transition-transform group-hover:-translate-x-1 w-5 h-5"
            />
            Back
        </Button>
    )
}
