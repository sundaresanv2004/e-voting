"use client"

import { HugeiconsIcon } from '@hugeicons/react'
import { UserIcon, Tick02Icon } from '@hugeicons/core-free-icons'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { Badge } from '@/components/ui/badge'
import type { VoterData } from "./BallotInterface"

const visibleDetailKeys = new Set([
    "studentId",
    "student_id",
    "rollNo",
    "roll_no",
    "admissionNo",
    "admission_no",
    "employeeId",
    "employee_id",
    "class",
    "grade",
    "section",
    "department",
    "designation",
])

function formatDetailLabel(key: string) {
    return key
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getVisibleDetails(details: unknown) {
    if (!details || typeof details !== "object" || Array.isArray(details)) {
        return []
    }

    return Object.entries(details as Record<string, unknown>)
        .filter(([key, value]) => visibleDetailKeys.has(key) && value !== null && value !== undefined && value !== "")
        .map(([key, value]) => [formatDetailLabel(key), String(value)] as const)
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
    onChangeId
}: VoterConfirmDialogProps) {
    const details = getVisibleDetails(voterData?.additionalDetails)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md shadow-2xl [&>button]:hidden bg-card border-border p-0 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="p-6 pb-0 space-y-6">
                    <DialogHeader className="space-y-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <HugeiconsIcon icon={UserIcon} className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold">Identity Confirmed</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium">
                                We found a matching record. Please verify these details before proceeding.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    {/* Voter Details Card */}
                    <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-0">
                        <div className="flex items-center gap-4 pb-4">
                            <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground overflow-hidden relative shadow-sm">
                                {voterData?.image ? (
                                    <Image src={voterData.image} alt="Voter" fill className="object-cover" />
                                ) : (
                                    <HugeiconsIcon icon={UserIcon} className="w-8 h-8 opacity-40" />
                                )}
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Authorized Voter</p>
                                <p className="text-xl font-bold text-foreground leading-tight break-words">{voterData?.name}</p>
                            </div>
                        </div>

                        {details.map(([key, value]) => (
                            <div key={key} className="border-t border-border/50 pt-3 pb-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">{key}</span>
                                    <span className="font-mono font-bold text-foreground text-right break-words">{String(value)}</span>
                                </div>
                            </div>
                        ))}

                        {/* Multiple Votes Info */}
                        {voterData?.maxVotes && voterData.maxVotes > 1 && (
                            <div className="border-t border-border/50 mt-3 pt-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">Ballot Status</span>
                                        <span className="text-sm font-semibold text-foreground">
                                            {voterData.ballotsCount || 0} / {voterData.maxVotes} Votes Cast
                                        </span>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-tighter">
                                        {voterData.maxVotes - (voterData.ballotsCount || 0)} Remaining
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none group ${hasConfirmed
                            ? "bg-primary/10 border-primary/30 shadow-sm"
                            : "bg-muted/30 border-border hover:bg-muted/50 hover:border-muted-foreground/20"
                            }`}
                        onClick={() => onConfirmChange(!hasConfirmed)}
                    >
                        <div className="pt-0.5">
                            <Checkbox
                                id="confirm"
                                checked={hasConfirmed}
                                onCheckedChange={(v) => onConfirmChange(!!v)}
                                className="h-5 w-5 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-transform group-active:scale-90"
                            />
                        </div>
                        <p
                            className={`text-sm font-semibold leading-relaxed cursor-pointer transition-colors ${hasConfirmed ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                }`}
                        >
                            I confirm that this is my correct name and identity, and I am authorized to cast this ballot.
                        </p>
                    </div>
                </div>

                <DialogFooter className="p-4 flex flex-col-reverse sm:flex-row gap-2.5">
                    <Button
                        variant="outline"
                        onClick={onChangeId}
                        className="w-full sm:flex-1"
                    >
                        Change ID
                    </Button>
                    <Button
                        disabled={!hasConfirmed}
                        onClick={onStartVoting}
                        className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500"
                    >
                        <HugeiconsIcon icon={Tick02Icon} className="w-5 h-5" />
                        Start Voting
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
