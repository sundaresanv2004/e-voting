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
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

interface VoterConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    voterData: {
        id: string;
        uniqueId: string;
        name: string;
        image?: string | null;
        additionalDetails?: any | null;
    } | null
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
    const details = (voterData?.additionalDetails as Record<string, any>) || {}

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
                                <p className="text-xl font-bold text-foreground leading-none">{voterData?.name}</p>
                            </div>
                        </div>
                        <div className="border-t border-border/50 pt-3 pb-1">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Unique ID</span>
                                <span className="font-mono font-bold text-primary">{voterData?.uniqueId}</span>
                            </div>
                        </div>
                        {Object.entries(details).map(([key, value]) => (
                            <div key={key} className="border-t border-border/50 pt-3 pb-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium capitalize">{key}</span>
                                    <span className="font-mono font-bold text-foreground">{String(value)}</span>
                                </div>
                            </div>
                        ))}
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
