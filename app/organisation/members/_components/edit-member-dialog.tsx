"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
  FieldContent,
} from "@/components/ui/field"

import {
  MemberPermissionsSchema,
  type MemberPermissionsValues,
} from "@/lib/schemas/member"
import { updateMemberAccess, getElectionsForAssignment } from "@/lib/actions/member"

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: any
}

export function EditMemberDialog({ open, onOpenChange, member }: EditMemberDialogProps) {
  const router = useRouter()
  const [availableElections, setAvailableElections] = React.useState<any[]>([])
  const [isLoadingElections, setIsLoadingElections] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MemberPermissionsValues>({
    resolver: zodResolver(MemberPermissionsSchema),
    defaultValues: {
      role: "viewer",
      hasAllAccess: false,
      electionIds: [],
    },
  })

  const roleValue = watch("role")
  const hasAllAccess = watch("hasAllAccess")
  const electionIds = watch("electionIds")

  // Auto full-access for org_admin
  React.useEffect(() => {
    if (roleValue === "org_admin" && !hasAllAccess) {
      setValue("hasAllAccess", true, { shouldValidate: true })
      setValue("electionIds", [], { shouldValidate: true })
    }
  }, [roleValue, hasAllAccess, setValue])

  // Populate from member when dialog opens
  React.useEffect(() => {
    if (open && member) {
      const currentRole = (member.customRole as MemberPermissionsValues["role"]) || "viewer"
      const currentAllAccess =
        member.user?.hasAllElectionsAccess || currentRole === "org_admin"
      const currentElectionIds: string[] = (member.user?.electionAccess || [])
        .map((ea: any) => ea.electionId || ea.election?.id)
        .filter(Boolean)

      reset({
        role: currentRole,
        hasAllAccess: currentAllAccess,
        electionIds: currentElectionIds,
      })
      setSubmitError(null)

      // Load elections
      setIsLoadingElections(true)
      getElectionsForAssignment()
        .then((res) => setAvailableElections(res.elections || []))
        .catch(() => toast.error("Failed to load elections"))
        .finally(() => setIsLoadingElections(false))
    }
  }, [open, member, reset])

  // Toggle an election in/out of electionIds
  const toggleElection = (electionId: string) => {
    const current = electionIds
    const updated = current.includes(electionId)
      ? current.filter((id) => id !== electionId)
      : [...current, electionId]
    setValue("electionIds", updated, { shouldValidate: true })
  }

  const onSubmit = async (data: MemberPermissionsValues) => {
    setSubmitError(null)
    try {
      const res = await updateMemberAccess(
        member.userId,
        data.role,
        data.hasAllAccess,
        data.hasAllAccess ? [] : data.electionIds
      )
      if (!res.success) {
        setSubmitError(res.error || "Failed to update member")
      } else {
        toast.success("Member updated successfully")
        onOpenChange(false)
        router.refresh()
      }
    } catch {
      setSubmitError("An unexpected error occurred")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] p-0 overflow-hidden gap-0 flex flex-col max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header — no bottom border */}
        <DialogHeader className="px-6 py-5">
          <DialogTitle className="font-heading text-xl">Edit Member</DialogTitle>
          <DialogDescription>
            Update role and permissions for{" "}
            <strong>{member?.user?.name || member?.user?.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]">
          <form
            id="edit-member-form"
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 pb-6 flex flex-col gap-6"
          >
            {/* Role */}
            <FieldGroup>
              <Field data-invalid={!!errors.role}>
                <FieldLabel>Organization Role</FieldLabel>
                <FieldContent>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-full rounded-2xl">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Roles</SelectLabel>
                            <SelectItem value="org_admin">
                              Org Admin (Full Access)
                            </SelectItem>
                            <SelectItem value="staff">Staff (Limited Access)</SelectItem>
                            <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.role && <FieldError>{errors.role.message}</FieldError>}
                </FieldContent>
              </Field>
            </FieldGroup>

            <Separator />

            {/* Full access */}
            <FieldGroup>
              <Field orientation="horizontal">
                <Controller
                  control={control}
                  name="hasAllAccess"
                  render={({ field }) => (
                    <Checkbox
                      id="edit-all-access"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(!!checked)
                        if (checked) {
                          setValue("electionIds", [], { shouldValidate: true })
                        }
                      }}
                      disabled={roleValue === "org_admin" || isSubmitting}
                    />
                  )}
                />
                <FieldContent>
                  <FieldTitle>
                    <label
                      htmlFor="edit-all-access"
                      className="cursor-pointer font-medium text-sm"
                    >
                      Include All Elections
                    </label>
                  </FieldTitle>
                  <FieldDescription>
                    Grant access to all current and future elections.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>

            {/* Per-election selection */}
            {!hasAllAccess && roleValue !== "org_admin" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Specific Elections
                  </p>
                  <Badge variant="secondary" className="text-[10px] font-semibold">
                    {electionIds.length} selected
                  </Badge>
                </div>

                {isLoadingElections ? (
                  <div className="flex flex-col gap-2.5">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-[58px] w-full rounded-2xl" />
                    ))}
                  </div>
                ) : availableElections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center italic py-6">
                    No elections found to assign.
                  </p>
                ) : (
                  <ScrollArea className="max-h-[180px]">
                    <FieldGroup className="gap-2 pr-3">
                      {availableElections.map((election) => {
                        const isSelected = electionIds.includes(election.id)
                        return (
                          <FieldLabel
                            key={election.id}
                            htmlFor={`edit-election-${election.id}`}
                            className="cursor-pointer"
                            data-checked={isSelected}
                          >
                            <Field orientation="horizontal">
                              <FieldContent>
                                <FieldTitle className="text-sm">
                                  {election.name}
                                </FieldTitle>
                                <FieldDescription className="text-[10px] uppercase tracking-wider font-semibold">
                                  {election.status}
                                </FieldDescription>
                              </FieldContent>
                              <Checkbox
                                id={`edit-election-${election.id}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleElection(election.id)}
                                disabled={isSubmitting}
                              />
                            </Field>
                          </FieldLabel>
                        )
                      })}
                    </FieldGroup>
                  </ScrollArea>
                )}

                {errors.electionIds && (
                  <FieldError>{errors.electionIds.message}</FieldError>
                )}
              </div>
            )}

            {/* Submit error */}
            {submitError && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-destructive text-sm">
                <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </form>
        </ScrollArea>

        {/* Footer — no top border */}
        <DialogFooter className="px-6 py-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-member-form"
            disabled={isSubmitting}
          >
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
