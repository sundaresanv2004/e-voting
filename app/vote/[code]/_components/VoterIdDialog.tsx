"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { FingerPrintIcon, Alert01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import type { UseFormReturn } from "react-hook-form"

interface VoterIdDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    form: UseFormReturn<{ uniqueId: string }>
    onSubmit: (values: { uniqueId: string }) => void
    isPending: boolean
    verificationError: string | null
}

export function VoterIdDialog({
    open,
    onOpenChange,
    form,
    onSubmit,
    isPending,
    verificationError,
}: VoterIdDialogProps) {
    const { register, handleSubmit, formState: { errors } } = form

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                className="sm:max-w-md"
            >
                <DialogHeader className="text-left">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <HugeiconsIcon icon={FingerPrintIcon} className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-lg font-bold">Voter Identification</DialogTitle>
                            <DialogDescription>
                                Enter the unique Voter ID provided by your election administrator.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="uniqueId" className="text-sm font-semibold">
                            Your Voter ID
                        </Label>
                        <Input
                            id="uniqueId"
                            {...register("uniqueId")}
                            placeholder="Enter ID exactly as assigned"
                            autoComplete="off"
                            autoFocus
                            disabled={isPending}
                        />
                        {errors.uniqueId && (
                            <p className="text-xs text-destructive font-medium">
                                {errors.uniqueId.message}
                            </p>
                        )}
                        {verificationError && (
                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 mt-2">
                                <HugeiconsIcon
                                    icon={Alert01Icon}
                                    className="w-4 h-4 text-destructive shrink-0 mt-0.5"
                                />
                                <p className="text-xs text-destructive font-medium leading-relaxed">
                                    {verificationError}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Spinner />
                                    Verifying...
                                </>
                            ) : (
                                "Verify Identity"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
