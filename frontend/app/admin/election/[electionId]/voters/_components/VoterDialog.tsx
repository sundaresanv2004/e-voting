"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon, UserIcon, IdentificationIcon, Calendar02Icon } from "@hugeicons/core-free-icons"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { VoterSchema, type VoterFormValues } from "@/lib/schemas/voter"
import { createVoter, updateVoter } from "../_actions"

interface VoterDialogProps {
  children?: React.ReactNode
  electionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: VoterFormValues & { id: string }
}

export function VoterDialog({
  children,
  electionId,
  open,
  onOpenChange,
  initialData,
}: VoterDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<VoterFormValues>({
    resolver: zodResolver(VoterSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      uniqueId: initialData?.uniqueId ?? "",
      image: initialData?.image ?? null,
      additionalDetails: initialData?.additionalDetails ?? {},
    }
  })

  // Reset form when dialog opens/initialData changes
  React.useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name ?? "",
        uniqueId: initialData?.uniqueId ?? "",
        image: initialData?.image ?? null,
        additionalDetails: initialData?.additionalDetails ?? {},
      })
      setServerError(null)
    }
  }, [open, initialData, reset])

  const onSubmit = async (values: VoterFormValues) => {
    setIsPending(true)
    setServerError(null)

    try {
      const result = initialData
        ? await updateVoter(initialData.id, electionId, values)
        : await createVoter(electionId, values)

      if (result.success) {
        toast.success(`Voter ${initialData ? "updated" : "added"} successfully!`)
        onOpenChange(false)
      } else {
        const errorMsg = result.error || "Something went wrong"
        if (errorMsg.toLowerCase().includes("id")) {
          setError("uniqueId", { type: "manual", message: errorMsg })
        } else {
          setServerError(errorMsg)
        }
      }
    } catch {
      setServerError("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  const isEdit = !!initialData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col bg-card">
        <DialogHeader className="px-6 py-4 border-b bg-card relative gap-1">
          <DialogTitle className="font-semibold text-xl tracking-tight">
            {isEdit ? "Edit Voter" : "Add Voter"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground/80">
            {isEdit
              ? "Update the details for this voter."
              : "Register a new voter for this election."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <div className="relative">
                  <HugeiconsIcon icon={UserIcon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    disabled={isPending}
                    className="pl-10"
                    {...register("name")}
                  />
                </div>
                {errors.name && <FieldError errors={[{ message: errors.name.message as string }]} />}
              </Field>

              <Field>
                <FieldLabel htmlFor="uniqueId">Unique ID (e.g. Student ID)</FieldLabel>
                <div className="relative">
                  <HugeiconsIcon icon={IdentificationIcon} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="uniqueId"
                    placeholder="Enter unique ID"
                    disabled={isPending}
                    className="pl-10 font-mono text-sm"
                    {...register("uniqueId")}
                  />
                </div>
                <FieldDescription>This ID will be used for authentication at the terminal.</FieldDescription>
                {errors.uniqueId && <FieldError errors={[{ message: errors.uniqueId.message as string }]} />}
              </Field>

            </div>

            {serverError && (
              <FieldError className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
                <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-medium text-xs">{serverError}</span>
              </FieldError>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t flex flex-row items-center justify-end gap-3 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? "Saving..." : "Adding...") : (isEdit ? "Save Changes" : "Add Voter")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
