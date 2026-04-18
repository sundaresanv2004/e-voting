"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import { Alert02Icon, Logout01Icon, RefreshIcon } from '@hugeicons/core-free-icons'

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
    isPending
}: VoterPausedDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md shadow-2xl [&>button]:hidden bg-card border-border p-0 overflow-hidden"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="p-6 space-y-6">
                    <DialogHeader className="space-y-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <HugeiconsIcon icon={Alert02Icon} className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold">Election Paused</DialogTitle>
                            <DialogDescription className="text-muted-foreground font-medium">
                                This election has been temporarily paused by the administrator for security reasons. Identification and voting are currently unavailable.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <div className="p-5 rounded-2xl bg-muted/30 border border-border flex items-center gap-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-semibold text-foreground">What to do next?</p>
                            <p className="text-xs text-muted-foreground">You can wait and retry in a few moments, or exit the session and return later.</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="bg-muted/30 px-4 pb-4 flex flex-col-reverse sm:flex-row gap-2.5">
                    <Button
                        variant="outline"
                        onClick={onExit}
                        className="w-full sm:flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isPending}
                    >
                        <HugeiconsIcon icon={Logout01Icon} className="mr-2 w-4 h-4" />
                        Exit Session
                    </Button>
                    <Button
                        onClick={onRetry}
                        disabled={isPending}
                        className="w-full sm:flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                    >
                        <HugeiconsIcon icon={RefreshIcon} className="mr-2 w-4 h-4" />
                        Retry
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
