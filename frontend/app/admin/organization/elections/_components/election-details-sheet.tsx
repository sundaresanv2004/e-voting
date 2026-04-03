"use client"

import * as React from "react"
import { format, formatDistanceStrict } from "date-fns"
import {
  PencilEdit01Icon,
  Delete02Icon,
  Calendar01Icon,
  UserIcon,
  FingerPrintIcon,
  Copy01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

export type Election = {
  id: string
  name: string
  code: string
  status: string
  startTime: Date
  endTime: Date
  organizationId: string
  createdAt: Date
  updatedAt: Date
  createdBy: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  updatedBy: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

interface ElectionDetailsSheetProps {
  election: Election
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case "UPCOMING":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case "COMPLETED":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500"
    case "UPCOMING":
      return "bg-blue-500"
    case "COMPLETED":
      return "bg-gray-400"
    default:
      return "bg-secondary"
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        className="h-3 w-3"
        color="currentColor"
      />
    </Button>
  )
}

export function ElectionDetailsSheet({
  election,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ElectionDetailsSheetProps) {
  const duration = formatDistanceStrict(
    new Date(election.startTime),
    new Date(election.endTime)
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] flex flex-col p-0">
        <SheetHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${getStatusDot(election.status)}`} />
            <Badge variant="outline" className={getStatusColor(election.status)}>
              {election.status}
            </Badge>
          </div>
          <SheetTitle className="font-semibold text-xl">{election.name}</SheetTitle>
          <SheetDescription>
            Detailed overview of this election campaign.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 py-4">
          {/* Election Code Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/80 p-6 shadow-sm">
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  Election Code
                </p>
                <code className="text-xl font-mono tracking-wider text-foreground">
                  {election.code}
                </code>
              </div>
              <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm p-1 rounded-xl border">
                <CopyButton text={election.code} />
              </div>
            </div>
            {/* Subtle background decoration */}
            <HugeiconsIcon
              icon={FingerPrintIcon}
              className="absolute -right-6 -bottom-6 h-32 w-32 opacity-[0.03] rotate-12"
              color="currentColor"
            />
          </div>

          {/* Schedule Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-medium">Timeline & Duration</h4>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ring-1 ring-border">
                {duration} Total
              </span>
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm ring-1 ring-blue-500/20">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" color="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Starts</p>
                  <p className="text-sm truncate leading-tight mt-0.5">
                    {format(new Date(election.startTime), "eeee, MMMM do, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="font-mono text-xs py-0.5">
                    {format(new Date(election.startTime), "h:mm a")}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 shadow-sm ring-1 ring-orange-500/20">
                  <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" color="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Ends</p>
                  <p className="text-sm truncate leading-tight mt-0.5">
                    {format(new Date(election.endTime), "eeee, MMMM do, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="font-mono text-xs py-0.5">
                    {format(new Date(election.endTime), "h:mm a")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Integrity Logs & Metadata */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium px-1">Integrity Logs & Metadata</h4>
            <div className="grid gap-3">
              {/* Creator Card */}
              <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 shadow-sm ring-1 ring-green-500/20">
                  <HugeiconsIcon icon={UserIcon} className="h-5 w-5" color="currentColor" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium truncate leading-tight mt-0.5">
                    {election.createdBy?.name || "Unknown User"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">{election.createdBy?.email}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                    Creator
                  </Badge>
                  <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                    {format(new Date(election.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>

              {/* Updater Card (if exists) */}
              {election.updatedBy && (
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 shadow-sm ring-1 ring-purple-500/20">
                    <HugeiconsIcon icon={UserIcon} className="h-5 w-5" color="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">Last Modified By</p>
                    <p className="text-sm font-medium truncate leading-tight mt-0.5">
                      {election.updatedBy?.name || "Unknown User"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{election.updatedBy?.email}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                      Modified
                    </Badge>
                    <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                      {format(new Date(election.updatedAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <SheetFooter className="mt-auto border-t py-4 px-6 gap-3 sm:flex-row flex-col bg-muted/5 lg:backdrop-blur-sm">
          <Button
            variant="destructive"
            className="w-1/2"
            onClick={() => {
              onOpenChange(false)
              setTimeout(onDelete, 300)
            }}
          >
            <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" color="currentColor" />
            Delete Election
          </Button>
          <Button
            variant="outline"
            className="w-1/2 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-700 transition-colors"
            onClick={() => {
              onOpenChange(false)
              setTimeout(onEdit, 300)
            }}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="mr-2 h-4 w-4" color="currentColor" />
            Edit Election
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

