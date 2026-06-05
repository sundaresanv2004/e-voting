"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUp01Icon } from '@hugeicons/core-free-icons'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener("scroll", toggleVisibility)
        return () => window.removeEventListener("scroll", toggleVisibility)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    if (!isVisible) return null

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        size="icon"
                        className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        onClick={scrollToTop}
                        aria-label="Back to top"
                    >
                        <HugeiconsIcon icon={ArrowUp01Icon} className="w-5 h-5" strokeWidth={2} />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left" sideOffset={12} className="font-medium">
                    Back to top
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
