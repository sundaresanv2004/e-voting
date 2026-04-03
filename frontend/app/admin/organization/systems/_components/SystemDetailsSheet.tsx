"use client"

import * as React from "react"
import { format, formatDistanceToNow } from "date-fns"
import {
  LaptopIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Alert01Icon,
  Calendar01Icon,
  Clock01Icon,
  FingerPrintIcon,
  ComputerIcon,

  GlobeIcon,
  UserIcon,
  Tick02Icon,
  Copy01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { SystemStatus } from "@prisma/client"
import { toast } from "sonner"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { updateSystemStatusAction } from "../_actions"

interface System {
  id: string
  name: string | null
  hostName: string | null
  ipAddress: string | null
  macAddress: string | null
  status: SystemStatus
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date | null
  approvedBy?: {
    name: string | null
    email: string
  } | null
}

interface SystemDetailsSheetProps {
  system: System | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getStatusBadgeStyle(status: SystemStatus) {
  switch (status) {
    case SystemStatus.APPROVED:
      return "bg-emerald-50/50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-none"
    case SystemStatus.PENDING:
      return "bg-amber-50/50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-none"
    case SystemStatus.REJECTED:
    case SystemStatus.REVOKED:
      return "bg-red-50/50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 shadow-none"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background/80" onClick={handleCopy}>
      <HugeiconsIcon
        icon={copied ? Tick02Icon : Copy01Icon}
        className="h-3 w-3"
        color="currentColor"
      />
    </Button>
  )
}

export function SystemDetailsSheet({
  system,
  open,
  onOpenChange,
}: SystemDetailsSheetProps) {
  const [isPending, setIsPending] = React.useState(false)

  if (!system) return null

  const createdAtLabel = formatDistanceToNow(new Date(system.createdAt), { addSuffix: true })

  const handleStatusUpdate = async (newStatus: SystemStatus) => {
    setIsPending(true)
    try {
      const result = await updateSystemStatusAction(system.id, newStatus)
      if (result.success) {
        toast.success(`System ${newStatus.toLowerCase()} successfully`)
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] flex flex-col p-0 bg-card hover:cursor-default overflow-x-hidden">
          <SheetHeader className="p-6 pb-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getStatusBadgeStyle(system.status)}>
                {system.status}
              </Badge>
            </div>
            <SheetTitle className="font-semibold text-xl truncate">{system.name || "Unnamed Device"}</SheetTitle>
            <SheetDescription>
              Technical profile and authorization status for this hardware.
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="space-y-6 py-4">
              {/* Hardware Hero Card */}
              <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/80 p-6 shadow-sm">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-background shadow-sm border flex items-center justify-center text-primary">
                      <HugeiconsIcon icon={LaptopIcon} className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">MAC Address</p>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <code className="text-sm font-mono font-bold text-foreground truncate block">
                          {system.macAddress || "UNKNOWN"}
                        </code>
                        <CopyButton text={system.macAddress || ""} />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/40" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Hostname</p>
                      <p className="text-sm font-medium flex items-center gap-1.5 truncate">
                        <HugeiconsIcon icon={ComputerIcon} className="h-3.5 w-3.5 text-muted-foreground" />
                        {system.hostName || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">IP Address</p>
                      <p className="text-sm font-medium flex items-center gap-1.5 truncate">
                        <HugeiconsIcon icon={GlobeIcon} className="h-3.5 w-3.5 text-muted-foreground" />
                        {system.ipAddress || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <HugeiconsIcon
                   icon={FingerPrintIcon}
                   className="absolute -right-6 -bottom-6 h-32 w-32 opacity-[0.03] rotate-12"
                   color="currentColor"
                />

              </div>

              {/* Status Info */}
              {system.status === SystemStatus.APPROVED && system.approvedBy && (
                <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] p-4 transition-all">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shadow-sm ring-1 ring-emerald-500/20">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs text-muted-foreground">Authorized By</p>
                    <p className="text-sm font-medium truncate leading-tight mt-0.5">
                      {system.approvedBy.name || "Unknown Admin"}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{system.approvedBy.email}</p>
                  </div>
                </div>
              )}

              {/* Timeline Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium px-1">System Timeline</h4>
                <div className="grid gap-3">
                  <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20">
                      <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">First Registered</p>
                      <p className="text-sm truncate leading-tight mt-0.5">
                        {format(new Date(system.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 shrink-0">
                      {createdAtLabel}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 shadow-sm ring-1 ring-orange-500/20">
                      <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Last Activity</p>
                      <p className="text-sm truncate leading-tight mt-0.5">
                        {format(new Date(system.updatedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs py-0.5 shrink-0">
                      {format(new Date(system.updatedAt), "h:mm a")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <SheetFooter className="mt-auto border-t py-4 px-6 gap-3 bg-muted/5 backdrop-blur-sm flex flex-row">
            {system.status === SystemStatus.PENDING ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 min-w-0 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all active:scale-95"
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(SystemStatus.REJECTED)}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 shrink-0" />
                  Reject
                </Button>
                <Button
                  className="flex-1 min-w-0 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                  disabled={isPending}
                  onClick={() => handleStatusUpdate(SystemStatus.APPROVED)}
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 shrink-0" />
                  Approve
                </Button>
              </>
            ) : system.status === SystemStatus.APPROVED ? (
              <Button
                variant="outline"
                className="w-full bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 transition-all active:scale-95 font-semibold"
                disabled={isPending}
                onClick={() => handleStatusUpdate(SystemStatus.REVOKED)}
              >
                <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4 shrink-0" />
                Revoke Authorization
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all active:scale-95 font-semibold"
                disabled={isPending}
                onClick={() => handleStatusUpdate(SystemStatus.PENDING)}
              >
                <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4 shrink-0" />
                Restore to Pending
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
