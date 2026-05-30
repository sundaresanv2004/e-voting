"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Building03Icon,
  Calendar01Icon,
  FingerPrintIcon,
  Copy01Icon,
  Tick02Icon,
  EyeIcon,
  ArrowRight01Icon,
  Time02Icon,
  Alert01Icon,
  Activity01Icon
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field"
import { Badge } from "@/components/ui/badge"
import { DateTimePicker } from "@/components/shared/date-time-picker"

import { updateElection } from "@/lib/actions/election"
import { getCalculatedElectionStatus } from "@/lib/utils/election"
import { ElectionStatus } from "@prisma/client"
import { cn } from "@/lib/utils"

const IdentityFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
})

const ScheduleFormSchema = z.object({
  startTime: z.date(),
  endTime: z.date(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
})

type IdentityFormValues = z.infer<typeof IdentityFormSchema>
type ScheduleFormValues = z.infer<typeof ScheduleFormSchema>

interface ElectionGeneralFormProps {
  election: {
    id: string
    name: string
    code: string
    status: ElectionStatus
    startTime: Date
    endTime: Date
  }
  canManage: boolean
}

function StatusBadge({ status }: { status: ElectionStatus }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="successOutline" className="gap-1.5"><HugeiconsIcon icon={Activity01Icon} className="size-3" /> Active</Badge>
    case "UPCOMING":
      return <Badge variant="infoOutline" className="gap-1.5"><HugeiconsIcon icon={Time02Icon} className="size-3" /> Upcoming</Badge>
    case "COMPLETED":
      return <Badge variant="secondary" className="gap-1.5"><HugeiconsIcon icon={Tick02Icon} className="size-3" /> Completed</Badge>
    case "PAUSED":
      return <Badge variant="warningOutline" className="gap-1.5"><HugeiconsIcon icon={Alert01Icon} className="size-3" /> Paused</Badge>
    case "CANCELLED":
      return <Badge variant="destructiveOutline" className="gap-1.5"><HugeiconsIcon icon={Alert01Icon} className="size-3" /> Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function ElectionGeneralForm({ election, canManage }: ElectionGeneralFormProps) {
  const router = useRouter()
  
  const [isIdentityPending, setIsIdentityPending] = React.useState(false)
  const [isSchedulePending, setIsSchedulePending] = React.useState(false)

  const identityForm = useForm<IdentityFormValues>({
    resolver: zodResolver(IdentityFormSchema),
    defaultValues: { name: election.name },
  })

  const scheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(ScheduleFormSchema),
    defaultValues: {
      startTime: new Date(election.startTime),
      endTime: new Date(election.endTime),
    },
  })

  const watchStartTime = scheduleForm.watch("startTime")

  React.useEffect(() => {
    if (!identityForm.formState.isDirty) {
      identityForm.reset({ name: election.name })
    }
  }, [election.name, identityForm])

  React.useEffect(() => {
    if (!scheduleForm.formState.isDirty) {
      scheduleForm.reset({
        startTime: new Date(election.startTime),
        endTime: new Date(election.endTime),
      })
    }
  }, [election.startTime, election.endTime, scheduleForm])

  const onIdentitySubmit = async (data: IdentityFormValues) => {
    setIsIdentityPending(true)
    try {
      const res = await updateElection(election.id, {
        name: data.name,
        startTime: election.startTime,
        endTime: election.endTime,
      })
      if (!res.success) {
        toast.error(res.error)
      } else {
        toast.success("Election identity updated successfully")
        identityForm.reset(data)
        router.refresh()
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsIdentityPending(false)
    }
  }

  const onScheduleSubmit = async (data: ScheduleFormValues) => {
    setIsSchedulePending(true)
    try {
      const res = await updateElection(election.id, {
        name: election.name,
        startTime: data.startTime,
        endTime: data.endTime,
      })
      if (!res.success) {
        toast.error(res.error)
      } else {
        toast.success("Election schedule updated successfully")
        scheduleForm.reset(data)
        router.refresh()
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSchedulePending(false)
    }
  }

  // ── Code copy / Reveal ───────────────────────────────────────────────────
  const [copied, setCopied] = React.useState(false)
  const [revealed, setRevealed] = React.useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(election.code)
    setCopied(true)
    toast.success("Election code copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReveal = () => {
    setRevealed(true)
    setTimeout(() => setRevealed(false), 10000)
  }

  return (
    <div className="space-y-6">

      {/* ── Card 1: General Info ─────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <form onSubmit={identityForm.handleSubmit(onIdentitySubmit)}>
          <CardHeader className="border-b flex flex-row items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
              <HugeiconsIcon icon={Building03Icon} className="size-4" />
            </div>
            <div>
              <CardTitle>Election Identity</CardTitle>
              <CardDescription>
                Update your election's display name.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 pt-6">
            <Field className="max-w-md flex-1" data-invalid={!!identityForm.formState.errors.name}>
              <FieldLabel>Election Name</FieldLabel>
              <FieldContent>
                <Controller
                  control={identityForm.control}
                  name="name"
                  render={({ field }) => (
                    <Input
                      placeholder="Student Council Election 2024"
                      className="w-full"
                      disabled={!canManage || isIdentityPending}
                      {...field}
                    />
                  )}
                />
                {identityForm.formState.errors.name && (
                  <FieldError>{identityForm.formState.errors.name.message}</FieldError>
                )}
              </FieldContent>
            </Field>
          </CardContent>

          {canManage && (
            <CardFooter className="justify-end">
              <Button type="submit" disabled={isIdentityPending || !identityForm.formState.isDirty}>
                {isIdentityPending ? "Saving…" : "Save Changes"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>

      {/* ── Card 2: Schedule ──────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)}>
          <CardHeader className="border-b flex flex-row items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
              <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
            </div>
            <div>
              <CardTitle>Election Schedule</CardTitle>
              <CardDescription>
                Configure the exact dates and times when voting starts and ends. Status will automatically update.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col md:flex-row gap-6 pt-6">
            <Field className="flex-1 max-w-sm" data-invalid={!!scheduleForm.formState.errors.startTime}>
              <FieldContent>
                <Controller
                  control={scheduleForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <DateTimePicker
                      label="Start"
                      date={field.value}
                      onChange={(date) => {
                        field.onChange(date)
                        if (date && (!scheduleForm.getValues("endTime") || date >= scheduleForm.getValues("endTime"))) {
                          const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
                          scheduleForm.setValue("endTime", nextDay, { shouldDirty: true, shouldValidate: true })
                        }
                      }}
                      disabled={!canManage || isSchedulePending}
                    />
                  )}
                />
                {scheduleForm.formState.errors.startTime && (
                  <FieldError>{scheduleForm.formState.errors.startTime.message}</FieldError>
                )}
              </FieldContent>
            </Field>

            <Field className="flex-1 max-w-sm" data-invalid={!!scheduleForm.formState.errors.endTime}>
              <FieldContent>
                <Controller
                  control={scheduleForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <DateTimePicker
                      label="End"
                      date={field.value}
                      onChange={field.onChange}
                      minDate={watchStartTime}
                      disabled={!canManage || isSchedulePending}
                    />
                  )}
                />
                {scheduleForm.formState.errors.endTime && (
                  <FieldError>{scheduleForm.formState.errors.endTime.message}</FieldError>
                )}
              </FieldContent>
            </Field>
          </CardContent>

          {canManage && (
            <CardFooter className="justify-end">
              <Button type="submit" disabled={isSchedulePending || !scheduleForm.formState.isDirty}>
                {isSchedulePending ? "Saving…" : "Save Changes"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>

      {/* ── Status Lifecycle Card ────────────────────────────────────────── */}
      <Card>
        <CardHeader className="border-b flex flex-row items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Election Status</CardTitle>
            <CardDescription>
              The current status of your election, calculated automatically based on the schedule.
            </CardDescription>
          </div>
          <div className="shrink-0">
            <StatusBadge status={election.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-muted z-0 hidden sm:block" />

            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-4">

              <div className="flex flex-col items-center text-center gap-3 bg-card px-2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  election.status === 'UPCOMING' ? "border-blue-500 text-blue-500 bg-blue-500/10" :
                    (election.status === 'ACTIVE' || election.status === 'COMPLETED') ? "border-primary text-primary bg-primary/10" : "border-muted text-muted-foreground bg-muted/50"
                )}>
                  <HugeiconsIcon icon={Time02Icon} className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Upcoming</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px]">Before start time</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 bg-card px-2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  election.status === 'ACTIVE' ? "border-green-500 text-green-500 bg-green-500/10" :
                    election.status === 'COMPLETED' ? "border-primary text-primary bg-primary/10" : "border-muted text-muted-foreground bg-muted/50"
                )}>
                  <HugeiconsIcon icon={Activity01Icon} className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Active</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px]">Voting is open</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-center gap-3 bg-card px-2">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  election.status === 'COMPLETED' ? "border-amber-500 text-amber-500 bg-amber-500/10" : "border-muted text-muted-foreground bg-muted/50"
                )}>
                  <HugeiconsIcon icon={Tick02Icon} className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Completed</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-[120px]">After end time</p>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Card 3: Election Access Code ───────────────────────────── */}
      <Card className="border-primary/20 shadow-sm gap-0 p-0 overflow-hidden">
        <CardHeader className="border-b border-primary/10 flex flex-row items-start gap-3 bg-primary/5 p-6">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
            <HugeiconsIcon icon={FingerPrintIcon} className="size-4" />
          </div>
          <div className="flex-1 pr-12">
            <CardTitle className="text-primary">Election Access Code</CardTitle>
            <CardDescription className="max-w-2xl mt-1.5">
              This unique code identifies your election across the platform.
              Voters might need this code if they use the public voting portal instead of a direct link.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <code className="px-4 py-2 rounded-full bg-muted font-mono text-sm tracking-widest border text-foreground">
                {revealed ? election.code : "••••••••••••••••"}
              </code>
            </div>
            <div className="flex flex-row gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className={cn("size-4", copied && "text-green-500")} />
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                onClick={revealed ? () => setRevealed(false) : handleReveal}
                variant="outline"
                size="sm"
              >
                <HugeiconsIcon icon={EyeIcon} className="size-4" />
                {revealed ? "Hide" : "Reveal"}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t px-6 py-4 bg-muted/10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon icon={Alert01Icon} className="size-4 shrink-0 text-primary" />
            Each category in this election also has its own unique code.
          </div>
          <Button variant="link" size="sm" asChild className="p-0 h-auto gap-1">
            <Link href={`/organisation/election/${election.id}/categories`}>
              View Categories <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
