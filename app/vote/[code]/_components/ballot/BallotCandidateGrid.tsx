"use client"

import React from "react"
import Image from "next/image"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, Image01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { BallotRole } from "./types"

interface BallotCandidateGridProps {
    currentRole: BallotRole
    currentVote: string | undefined
    settings: {
        showCandidateProfiles: boolean
        showCandidateSymbols: boolean
    }
    onVoteChange: (roleId: string, candidateId: string) => void
}

export function BallotCandidateGrid({
    currentRole,
    currentVote,
    settings,
    onVoteChange,
}: BallotCandidateGridProps) {
    const candidates = currentRole.candidates

    return (
        <div
            className="w-full max-w-7xl animate-in fade-in slide-in-from-right-4 duration-300"
            key={currentRole.id}
        >
            {/* Role title */}
            <div className="text-center mb-10 space-y-1.5">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-primary/70">
                    Select your candidate
                </p>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground break-words">
                    {currentRole.name}
                </h3>
            </div>

            {/* Candidate grid */}
            <RadioGroup
                value={currentVote ?? ""}
                onValueChange={(val) => onVoteChange(currentRole.id, val)}
                className="flex flex-wrap justify-center gap-4 sm:gap-6 mx-auto max-w-7xl"
            >
                {candidates.map((candidate) => {
                    const isSelected = currentVote === candidate.id

                    return (
                        <div key={candidate.id} className="relative group w-[calc(50%-8px)] sm:w-[200px] lg:w-[220px] shrink-0">
                            <RadioGroupItem
                                value={candidate.id}
                                id={`candidate-${candidate.id}`}
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor={`candidate-${candidate.id}`}
                                className={cn(
                                    "relative flex flex-col gap-2.5 rounded-2xl border-2 p-3 cursor-pointer transition-all duration-300 overflow-hidden",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                        : "border-border/50 bg-muted/50 hover:border-primary/30 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5"
                                )}
                            >
                                {/* Profile / NOTA area — full width, overlays on top */}
                                <div className="relative w-full">
                                    {!candidate.isNota ? (
                                        <>
                                            {settings.showCandidateProfiles ? (
                                                <div
                                                    className={cn(
                                                        "relative w-full aspect-[3/4] rounded-xl border-2 bg-muted overflow-hidden transition-all",
                                                        isSelected
                                                            ? "border-primary/40 shadow-md shadow-primary/10"
                                                            : "border-border/50"
                                                    )}
                                                >
                                                    {candidate.profileImage ? (
                                                        <Image
                                                            src={candidate.profileImage}
                                                            alt={candidate.name}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 640px) 45vw, 200px"
                                                        />
                                                    ) : (
                                                        <HugeiconsIcon
                                                            icon={UserIcon}
                                                            className="absolute inset-0 m-auto w-10 h-10 text-muted-foreground/30"
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    className={cn(
                                                        "w-full aspect-[3/4] rounded-xl border-2 bg-primary/5 flex items-center justify-center",
                                                        isSelected ? "border-primary/30" : "border-border/50"
                                                    )}
                                                >
                                                    <span className="text-4xl font-black text-primary/50">
                                                        {candidate.name?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Symbol — overlaid at bottom-right of the profile */}
                                            {settings.showCandidateSymbols && (
                                                <div className="absolute bottom-2 right-2">
                                                    {candidate.symbolImage ? (
                                                        <div className="relative w-16 h-16 rounded-lg border border-background bg-background overflow-hidden shadow-md">
                                                            <Image
                                                                src={candidate.symbolImage}
                                                                alt="Symbol"
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 rounded-lg border border-background bg-muted/80 shadow-md flex items-center justify-center">
                                                            <HugeiconsIcon
                                                                icon={Image01Icon}
                                                                className="w-6 h-6 text-muted-foreground/30"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        /* NOTA */
                                        <div
                                            className={cn(
                                                "w-full aspect-[3/4] rounded-xl border-2 border-dashed bg-muted/50 flex items-center justify-center transition-all",
                                                isSelected ? "border-primary/40 bg-primary/5" : "border-border/60"
                                            )}
                                        >
                                            <svg
                                                width="36"
                                                height="36"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                className={cn(
                                                    "transition-colors",
                                                    isSelected ? "text-primary" : "text-muted-foreground/40"
                                                )}
                                            >
                                                <path
                                                    d="M18 6L6 18M6 6l12 12"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Checkmark — overlaid at top-right of the profile */}
                                    <div
                                        className={cn(
                                            "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                                            isSelected
                                                ? "bg-primary border-primary text-primary-foreground scale-100"
                                                : "border-background bg-background/70 backdrop-blur-sm scale-90 opacity-60 group-hover:opacity-100 group-hover:scale-100"
                                        )}
                                    >
                                        {isSelected && (
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                                className="animate-in zoom-in-50 duration-150"
                                            >
                                                <path
                                                    d="M2.5 6L5 8.5L9.5 3.5"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Candidate name — always below the profile */}
                                <div className="text-center pb-0.5 w-full overflow-hidden">
                                    <p
                                        className={cn(
                                            "text-sm font-bold leading-snug break-words hyphens-auto overflow-wrap-anywhere transition-colors w-full",
                                            isSelected ? "text-foreground" : "text-foreground/80"
                                        )}
                                    >
                                        {candidate.isNota ? "NOTA" : candidate.name}
                                    </p>
                                    {candidate.isNota && (
                                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                                            None of the Above
                                        </p>
                                    )}
                                </div>
                            </Label>
                        </div>
                    )
                })}
            </RadioGroup>
        </div>
    )
}
