"use client"

import { HugeiconsIcon } from '@hugeicons/react'
import { Alert01Icon, Logout01Icon } from '@hugeicons/core-free-icons'
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

export function VoterExitDialog({
    open,
    onOpenChange,
    onConfirm
}: VoterExitDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent
                size='sm'
                className="shadow-2xl bg-card border-border p-0 overflow-hidden"
            >
                <div className="p-6 pb-0 space-y-6">
                    <AlertDialogHeader className="space-y-4">
                        <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                            <HugeiconsIcon icon={Alert01Icon} className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <AlertDialogTitle className="text-xl font-bold">Exit Election Session?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground font-medium">
                                You are about to leave the voting portal. Any unsaved progress on your ballot will be lost.
                            </AlertDialogDescription>
                        </div>
                    </AlertDialogHeader>
                </div>

                <AlertDialogFooter className="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-2.5">
                    <AlertDialogCancel asChild>
                        <Button
                            variant="outline"
                            className="w-full sm:flex-1 mt-0"
                        >
                            Stay in Portal
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="destructive"
                            onClick={onConfirm}
                            className="w-full sm:flex-1 gap-2"
                        >
                            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
                            Exit Session
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
