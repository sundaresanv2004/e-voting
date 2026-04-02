"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"

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
} from "@/components/ui/field"
import { createElection } from "../_actions"
import { DateTimePicker } from "./date-time-picker"

interface CreateElectionDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateElectionDialog({ 
  children, 
  open: controlledOpen, 
  onOpenChange: setControlledOpen 
}: CreateElectionDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  
  const [startTime, setStartTime] = React.useState<Date>(new Date())
  const [endTime, setEndTime] = React.useState<Date>(new Date(Date.now() + 86400000)) // Tomorrow

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string

    if (endTime <= startTime) {
      setError("End time must be after start time.")
      setIsPending(false)
      return
    }

    try {
      const result = await createElection({
        name,
        startTime,
        endTime,
      })

      if (result.success) {
        toast.success("Election created successfully!", {
            icon: <HugeiconsIcon icon={Tick02Icon} className="w-5 h-5 text-green-500" />
        })
        setOpen(false)
      } else {
        setError(result.error || "Failed to create election")
      }
    } catch (err: any) {
        setError("An unexpected error occurred.")
    } finally {
        setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Election</DialogTitle>
          <DialogDescription>
            Configure your voting period below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <Field>
            <FieldLabel htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Election Name</FieldLabel>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Student Council 2026"
              required
              disabled={isPending}
              className="h-12 bg-background/50 border-muted-foreground/20"
            />
          </Field>
          
          <div className="space-y-4 rounded-xl border border-muted-foreground/10 p-5 bg-muted/5">
            <DateTimePicker 
              id="start" 
              label="Start" 
              date={startTime} 
              onChange={setStartTime} 
            />
            <div className="h-px bg-muted-foreground/10" />
            <DateTimePicker 
              id="end" 
              label="End" 
              date={endTime} 
              onChange={setEndTime} 
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-sm font-medium text-destructive animate-in fade-in zoom-in-95 duration-200">
               <HugeiconsIcon icon={InformationCircleIcon} strokeWidth={2} className="w-4 h-4 shrink-0" />
               {error}
            </div>
          )}

          <DialogFooter className="pt-2 gap-3 flex-row justify-end">
            <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="h-11 px-6 rounded-full"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="h-11 px-8 rounded-full bg-primary font-semibold">
              {isPending ? "Creating..." : "Create Election"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
