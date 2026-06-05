"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field"
import { DateTimePicker } from "@/components/shared/date-time-picker"

import { ElectionSchema, type ElectionFormValues } from "@/lib/schemas/election"
import { createElection, updateElection } from "@/lib/actions/election"

interface ElectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  election?: {
    id: string
    name: string
    startTime: Date
    endTime: Date
  } | null
}

export function ElectionDialog({ open, onOpenChange, election }: ElectionDialogProps) {
  const router = useRouter()
  const isEditing = !!election
  const [isPending, setIsPending] = React.useState(false)
  const [limitError, setLimitError] = React.useState<{ show: boolean, message: string }>({ show: false, message: "" })

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ElectionFormValues>({
    resolver: zodResolver(ElectionSchema),
    defaultValues: {
      name: "",
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 24)),
    },
  })

  const startTime = watch("startTime")

  React.useEffect(() => {
    if (open) {
      if (election) {
        reset({
          name: election.name,
          startTime: new Date(election.startTime),
          endTime: new Date(election.endTime),
        })
      } else {
        reset({
          name: "",
          startTime: new Date(),
          endTime: new Date(new Date().setHours(new Date().getHours() + 24)),
        })
      }
    }
  }, [open, election, reset])

  const onSubmit = async (data: ElectionFormValues) => {
    setIsPending(true)
    try {
      if (isEditing && election) {
        const res = await updateElection(election.id, data)
        if (!res.success) {
          toast.error(res.error)
          return
        }
        toast.success("Election updated successfully")
      } else {
        const res = await createElection(data)
        if (!res.success) {
          if (res.error === "LIMIT_REACHED") {
            setLimitError({ show: true, message: res.message || "Limit reached" })
            onOpenChange(false)
          } else {
            toast.error(res.error)
          }
          return
        }
        toast.success("Election created successfully")
      }
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-heading">{isEditing ? "Edit Election" : "Create Election"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this election."
              : "Set up a new election for your organization."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <Field data-invalid={!!errors.name}>
            <FieldLabel>Election Name</FieldLabel>
            <FieldContent>
              <Input
                placeholder="e.g. Student Council 2026"
                {...register("name")}
              />
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.startTime}>
            <FieldContent>
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => (
                  <DateTimePicker
                    label="Start"
                    date={field.value}
                    onChange={(date) => {
                      field.onChange(date)
                      if (date) {
                        const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
                        setValue("endTime", nextDay)
                      }
                    }}
                  />
                )}
              />
              {errors.startTime && <FieldError>{errors.startTime.message}</FieldError>}
            </FieldContent>
          </Field>

          <Field data-invalid={!!errors.endTime}>
            <FieldContent>
              <Controller
                control={control}
                name="endTime"
                render={({ field }) => (
                  <DateTimePicker
                    label="End"
                    date={field.value}
                    onChange={field.onChange}
                    minDate={startTime}
                  />
                )}
              />
              {errors.endTime && <FieldError>{errors.endTime.message}</FieldError>}
            </FieldContent>
          </Field>

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
              {isPending && <Spinner />}
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Election"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <AlertDialog open={limitError.show} onOpenChange={(open) => setLimitError(prev => ({ ...prev, show: open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Election Limit Reached</AlertDialogTitle>
            <AlertDialogDescription>
              {limitError.message} For further details and to manage your organization's limits, please visit the Settings page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push("/organisation/settings")}>
              Go to Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
