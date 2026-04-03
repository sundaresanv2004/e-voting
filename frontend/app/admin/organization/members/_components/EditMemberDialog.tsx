"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PencilEdit01Icon,
  InformationCircleIcon,
  Archive01Icon,
  Shield01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { UserRole } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldDescription, FieldError, FieldContent, FieldTitle } from "@/components/ui/field"
import { updateMemberAction, getElectionsForAssignment } from "../_actions"
import type { Member } from "./columns"

interface EditMemberDialogProps {
  member: Member | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMemberDialog({ member, open, onOpenChange }: EditMemberDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [role, setRole] = React.useState<UserRole>(UserRole.STAFF)
  const [hasAllAccess, setHasAllAccess] = React.useState(true)
  const [selectedElectionIds, setSelectedElectionIds] = React.useState<string[]>([])
  const [availableElections, setAvailableElections] = React.useState<any[]>([])

  // Initialize state when member changes or dialog opens
  React.useEffect(() => {
    if (open && member) {
      setRole(member.role)
      setHasAllAccess(member.hasAllElectionsAccess)
      setSelectedElectionIds(member.electionAccess.map(ea => ea.electionId))
      loadElections()
    }
  }, [open, member])

  const loadElections = async () => {
    try {
      const elections = await getElectionsForAssignment()
      setAvailableElections(elections)
    } catch (err) {
      toast.error("Failed to load elections list")
    }
  }

  const handleSubmit = async () => {
    if (!member) return
    setIsPending(true)
    setError(null)

    try {
      const res = await updateMemberAction(
        member.id,
        role,
        hasAllAccess,
        selectedElectionIds
      )

      if (res.success) {
        toast.success(`Successfully updated access for ${member.name || member.email}`)
        onOpenChange(false)
      } else {
        setError(res.error || "Failed to update member")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col bg-card">
        <DialogHeader className="px-6 py-4 border-b bg-card gap-1 overflow-hidden relative">
          <DialogTitle className="font-semibold text-xl tracking-tight">
            Configure Access
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground/80">
            Updating {member?.name}&apos;s permissions in organization.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {/* Identity Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border">
              <Avatar className="h-12 w-12 border-2 border">
                <AvatarImage src={member?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {member?.name?.charAt(0) || member?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-base truncate">{member?.name || "Anonymous Professional"}</h4>
                <p className="text-xs text-muted-foreground truncate">{member?.email}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-6">
                <Field>
                  <FieldLabel>Organizational Role</FieldLabel>
                  <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={isPending}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.STAFF}>Organization Staff</SelectItem>
                      <SelectItem value={UserRole.VIEWER}>Organization Viewer</SelectItem>
                      <SelectItem value={UserRole.ORG_ADMIN}>Organization Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field orientation="horizontal">
                  <Checkbox
                    id="all-access-edit"
                    checked={hasAllAccess}
                    onCheckedChange={(c) => setHasAllAccess(!!c)}
                    disabled={role === UserRole.ORG_ADMIN || isPending}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="all-access-edit">Include All Elections</FieldLabel>
                    <FieldDescription>Grant access to all current and future elections.</FieldDescription>
                  </FieldContent>
                </Field>
              </div>

              {!hasAllAccess && role !== UserRole.ORG_ADMIN && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pl-1">
                    <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                      Specific Assignments
                    </p>
                    <Badge variant="secondary" className="text-[10px] font-semibold">{selectedElectionIds.length} Selected</Badge>
                  </div>
                  <ScrollArea className="h-[180px] w-full">
                    <div className="space-y-3">
                      {availableElections.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic text-center py-8">No elections found to assign.</p>
                      ) : (
                        availableElections.map((election) => {
                          const isSelected = selectedElectionIds.includes(election.id);
                          return (
                            <FieldLabel
                              key={election.id}
                              htmlFor={`election-${election.id}`}
                              className="cursor-pointer"
                              data-checked={isSelected}
                            >
                              <Field orientation="horizontal">
                                <FieldContent>
                                  <FieldTitle className="text-sm font-bold">
                                    {election.name}
                                  </FieldTitle>
                                  <FieldDescription className="text-[10px] uppercase tracking-wider font-bold">
                                    {election.status}
                                  </FieldDescription>
                                </FieldContent>
                                <Checkbox
                                  id={`election-${election.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => {
                                    setSelectedElectionIds(prev =>
                                      prev.includes(election.id)
                                        ? prev.filter(id => id !== election.id)
                                        : [...prev, election.id]
                                    )
                                  }}
                                />
                              </Field>
                            </FieldLabel>
                          )
                        })
                      )}
                    </div>
                  </ScrollArea>
                  <p className="text-[11px] text-muted-foreground pl-1">
                    Invitations will be sent for each assigned election.
                  </p>
                </div>
              )}

              {error && (
                <FieldError className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 text-destructive border border-destructive/10">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-medium text-xs">{error}</span>
                </FieldError>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-3 border-t flex flex-row items-center justify-between gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || (!hasAllAccess && selectedElectionIds.length === 0 && role !== UserRole.ORG_ADMIN)}
          >
            {isPending ? "Updating Access..." : "Update Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
