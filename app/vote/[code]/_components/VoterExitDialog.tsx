"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, Logout01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
} from "@/components/ui/alert-dialog"

interface VoterExitDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
}

export function VoterExitDialog({ open, onOpenChange, onConfirm }: VoterExitDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-sm p-0 overflow-hidden">
                <div className="p-6 pb-0 space-y-5">
                    <AlertDialogHeader className="text-left">
                        <div className="flex items-start gap-4">
                            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                                <HugeiconsIcon icon={Alert01Icon} className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <AlertDialogTitle className="text-lg font-bold">
                                    Exit Voting Session?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    You are about to leave the voting portal. Any unsaved ballot progress will be lost.
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>
                </div>

                <AlertDialogFooter className="px-6 pb-6 pt-4">
                    <AlertDialogCancel asChild>
                        <Button variant="outline">Stay in Portal</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button variant="destructive" onClick={onConfirm}>
                            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                            Exit Session
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
