"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout01Icon } from "@hugeicons/core-free-icons"

interface BallotHeaderProps {
    electionName: string
    isSubmitting: boolean
    onCancel: () => void
}

export function BallotHeader({ electionName, isSubmitting, onCancel }: BallotHeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50">
            <div className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 sm:px-6">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isSubmitting}
                    onClick={onCancel}
                >
                    <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                    Cancel
                </Button>
                <div className="text-center min-w-0">
                    <h2 className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                        {electionName}
                    </h2>
                </div>
                <div className="w-16 sm:w-20" />
            </div>
        </header>
    )
}
