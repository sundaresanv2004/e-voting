"use client"

import * as React from "react"
import { format, formatDistanceToNow } from "date-fns"
import {
  PencilEdit01Icon,
  Delete02Icon,
  Calendar01Icon,
  Clock01Icon,
  FingerPrintIcon,
  ComputerIcon,
  GlobeIcon,
  Shield01Icon,
  Activity01Icon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Alert01Icon,
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
import { Spinner } from "@/components/ui/spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { updateSystemStatusAction } from "../_actions"

import { type System } from "./columns"

interface SystemDetailsSheetProps {
  system: System | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (system: System) => void
  onDelete?: (system: System) => void
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
    case SystemStatus.EXPIRED:
      return "bg-orange-50/50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 shadow-none"
    case SystemStatus.SUSPENDED:
      return "bg-purple-50/50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20 shadow-none"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

function getStatusDot(status: SystemStatus) {
  switch (status) {
    case SystemStatus.APPROVED:
      return "bg-emerald-500"
    case SystemStatus.PENDING:
      return "bg-amber-500"
    case SystemStatus.REJECTED:
    case SystemStatus.REVOKED:
      return "bg-red-500"
    case SystemStatus.EXPIRED:
      return "bg-orange-500"
    case SystemStatus.SUSPENDED:
      return "bg-purple-500"
    default:
      return "bg-secondary"
  }
}

export function SystemDetailsSheet({
  system,
  open,
  onOpenChange,
  onEdit,
  onDelete,
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
              <div className={`h-2 w-2 rounded-full ${getStatusDot(system.status)}`} />
              <Badge variant="outline" className={getStatusBadgeStyle(system.status)}>
                {system.status}
              </Badge>
            </div>
            <SheetTitle className="font-semibold text-xl truncate">{system.name || "Unnamed Device"}</SheetTitle>
            <SheetDescription>
              Technical profile and authorization status for this hardware.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 space-y-6 py-4">
            {/* Hardware Hero Card */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/80 p-6 shadow-sm">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-background shadow-sm border flex items-center justify-center text-primary">
                    <HugeiconsIcon icon={ComputerIcon} className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Hostname</p>
                    <p className="text-sm font-medium flex items-center gap-1.5 truncate mt-0.5">
                      {system.hostName || "N/A"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-border/40" />

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">MAC Address</p>
                    <div className="flex items-center gap-1.5 min-w-0 mt-0.5">
                      <code className="text-sm font-mono font-bold text-foreground/80 truncate block">
                        {system.macAddress || "UNKNOWN"}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              <HugeiconsIcon
                icon={FingerPrintIcon}
                className="absolute -right-6 -bottom-6 h-32 w-32 opacity-[0.03] rotate-12"
                color="currentColor"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 shadow-sm ring-1 ring-blue-500/20">
                  <HugeiconsIcon icon={GlobeIcon} className="h-5 w-5" color="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">IP Address</p>
                  <p className="text-sm font-medium truncate leading-tight mt-0.5">
                    {system.ipAddress || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Device Stats */}
            {system._count && (
              <>
                <Separator className="border-dashed" />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium px-1 text-foreground/80 flex items-center gap-2">
                    <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4 text-muted-foreground" />
                    Device Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 ring-1 ring-violet-500/20">
                        <HugeiconsIcon icon={Activity01Icon} className="h-4 w-4" color="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Logs</p>
                        <p className="text-lg font-bold leading-tight">{system._count.logs}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-600 ring-1 ring-cyan-500/20">
                        <HugeiconsIcon icon={CheckListIcon} className="h-4 w-4" color="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">Ballots</p>
                        <p className="text-lg font-bold leading-tight">{system._count.ballots}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator className="border-dashed" />

            {/* Timeline Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium px-1 text-foreground/80 flex items-center gap-2">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                System Timeline
              </h4>
              <div className="grid gap-3">
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20">
                    <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5" color="currentColor" />
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

                {system.lastOpenedAt && (
                  <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 shadow-sm ring-1 ring-green-500/20">
                      <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5" color="currentColor" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Most Recent Session</p>
                      <p className="text-sm truncate leading-tight mt-0.5">
                        {format(new Date(system.lastOpenedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs py-0.5 shrink-0">
                      {format(new Date(system.lastOpenedAt), "h:mm a")}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 shadow-sm ring-1 ring-orange-500/20">
                    <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5" color="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Last Activity Update</p>
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

            <Separator className="border-dashed" />

            {/* Integrity Logs */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium px-1 text-foreground/80 flex items-center gap-2">
                <HugeiconsIcon icon={Shield01Icon} className="h-4 w-4 text-muted-foreground" />
                Security & Integrity Logs
              </h4>
              <div className="grid gap-3">
                {!system.approvedBy && !system.updatedBy ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 rounded-xl border border-dashed bg-muted/5">
                    <HugeiconsIcon icon={Shield01Icon} className="h-8 w-8 mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground font-medium text-center max-w-[200px]">
                      No authorization or modification logs recorded for this hardware yet.
                    </p>
                  </div>
                ) : (
                  <>
                    {system.approvedBy && (
                      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                        <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                          <AvatarImage src={system.approvedBy.image || ""} alt={system.approvedBy.name || "User"} className="object-cover" />
                          <AvatarFallback className="bg-green-500/5 text-green-600 text-[10px] font-bold">
                            {system.approvedBy.name?.charAt(0) || system.approvedBy.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs text-muted-foreground">Authorized By</p>
                          <p className="text-sm font-medium truncate leading-tight mt-0.5">
                            {system.approvedBy.name || "System Admin"}
                          </p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[140px] block">{system.approvedBy.email}</p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                              {system.approvedBy.email}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                            Authorized
                          </Badge>
                          <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                            {system.approvedAt ? format(new Date(system.approvedAt), "MMM d, h:mm a") : "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    {system.updatedBy && (
                      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:bg-muted/10">
                        <Avatar className="h-10 w-10 shadow-sm border border-border/50 shrink-0">
                          <AvatarImage src={system.updatedBy.image || ""} alt={system.updatedBy.name || "User"} className="object-cover" />
                          <AvatarFallback className="bg-purple-500/5 text-purple-600 text-[10px] font-bold">
                            {system.updatedBy.name?.charAt(0) || system.updatedBy.email?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-xs text-muted-foreground">Modified By</p>
                          <p className="text-sm font-medium truncate leading-tight mt-0.5">
                            {system.updatedBy.name || "System Admin"}
                          </p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[140px] block">{system.updatedBy.email}</p>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                              {system.updatedBy.email}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 shrink-0">
                          <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 uppercase tracking-tighter opacity-70">
                            Modified
                          </Badge>
                          <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                            {format(new Date(system.updatedAt), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <SheetFooter className="mt-auto border-t py-4 px-6 bg-muted/5 lg:backdrop-blur-sm shrink-0 flex flex-col gap-2">
            {/* Status action buttons — only shown when the status has an action */}
            {(system.status === SystemStatus.PENDING ||
              system.status === SystemStatus.APPROVED ||
              system.status === SystemStatus.EXPIRED) && (
                <div className="flex gap-2 w-full">
                  {(system.status === SystemStatus.PENDING || system.status === SystemStatus.EXPIRED) ? (
                    <>
                      <Button
                        variant="outline"
                        className="flex-1 min-w-0 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors gap-2"
                        disabled={isPending}
                        onClick={() => handleStatusUpdate(SystemStatus.REJECTED)}
                      >
                        {isPending ? (
                          <Spinner className="h-4 w-4" color="currentColor" />
                        ) : (
                          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 shrink-0" color="currentColor" />
                        )}
                        {isPending ? "Rejecting..." : "Reject"}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 min-w-0 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-700 transition-colors gap-2"
                        disabled={isPending}
                        onClick={() => handleStatusUpdate(SystemStatus.APPROVED)}
                      >
                        {isPending ? (
                          <Spinner className="h-4 w-4" color="currentColor" />
                        ) : (
                          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 shrink-0" color="currentColor" />
                        )}
                        {isPending ? "Approving..." : "Approve"}
                      </Button>
                    </>
                  ) : system.status === SystemStatus.APPROVED && (
                    <Button
                      variant="outline"
                      className="flex-1 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors gap-2"
                      disabled={isPending}
                      onClick={() => handleStatusUpdate(SystemStatus.REVOKED)}
                    >
                      {isPending ? (
                        <Spinner className="h-4 w-4" color="currentColor" />
                      ) : (
                        <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4 shrink-0" color="currentColor" />
                      )}
                      {isPending ? "Revoking..." : "Revoke Authorization"}
                    </Button>
                  )}
                </div>
              )}

            {/* Edit & Delete */}
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1 min-w-0 bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors"
                disabled={isPending}
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onDelete?.(system), 300)
                }}
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4 shrink-0" color="currentColor" />
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1 min-w-0 bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 hover:text-blue-700 transition-colors"
                disabled={isPending}
                onClick={() => {
                  onOpenChange(false)
                  setTimeout(() => onEdit?.(system), 300)
                }}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 shrink-0" color="currentColor" />
                Edit System
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  )
}
