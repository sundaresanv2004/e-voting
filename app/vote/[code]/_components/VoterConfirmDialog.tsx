"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { UserIcon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { VoterData } from "./BallotInterface"

function formatDetailLabel(key: string) {
    return key
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getVisibleDetails(details: unknown): [string, string][] {
    if (!details || typeof details !== "object" || Array.isArray(details)) return []
    return Object.entries(details as Record<string, unknown>)
        .filter(([, val]) => val !== null && val !== undefined && val !== "")
        .map(([key, val]) => [formatDetailLabel(key), String(val)])
}

interface VoterConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    voterData: VoterData | null
    hasConfirmed: boolean
    onConfirmChange: (confirmed: boolean) => void
    onStartVoting: () => void
    onChangeId: () => void
}

export function VoterConfirmDialog({
    open,
    onOpenChange,
    voterData,
    hasConfirmed,
    onConfirmChange,
    onStartVoting,
    onChangeId,
}: VoterConfirmDialogProps) {
    const details = getVisibleDetails(voterData?.additionalDetails)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-md p-0 overflow-hidden"
            >
                <div className="p-6 pb-0 space-y-5">
                    <DialogHeader className="text-left">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                                <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-lg font-bold">Identity Confirmed</DialogTitle>
                                <DialogDescription>
                                    We found a matching voter record. Please verify your details before proceeding.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Voter Details Card */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-0">
                        <div className="flex items-center gap-4 pb-3">
                            <div className="h-14 w-14 rounded-full bg-card border-2 border-border flex items-center justify-center overflow-hidden relative shrink-0">
                                {voterData?.image ? (
                                    <Image src={voterData.image} alt="Voter" fill className="object-cover" />
                                ) : (
                                    <HugeiconsIcon icon={UserIcon} className="w-7 h-7 text-muted-foreground/40" />
                                )}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                    Authorized Voter
                                </p>
                                <p className="text-lg font-bold text-foreground leading-tight break-words">
                                    {voterData?.name}
                                </p>
                            </div>
                        </div>

                        {details.map(([label, value]) => (
                            <div key={label} className="border-t border-border/60 py-2.5">
                                <div className="flex items-center justify-between gap-4 text-sm">
                                    <span className="text-muted-foreground font-medium">{label}</span>
                                    <span className="font-mono font-semibold text-foreground text-right break-all">
                                        {value}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {voterData?.maxVotes && voterData.maxVotes > 1 && (
                            <div className="border-t border-border/60 pt-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">
                                            Ballot Status
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {voterData.ballotsCount} / {voterData.maxVotes} Votes Cast
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black uppercase">
                                        {voterData.maxVotes - (voterData.ballotsCount || 0)} Remaining
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirmation checkbox */}
                    <div
                        className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 group ${hasConfirmed
                                ? "bg-primary/10 border-primary/30"
                                : "bg-muted/30 border-border hover:bg-muted/50 hover:border-muted-foreground/20"
                            }`}
                        onClick={() => onConfirmChange(!hasConfirmed)}
                    >
                        <div className="pt-0.5">
                            <Checkbox
                                id="confirm"
                                checked={hasConfirmed}
                                onCheckedChange={(v) => onConfirmChange(!!v)}
                                className="h-5 w-5"
                            />
                        </div>
                        <p
                            className={`text-sm font-medium leading-snug cursor-pointer transition-colors ${hasConfirmed
                                    ? "text-primary"
                                    : "text-muted-foreground group-hover:text-foreground"
                                }`}
                        >
                            I confirm this is my correct identity and I am authorized to cast this ballot.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-4 pt-3">
                    <Button variant="outline" onClick={onChangeId}>
                        Change ID
                    </Button>
                    <Button
                        variant={"successOutline"}
                        disabled={!hasConfirmed}
                        onClick={onStartVoting}
                    >
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4" />
                        Start Voting
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
