"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import { Spinner } from "@/components/ui/spinner"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup,
  SelectLabel,
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

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CandidateSchema, type CandidateFormValues } from "@/lib/schemas/candidate"

interface CandidateDialogProps {
  children?: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
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
  open,
  onOpenChange,
  electionId,
  availableRoles,
  initialData
}: CandidateDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [isProfileUploading, setIsProfileUploading] = React.useState(false)
  const [isSymbolUploading, setIsSymbolUploading] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors }
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      electionRoleId: initialData?.electionRoleId ?? (availableRoles.length === 1 ? availableRoles[0].id : ""),
      profileImage: initialData?.profileImage ?? null,
      symbolImage: initialData?.symbolImage ?? null,
    }
  })

  const profileImage = watch("profileImage")
  const symbolImage = watch("symbolImage")

  // Reset form when dialog opens/initialData changes
  React.useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name ?? "",
        electionRoleId: initialData?.electionRoleId ?? (availableRoles.length === 1 ? availableRoles[0].id : ""),
        profileImage: initialData?.profileImage ?? null,
        symbolImage: initialData?.symbolImage ?? null,
      })
      setServerError(null)
    }
  }, [open, initialData, availableRoles, reset])

  const onSubmit = async (values: CandidateFormValues) => {
    setIsPending(true)
    setServerError(null)

    try {
      const result = initialData
        ? await updateCandidate(initialData.id, electionId, values)
        : await createCandidate(electionId, values)

      if (result.success) {
        toast.success(`Candidate ${initialData ? "updated" : "registered"}`)
        onOpenChange(false)
      } else {
        const errorMsg = result.error || "Something went wrong"

        if (typeof errorMsg === "object") {
          Object.entries(errorMsg).forEach(([key, messages]) => {
            setError(key as keyof CandidateFormValues, {
              type: "manual",
              message: (messages as string[])[0]
            })
          })
        } else {
          setServerError(errorMsg)
        }
      }
    } catch {
      setServerError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const isEditing = !!initialData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-card relative gap-1 overflow-hidden">
          <DialogTitle className="font-semibold text-xl tracking-tight">
            {isEditing ? "Edit Candidate" : "Register New Candidate"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground/80">
            {isEditing
              ? "Update the details for this candidate."
              : "Add a new candidate to this election."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden bg-card">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="space-y-4">
              {availableRoles.length === 0 && (
                <div className="rounded-2xl bg-orange-500/5 p-4 border border-orange-500/20 flex gap-3 text-orange-600 animate-in fade-in zoom-in-95 duration-300">
                  <HugeiconsIcon icon={Alert01Icon} className="h-5 w-5 shrink-0 mt-0.5" color="currentColor" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">No active roles</p>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                      You must define at least one Election Role before adding any candidates.
                    </p>
                  </div>
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="name">Candidate Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., John Doe"
                  {...register("name")}
                  disabled={isPending}
                />
                {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Election Role</FieldLabel>
                <Select
                  onValueChange={(val) => setValue("electionRoleId", val)}
                  value={watch("electionRoleId")}
                  disabled={isPending}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Election Roles</SelectLabel>
                      {availableRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Determines which position this candidate is contesting for.</FieldDescription>
                {errors.electionRoleId && <FieldError errors={[{ message: errors.electionRoleId.message }]} />}
              </Field>

              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between pl-1">
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                    Media
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel>Profile Image</FieldLabel>
                    <ImageUpload
                      value={profileImage || ""}
                      onChange={(val) => setValue("profileImage", val)}
                      onUploadingChange={setIsProfileUploading}
                      disabled={isPending}
                      folder="candidates/profiles"
                    />
                    {errors.profileImage && <FieldError errors={[{ message: errors.profileImage.message }]} />}
                  </Field>

                  <Field>
                    <FieldLabel>Election Symbol</FieldLabel>
                    <ImageUpload
                      value={symbolImage || ""}
                      onChange={(val) => setValue("symbolImage", val)}
                      onUploadingChange={setIsSymbolUploading}
                      disabled={isPending}
                      folder="candidates/symbols"
                    />
                    {errors.symbolImage && <FieldError errors={[{ message: errors.symbolImage.message }]} />}
                  </Field>
                </div>
              </div>
            </div>

            {serverError && (
              <FieldError className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
                <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-medium text-xs">{serverError}</span>
              </FieldError>
            )}
          </div>

          <DialogFooter className="px-6 py-3 border-t flex flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || isProfileUploading || isSymbolUploading || availableRoles.length === 0}
              className="min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Spinner className="h-4 w-4" color="currentColor" />
                  {isEditing ? "Saving..." : "Registering..."}
                </>
              ) : (isProfileUploading || isSymbolUploading)
                ? (
                  <>
                    <Spinner className="mr-1.5 h-4 w-4" color="currentColor" />
                    Uploading Media...
                  </>
                )
                : (isEditing ? "Save Changes" : "Register Candidate")
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
