"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"

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
import { Field, FieldLabel, FieldError, FieldContent, FieldDescription } from "@/components/ui/field"
import { ImageUpload } from "@/components/ui/image-upload"

import { CandidateSchema, type CandidateFormValues } from "@/lib/schemas/candidate"
import { createCandidate, updateCandidate } from "@/lib/actions/candidate"

interface CandidateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  electionId: string
  allRoles: { id: string; name: string; order: number }[]
  candidate?: {
    id: string
    name: string
    profileImage: string | null
    symbolImage: string | null
    role: { id: string }
  }
}

export function CandidateDialog({
  open,
  onOpenChange,
  electionId,
  allRoles,
  candidate,
}: CandidateDialogProps) {
  const router = useRouter()
  const isEditing = !!candidate
  const [isPending, setIsPending] = React.useState(false)
  const [isProfileUploading, setIsProfileUploading] = React.useState(false)
  const [isSymbolUploading, setIsSymbolUploading] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(CandidateSchema),
    defaultValues: {
      name: "",
      electionRoleId: allRoles.length === 1 ? allRoles[0].id : "",
      profileImage: null,
      symbolImage: null,
    },
  })

  const profileImage = watch("profileImage")
  const symbolImage = watch("symbolImage")

  React.useEffect(() => {
    if (open) {
      reset({
        name: candidate?.name ?? "",
        electionRoleId: candidate?.role.id ?? (allRoles.length === 1 ? allRoles[0].id : ""),
        profileImage: candidate?.profileImage ?? null,
        symbolImage: candidate?.symbolImage ?? null,
      })
    }
  }, [open, candidate, allRoles, reset])

  const onSubmit = async (data: CandidateFormValues) => {
    setIsPending(true)
    try {
      const res = isEditing
        ? await updateCandidate(candidate.id, electionId, data)
        : await createCandidate(electionId, data)

      if (!res.success) {
        const msg = res.error || "Something went wrong"
        toast.error(msg as string)
        return
      }

      toast.success(isEditing ? "Candidate updated successfully" : "Candidate registered successfully")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-5">
          <DialogTitle className="font-heading">
            {isEditing ? "Edit Candidate" : "Register Candidate"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this candidate."
              : "Add a new candidate to this election."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            {allRoles.length === 0 && (
              <div className="rounded-2xl bg-orange-500/5 p-4 border border-orange-500/20 flex gap-3 text-orange-600 animate-in fade-in zoom-in-95 duration-300">
                <HugeiconsIcon icon={Alert01Icon} className="h-5 w-5 shrink-0 mt-0.5" color="currentColor" />
                <div className="space-y-1">
                  <p className="text-sm font-bold">No active roles</p>
                  <p className="text-xs font-medium opacity-80 leading-relaxed">
                    You must define at least one Election Role before adding any candidates.{" "}
                    <Link 
                      href={`/organisation/election/${electionId}/roles?new=true`}
                      className="font-bold underline underline-offset-2 hover:text-orange-700 transition-colors"
                      onClick={() => onOpenChange(false)}
                    >
                      Create a role here
                    </Link>
                  </p>
                </div>
              </div>
            )}

            <Field data-invalid={!!errors.name}>
              <FieldLabel>Candidate Name</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. John Doe"
                  disabled={isPending}
                  {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.electionRoleId}>
              <FieldLabel>Election Role</FieldLabel>
              <FieldContent>
                <Controller
                  name="electionRoleId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Roles</SelectLabel>
                          {allRoles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldDescription>
                  Determines which position this candidate is contesting for.
                </FieldDescription>
                {errors.electionRoleId && <FieldError>{errors.electionRoleId.message}</FieldError>}
              </FieldContent>
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
                    variant="portrait"
                    value={profileImage || ""}
                    onChange={(val) => setValue("profileImage", val)}
                    onUploadingChange={setIsProfileUploading}
                    disabled={isPending}
                    folder="candidates/profiles"
                  />
                  {errors.profileImage && <FieldError>{errors.profileImage.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel>Election Symbol</FieldLabel>
                  <ImageUpload
                    variant="portrait"
                    value={symbolImage || ""}
                    onChange={(val) => setValue("symbolImage", val)}
                    onUploadingChange={setIsSymbolUploading}
                    disabled={isPending}
                    folder="candidates/symbols"
                  />
                  {errors.symbolImage && <FieldError>{errors.symbolImage.message}</FieldError>}
                </Field>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4">
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
              disabled={isPending || isProfileUploading || isSymbolUploading || allRoles.length === 0}
              className="min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Spinner className="mr-1.5 h-4 w-4" color="currentColor" />
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
