"use client"

import * as React from "react"
import { format, formatDistanceStrict } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  Tick02Icon,
  Calendar01Icon,
  Clock01Icon,
  FingerPrintIcon,
  Edit02Icon,
  Delete02Icon,
  Settings02Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import Link from "next/link"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { toggleElectionStatus, logElectionCodeCopy } from "@/lib/actions/election"
import { useRouter } from "next/navigation"

interface ElectionDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  election: any | null
  onEdit?: (election: any) => void
  onDelete?: (election: any) => void
  isAdmin?: boolean
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="successOutline">Active</Badge>
    case "UPCOMING":
      return <Badge variant="infoOutline">Upcoming</Badge>
    case "COMPLETED":
      return <Badge variant="secondary">Completed</Badge>
    case "PAUSED":
      return <Badge variant="warningOutline">Paused</Badge>
    case "CANCELLED":
      return <Badge variant="destructiveOutline">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-500",
    UPCOMING: "bg-blue-500",
    PAUSED: "bg-amber-500",
    COMPLETED: "bg-muted-foreground",
    CANCELLED: "bg-destructive",
  }
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${colors[status] ?? "bg-muted-foreground"}`} />
  )
}

function CopyButton({ text, electionId }: { text: string, electionId: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success("Election code copied!")
    logElectionCodeCopy(electionId).catch(() => { })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy} aria-label="Copy code">
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" />
    </Button>
  )
}

function UserCard({ label, user, date, roleLabel }: {
  label: string
  user: { name?: string | null; email?: string | null; image?: string | null } | null
  date: Date
  roleLabel: string
}) {
  const initials = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase()
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 overflow-hidden">
      <Avatar className="size-9 shrink-0 border">
        <AvatarImage src={user?.image || ""} alt={user?.name || "User Avatar"} />
        <AvatarFallback className="text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-medium truncate leading-tight mt-0.5" title={user?.name ?? user?.email ?? "Unknown"}>
          {user?.name ?? user?.email ?? "Unknown"}
        </p>
        {user?.email && user?.name && (
          <p className="text-[10px] text-muted-foreground truncate" title={user.email}>{user.email}</p>
        )}
      </div>
      <div className="text-right flex flex-col items-end gap-1 shrink-0">
        <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
          {roleLabel}
        </Badge>
        <p className="text-[10px] text-muted-foreground whitespace-nowrap">
          {format(new Date(date), "MMM d, h:mm a")}
        </p>
      </div>
    </div>
  )
}

export function ElectionDetailsSheet({
  open,
  onOpenChange,
  election,
  onEdit,
  onDelete,
  isAdmin = false,
}: ElectionDetailsSheetProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [localElection, setLocalElection] = React.useState(election)

  React.useEffect(() => {
    setLocalElection(election)
  }, [election])

  if (!localElection) return null

  const duration = (() => {
    try {
      return formatDistanceStrict(new Date(localElection.startTime), new Date(localElection.endTime))
    } catch {
      return null
    }
  })()

  const handleToggleStatus = async () => {
    setIsPending(true)
    try {
      const res = await toggleElectionStatus(localElection.id)
      if (res.success) {
        toast.success("Election status updated")
        setLocalElection((prev: any) =>
          prev ? { ...prev, status: prev.status === "ACTIVE" ? "PAUSED" : "ACTIVE" } : prev
        )
        router.refresh()
      } else {
        toast.error(res.error)
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const isActiveOrPaused = localElection.status === "ACTIVE" || localElection.status === "PAUSED"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:!max-w-md overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-4 pt-6 pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <StatusDot status={localElection.status} />
            <StatusBadge status={localElection.status} />
          </div>
          <SheetTitle className="font-heading text-xl leading-snug break-words">
            {localElection.name}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detailed information about this election.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

          {/* Election Code Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/60 to-muted/30 px-5 py-4">
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Election Code
                </p>
                <code className="text-lg font-mono tracking-wider text-foreground block truncate">
                  {localElection.code}
                </code>
              </div>
              <div className="shrink-0 bg-background/60 backdrop-blur-sm border rounded-xl p-0.5">
                <CopyButton text={localElection.code} electionId={localElection.id} />
              </div>
            </div>
            {/* Decorative watermark */}
            <HugeiconsIcon
              icon={FingerPrintIcon}
              className="absolute -right-5 -bottom-5 size-28 opacity-[0.04] rotate-12 pointer-events-none"
            />
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <h4 className="text-sm font-medium">Timeline</h4>
              {duration && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ring-1 ring-border">
                  {duration} total
                </span>
              )}
            </div>
            <div className="grid gap-2.5">
              <div className="flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
                  <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Starts</p>
                  <p className="text-sm font-medium truncate mt-0.5">
                    {format(new Date(localElection.startTime), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs shrink-0">
                  {format(new Date(localElection.startTime), "h:mm a")}
                </Badge>
              </div>
              <div className="flex items-center gap-3.5 rounded-xl border bg-card px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 ring-1 ring-orange-500/20">
                  <HugeiconsIcon icon={Clock01Icon} className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Ends</p>
                  <p className="text-sm font-medium truncate mt-0.5">
                    {format(new Date(localElection.endTime), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono text-xs shrink-0">
                  {format(new Date(localElection.endTime), "h:mm a")}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Audit Log</h4>
            <div className="grid gap-2.5">
              {localElection.createdBy && (
                <UserCard
                  label="Created by"
                  user={localElection.createdBy}
                  date={localElection.createdAt}
                  roleLabel="Creator"
                />
              )}
              {localElection.updatedBy && localElection.updatedAt && (
                <UserCard
                  label="Last modified by"
                  user={localElection.updatedBy}
                  date={localElection.updatedAt}
                  roleLabel="Editor"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <SheetFooter className="flex flex-col gap-2.5 border-t px-6 py-4 bg-muted/20">
          {/* Pause/Resume + Manage row */}
          <div className="flex gap-2">
            {isAdmin && isActiveOrPaused && (
              <Button
                variant={localElection.status === "ACTIVE" ? "warningOutline" : "successOutline"}
                className="flex-1"
                disabled={isPending}
                onClick={handleToggleStatus}
              >
                {isPending
                  ? <Spinner className="mr-2 size-4" />
                  : <HugeiconsIcon icon={localElection.status === "ACTIVE" ? PauseIcon : PlayIcon} className="size-4 mr-2" />
                }
                {isPending
                  ? (localElection.status === "ACTIVE" ? "Pausing..." : "Resuming...")
                  : (localElection.status === "ACTIVE" ? "Pause" : "Resume")
                }
              </Button>
            )}

            <Button asChild variant="infoOutline" className="flex-1" onClick={() => onOpenChange(false)}>
              <Link href={`/organisation/election/${localElection.id}`}>
                <HugeiconsIcon icon={Settings02Icon} className="size-4 mr-2" />
                Manage
              </Link>
            </Button>
          </div>

          {/* Edit + Delete row */}
          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="destructiveOutline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onDelete?.(localElection), 200)
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onEdit?.(localElection), 200)
                }}
              >
                <HugeiconsIcon icon={Edit02Icon} className="size-4" />
                Edit
              </Button>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
