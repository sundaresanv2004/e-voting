"use client"

import * as React from "react"
import { toast } from "sonner"
import { isBefore, addHours, addMinutes } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon, Tick02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

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
import { Label } from "@/components/ui/label"
import { createElection, updateElection } from "../_actions"
import { DateTimePicker } from "./date-time-picker"

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
  initialData
}: ElectionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [name, setName] = React.useState(initialData?.name ?? "")
  const [startTime, setStartTime] = React.useState<Date>(initialData?.startTime ?? new Date())
  const [endTime, setEndTime] = React.useState<Date>(initialData?.endTime ?? addHours(new Date(), 24))

  // Sync state with initialData when it changes
  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setStartTime(new Date(initialData.startTime))
      setEndTime(new Date(initialData.endTime))
    }
  }, [initialData])

  // Automatic validation and correction
  React.useEffect(() => {
    if (isBefore(endTime, startTime)) {
      // If end time is before start time, set end time to start time + 1 hour
      setEndTime(addHours(startTime, 1))
    }
  }, [startTime, endTime])

  const validateDateTime = () => {
    if (isBefore(endTime, startTime)) return "End time must be after start time."
    if (isBefore(endTime, addMinutes(startTime, 1))) return "Election must last at least 1 minute."
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Check date/time validation
    const dateTimeError = validateDateTime()
    if (dateTimeError) {
      setError(dateTimeError)
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const result = initialData
        ? await updateElection(initialData.id, { name, startTime, endTime })
        : await createElection({ name, startTime, endTime })

      if (result.success) {
        toast.success(`Election ${initialData ? "updated" : "created"} successfully!`, {
          icon: <HugeiconsIcon icon={Tick02Icon} className="w-5 h-5 text-green-500" />
        })
        setOpen(false)
        if (!initialData) {
          setName("")
          setStartTime(new Date())
          setEndTime(addHours(new Date(), 24))
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
  const dateTimeError = validateDateTime()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Election" : "Create New Election"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of your election. Ensure the voting period is logically scheduled."
              : "Set up the name and timing for your new election."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Election Name</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Student Council 2026"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-6 rounded-2xl border p-5 bg-muted/5">
            <DateTimePicker
              id="start"
              label="Start"
              date={startTime}
              onChange={setStartTime}
            />
            <div className="h-px bg-border -mx-5" />
            <DateTimePicker
              id="end"
              label="End"
              date={endTime}
              onChange={setEndTime}
              minDate={startTime}
            />
          </div>

          {(error || dateTimeError) && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-in fade-in slide-in-from-top-1 duration-200">
              <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error || dateTimeError}</span>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !!dateTimeError}
              className="rounded-full px-8"
            >
              {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Election")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
