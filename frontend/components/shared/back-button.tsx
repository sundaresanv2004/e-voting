"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export function BackButton() {
    return (
        <Button variant="ghost" className="group" asChild>
            <Link href="/">
                <HugeiconsIcon icon={ArrowLeft01Icon}
                    size={20}
                    className="transition-transform group-hover:-translate-x-1"
                />
                Back to Home
            </Link>
        </Button>
    )
}
