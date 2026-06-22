"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface BallotProgressProps {
    isReviewing: boolean
    activeRoleIndex: number
    totalRoles: number
}

export function BallotProgress({ isReviewing, activeRoleIndex, totalRoles }: BallotProgressProps) {
    return (
        <div className="fixed top-3.5 right-4 sm:right-6 z-40 flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-full px-2.5 py-1.5 border border-border/40">
            <span className="text-[11px] font-bold text-muted-foreground tabular-nums">
                {isReviewing ? "Review" : `${activeRoleIndex + 1} / ${totalRoles}`}
            </span>
            <div className="flex gap-1">
                {Array.from({ length: totalRoles }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-500",
                            i < activeRoleIndex || isReviewing
                                ? "w-4 bg-primary"
                                : i === activeRoleIndex && !isReviewing
                                    ? "w-6 bg-primary"
                                    : "w-2 bg-muted-foreground/20"
                        )}
                    />
                ))}
            </div>
        </div>
    )
}
