"use client"

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge01Icon, PencilEdit01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { BallotRole } from "./types"

interface BallotReviewProps {
    roles: BallotRole[]
    votes: Record<string, string>
    settings: {
        showCandidateProfiles: boolean
    }
    onEditRole: (index: number) => void
}

export function BallotReview({ roles, votes, settings, onEditRole }: BallotReviewProps) {
    return (
        <div className="w-full max-w-2xl animate-in zoom-in-95 fade-in duration-300">
            <div className="text-center mb-10 space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 mb-1">
                    <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-7 h-7" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-foreground">
                    Review Your Ballot
                </h3>
                <p className="text-sm text-muted-foreground max-w-none mx-auto leading-relaxed">
                    Confirm your selections before casting. This action cannot be undone.
                </p>
            </div>

            <div className="space-y-3">
                {roles.map((role, roleIndex) => {
                    const selectedCandidateId = votes[role.id]
                    const candidate = role.candidates.find((c) => c.id === selectedCandidateId)

                    return (
                        <div
                            key={role.id}
                            className="group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm hover:border-border hover:shadow-lg hover:shadow-black/5 transition-all duration-300"
                            style={{ animationDelay: `${roleIndex * 60}ms` }}
                        >
                            {/* Left accent */}
                            <div
                                className={cn(
                                    "absolute left-0 top-3 bottom-3 w-1 rounded-full",
                                    candidate ? "bg-primary/60" : "bg-destructive/60"
                                )}
                            />

                            {/* Candidate photo / placeholder */}
                            {candidate && !candidate.isNota && (
                                <div className="relative w-11 h-14 rounded-xl bg-muted overflow-hidden shrink-0 border-2 border-border/50">
                                    {settings.showCandidateProfiles && candidate.profileImage ? (
                                        <Image
                                            src={candidate.profileImage}
                                            alt={candidate.name}
                                            fill
                                            className="object-cover"
                                            sizes="44px"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full bg-primary/5">
                                            <span className="text-sm font-black text-primary/40">
                                                {candidate.name?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {candidate?.isNota && (
                                <div className="w-11 h-14 rounded-xl bg-muted/50 border-2 border-dashed border-border/50 flex items-center justify-center shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/40">
                                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            )}
                            {!candidate && (
                                <div className="w-11 h-14 rounded-xl bg-destructive/5 border-2 border-dashed border-destructive/20 flex items-center justify-center shrink-0">
                                    <span className="text-destructive/50 font-bold">?</span>
                                </div>
                            )}

                            {/* Role & candidate name */}
                            <div className="flex-1 min-w-0 space-y-0.5">
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/70 break-words">
                                    {role.name}
                                </p>
                                {candidate ? (
                                    <p className="text-base font-bold text-foreground break-words">
                                        {candidate.name}
                                    </p>
                                ) : (
                                    <p className="text-base font-bold text-destructive">No Selection</p>
                                )}
                            </div>

                            {/* Edit button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs font-bold text-muted-foreground hover:text-primary shrink-0 rounded-xl opacity-60 group-hover:opacity-100 transition-opacity"
                                onClick={() => onEditRole(roleIndex)}
                            >
                                <HugeiconsIcon icon={PencilEdit01Icon} className="w-3.5 h-3.5" />
                                Edit
                            </Button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
