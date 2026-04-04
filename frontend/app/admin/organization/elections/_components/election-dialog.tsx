"use client"

import * as React from "react"
import { toast } from "sonner"
import { isBefore, addHours } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"

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
import { createElection, updateElection } from "../_actions"
import { DateTimePicker } from "./date-time-picker"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ElectionSchema } from "@/lib/schemas/election"
import { z } from "zod"

interface ElectionDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialData?: {
    id: string
    name: string
    startTime: Date
    endTime: Date
  }
}

export function ElectionDialog({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  initialData,
}: ElectionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  type ElectionFormValues = z.infer<typeof ElectionSchema>

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ElectionFormValues>({
    resolver: zodResolver(ElectionSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      startTime: initialData?.startTime ?? new Date(),
      endTime: initialData?.endTime ?? addHours(new Date(), 24),
    }
  })

  // Watch startTime to potentially update endTime
  const watchedStartTime = watch("startTime")
  const watchedEndTime = watch("endTime")

  // Sync state with initialData when it changes
  React.useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        startTime: new Date(initialData.startTime),
        endTime: new Date(initialData.endTime),
      })
    }
  }, [initialData, reset])

  // Automatic correction
  React.useEffect(() => {
    if (watchedStartTime && watchedEndTime && isBefore(watchedEndTime, watchedStartTime)) {
      setValue("endTime", addHours(watchedStartTime, 1))
    }
  }, [watchedStartTime, watchedEndTime, setValue])

  const onSubmit = async (values: z.infer<typeof ElectionSchema>) => {
    setIsPending(true)
    setError(null)

    try {
      const result = initialData
        ? await updateElection(initialData.id, values)
        : await createElection(values)

      if (result.success) {
        toast.success(`Election ${initialData ? "updated" : "created"} successfully!`)
        setOpen(false)
        if (!initialData) {
          reset({
            name: "",
            startTime: new Date(),
            endTime: addHours(new Date(), 24),
          })
        }
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  const isEdit = !!initialData

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-card relative gap-1 overflow-hidden">
          <DialogTitle className="font-semibold text-xl tracking-tight">
            {isEdit ? "Edit Election" : "Create New Election"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground/80">
            {isEdit
              ? "Update the details of your election campaign."
              : "Set up the name and timing for your new election."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden bg-card">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="space-y-5">
              <Field>
                <FieldLabel htmlFor="name">Election Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., Student Council 2026"
                  disabled={isPending}
                  {...register("name")}
                />
                <FieldError errors={[{ message: errors.name?.message }]} />
              </Field>

              <Field>
                <FieldLabel>
                  Scheduling Period
                </FieldLabel>
                <div className="space-y-4 p-5 rounded-2xl border">
                  <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        id="start"
                        label="Start"
                        date={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <div className="h-px bg-border -mx-5 opacity-40" />
                  <Controller
                    name="endTime"
                    control={control}
                    render={({ field }) => (
                      <DateTimePicker
                        id="end"
                        label="End"
                        date={field.value}
                        onChange={field.onChange}
                        minDate={watchedStartTime}
                      />
                    )}
                  />
                </div>
                <FieldError errors={[{ message: errors.endTime?.message }]} />
              </Field>
            </div>

            {error && (
              <FieldError className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
                <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-medium">{error}</span>
              </FieldError>
            )}
          </div>

          <DialogFooter className="px-6 py-3 border-t flex flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Election")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
