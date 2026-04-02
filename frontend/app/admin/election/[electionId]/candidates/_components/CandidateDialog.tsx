"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, Image01Icon, InformationCircleIcon, CloudUploadIcon, Link01Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"

import { createCandidate, updateCandidate } from "../_actions"
import type { RoleColumn } from "../../roles/_components/columns"

interface CandidateDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  electionId: string
  availableRoles: RoleColumn[]
  initialData?: {
    id: string
    name: string
    electionRoleId: string
    profileImage?: string | null
    symbolImage?: string | null
  }
}

export function CandidateDialog({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  electionId,
  availableRoles,
  initialData
}: CandidateDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [name, setName] = React.useState("")
  const [electionRoleId, setElectionRoleId] = React.useState("")
  const [profileImage, setProfileImage] = React.useState("")
  const [symbolImage, setSymbolImage] = React.useState("")

  const isEditing = !!initialData

  // Reset form when dialog opens/initialData changes
  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "")
      setElectionRoleId(initialData?.electionRoleId ?? (availableRoles.length === 1 ? availableRoles[0].id : ""))
      setProfileImage(initialData?.profileImage ?? "")
      setSymbolImage(initialData?.symbolImage ?? "")
      setError(null)
    }
  }, [open, initialData, availableRoles])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Candidate name is required")
      return
    }
    if (!electionRoleId) {
      setError("Please select an election role")
      return
    }

    setIsPending(true)
    setError(null)

    try {
      const data = {
        name,
        electionRoleId,
        profileImage: profileImage || undefined,
        symbolImage: symbolImage || undefined,
      }

      const result = isEditing
        ? await updateCandidate(initialData.id, electionId, data)
        : await createCandidate(electionId, data)

      if (result.success) {
        toast.success(isEditing ? "Candidate updated successfully" : "Candidate created successfully")
        setOpen(false)
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0 bg-background max-h-[90vh] flex flex-col rounded-2xl">
        <DialogHeader className="px-6 py-6 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Candidate" : "Create New Candidate"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update candidate profile and role information."
              : "Register a new candidate and assign them to an active role."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            {availableRoles.length === 0 && (
              <div className="rounded-xl bg-orange-500/10 p-4 ring-1 ring-orange-500/20 flex gap-3 text-orange-600">
                <HugeiconsIcon icon={Alert01Icon} strokeWidth={2.5} className="h-5 w-5 shrink-0" color="currentColor" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">No active roles</p>
                  <p className="text-xs opacity-90 leading-relaxed">
                    You need to create at least one Election Role before you can add candidates.
                  </p>
                </div>
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="name">Candidate Name</FieldLabel>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Contesting For (Role)</FieldLabel>
              <Select onValueChange={setElectionRoleId} value={electionRoleId} disabled={isPending}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue placeholder="Select an active role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field>
                <FieldLabel htmlFor="profileImage">Profile Image</FieldLabel>
                <ImageUpload
                  value={profileImage}
                  onChange={setProfileImage}
                  disabled={isPending}
                  folder="candidates/profiles"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="symbolImage">Candidate Symbol</FieldLabel>
                <ImageUpload
                  value={symbolImage}
                  onChange={setSymbolImage}
                  disabled={isPending}
                  folder="candidates/symbols"
                />
              </Field>
            </div>


            {error && (
              <div className="flex items-start gap-2 p-3 rounded-2xl bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
                <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || availableRoles.length === 0 || !name.trim() || !electionRoleId}
            >
              {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
