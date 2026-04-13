"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PencilEdit01Icon,
  InformationCircleIcon,
  ComputerIcon,
  LockIcon,
} from "@hugeicons/core-free-icons"
import { SystemStatus } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { editSystemAction } from "../_actions"
import { getSystemStatusBadgeStyle, type System } from "./columns"

interface EditSystemDialogProps {
  system: System | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Terminal states — no editing allowed
const LOCKED_STATUSES: SystemStatus[] = [
  SystemStatus.REJECTED,
  SystemStatus.REVOKED,
  SystemStatus.SUSPENDED,
]

// Returns current status first (default), then valid transitions
function getAvailableTransitions(current: SystemStatus): SystemStatus[] {
  switch (current) {
    case SystemStatus.PENDING:
      return [SystemStatus.PENDING, SystemStatus.APPROVED, SystemStatus.REJECTED]
    case SystemStatus.APPROVED:
      return [SystemStatus.APPROVED, SystemStatus.REVOKED, SystemStatus.PENDING]
    case SystemStatus.EXPIRED:
      return [SystemStatus.EXPIRED, SystemStatus.PENDING]
    default:
      return []
  }
}

export function EditSystemDialog({ system, open, onOpenChange }: EditSystemDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [name, setName] = React.useState("")
  const [status, setStatus] = React.useState<SystemStatus>(SystemStatus.PENDING)

  const isLocked = system ? LOCKED_STATUSES.includes(system.status) : false
  const availableTransitions = system ? getAvailableTransitions(system.status) : []

  React.useEffect(() => {
    if (open && system) {
      setName(system.name ?? "")
      setStatus(system.status) // default to current status — no change
      setError(null)
    }
  }, [open, system])

  const handleSubmit = async () => {
    if (!system) return
    setIsPending(true)
    setError(null)

    try {
      const res = await editSystemAction(system.id, name, status)
      if (res.success) {
        toast.success(`System "${name || system.name || "Unnamed Device"}" updated successfully`)
        onOpenChange(false)
      } else {
        setError(res.error || "Failed to update system")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const hasChanges = name !== (system?.name ?? "") || status !== system?.status

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 flex flex-col bg-card">
        <DialogHeader className="px-6 py-4 border-b bg-card gap-1 overflow-hidden relative">
          <DialogTitle className="font-semibold text-xl tracking-tight">
            Edit System
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground/80">
            {isLocked
              ? `This system is ${system?.status.toLowerCase()} and cannot be edited.`
              : `Update the display name or authorization status for "${system?.name || system?.hostName || "this device"}".`}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-6 space-y-5">
          {/* Read-only hardware info */}
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center border border-border/50 shrink-0">
              <HugeiconsIcon icon={ComputerIcon} className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Hostname (fixed)</p>
              <p className="text-sm font-mono font-semibold truncate">{system?.hostName || "N/A"}</p>
            </div>
          </div>

          {isLocked ? (
            /* Locked state — show current values read-only */
            <div className="rounded-xl border border-dashed bg-muted/20 p-5 flex flex-col items-center gap-3 text-center">
              <HugeiconsIcon icon={LockIcon} className="h-8 w-8 text-muted-foreground/40" />
              <div>
                <p className="text-sm font-semibold text-foreground">System is locked</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                  Systems that are{" "}
                  <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 font-black uppercase tracking-widest ${getSystemStatusBadgeStyle(system!.status)}`}>
                    {system?.status}
                  </Badge>{" "}
                  cannot be edited. A new connection request from the device is required to change their status.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Editable name */}
              <Field>
                <FieldLabel>Display Name</FieldLabel>
                <Input
                  placeholder="e.g. Lab Computer 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  className="mt-1"
                />
                <FieldDescription>
                  A friendly name shown across the dashboard.
                </FieldDescription>
              </Field>

              {/* Context-aware status transitions */}
              <Field>
                <FieldLabel>Change Status</FieldLabel>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as SystemStatus)}
                  disabled={isPending}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTransitions.map((s) => (
                      <SelectItem key={s} value={s} className="p-2">
                        <Badge
                          variant="outline"
                          className={`font-black uppercase tracking-widest text-[9px] py-0 px-2 h-5 ${getSystemStatusBadgeStyle(s)}`}
                        >
                          {s}
                        </Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {system?.status === SystemStatus.PENDING &&
                    "Approve to grant access or reject to deny this terminal."}
                  {system?.status === SystemStatus.APPROVED &&
                    "Revoke to disable access, or move back to Pending to re-evaluate."}
                  {system?.status === SystemStatus.EXPIRED &&
                    "Restore to Pending to allow the terminal to re-authenticate."}
                </FieldDescription>
              </Field>
            </>
          )}

          {error && (
            <FieldError className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 text-destructive border border-destructive/10">
              <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="font-medium text-xs">{error}</span>
            </FieldError>
          )}
        </div>

        <DialogFooter className="px-6 py-3 border-t flex flex-row items-center justify-between gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {isLocked ? "Close" : "Cancel"}
          </Button>
          {!isLocked && (
            <Button onClick={handleSubmit} disabled={isPending || !hasChanges}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
