"use client"

import { HugeiconsIcon } from '@hugeicons/react'
import { FingerPrintIcon, Alert01Icon } from '@hugeicons/core-free-icons'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { UseFormReturn } from "react-hook-form"

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
    verificationError
}: VoterIdDialogProps) {
    const { register, handleSubmit, formState: { errors } } = form

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-md shadow-2xl [&>button]:hidden bg-card"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader className="space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <HugeiconsIcon icon={FingerPrintIcon} className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-2xl font-bold">Voter Identification</DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium">
                            Enter your Unique ID (Student ID, Employee Code, or assigned code) to authenticate. This ID is provided by your election administrator.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="uniqueId" className="text-sm font-semibold">Voter Unique ID</Label>
                        <Input
                            id="uniqueId"
                            {...register("uniqueId")}
                            placeholder="Enter ID exactly as assigned"
                            autoComplete="off"
                            autoFocus
                        />
                        {errors.uniqueId && (
                            <p className="text-xs text-rose-500 font-medium mt-1 leading-relaxed">
                                {errors.uniqueId.message}
                            </p>
                        )}
                        {verificationError && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3 mt-2">
                                <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-500 leading-normal font-medium">
                                    {verificationError}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full sm:flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full sm:flex-1"
                        >
                            {isPending ? <Spinner className="w-5 h-5" /> : "Verify Identity"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
