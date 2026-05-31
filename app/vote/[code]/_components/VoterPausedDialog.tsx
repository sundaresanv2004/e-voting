"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Logout01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

interface VoterPausedDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onRetry: () => void
    onExit: () => void
    isPending: boolean
}

export function VoterPausedDialog({
    open,
    onOpenChange,
    onRetry,
    onExit,
    isPending,
}: VoterPausedDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-md p-0 overflow-hidden"
            >
                <div className="p-6 space-y-5">
                    <DialogHeader className="text-left">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                <HugeiconsIcon icon={Alert02Icon} className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <DialogTitle className="text-lg font-bold">Election Paused</DialogTitle>
                                <DialogDescription>
                                    This election has been temporarily paused by the administrator. Voting is currently unavailable.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-1">
                        <p className="text-sm font-semibold text-foreground">What to do next?</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Please wait a few moments and retry. If the issue persists, exit and contact your election administrator.
                        </p>
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 px-4 pb-4 pt-2">
                    <Button
                        variant="outline"
                        onClick={onExit}
                        disabled={isPending}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                        Exit Session
                    </Button>
                    <Button
                        onClick={onRetry}
                        disabled={isPending}
                        className="bg-amber-500 hover:bg-amber-400 text-white"
                    >
                        {isPending ? (
                            <Spinner />
                        ) : (
                            <HugeiconsIcon icon={RefreshIcon} className="w-4 h-4" />
                        )}
                        Retry
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
