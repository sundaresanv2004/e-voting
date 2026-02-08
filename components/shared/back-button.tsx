"use client"

import Link from "next/link"
import {Button} from "@/components/ui/button"
import {ChevronLeft} from 'lucide-react'

export function BackButton() {
    return (
        <Button variant="ghost" className="group" asChild>
            <Link href="/">
                <ChevronLeft
                    size={20}
                    className="transition-transform group-hover:-translate-x-1"
                />
                Back to Home
            </Link>
        </Button>
    )
}
