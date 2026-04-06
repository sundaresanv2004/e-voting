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
import { ScrollArea } from "@/components/ui/scroll-area"
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
        toast.success(initialData ? "Candidate updated successfully" : "Candidate created successfully")
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
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0 bg-card rounded-2xl border shadow-2xl">
        <DialogHeader className="px-6 py-6 border-b bg-muted/5">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEditing ? "Edit Candidate Profile" : "Register New Candidate"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium opacity-70">
            {isEditing
              ? "Update candidate metadata and assigned administrative role."
              : "Onboard a new candidate into this specific election campaign."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="max-h-[60vh]">
            <div className="px-6 py-6 space-y-6">
              {availableRoles.length === 0 && (
                <div className="rounded-2xl bg-orange-500/5 p-4 border border-orange-500/20 flex gap-3 text-orange-600 animate-in fade-in zoom-in-95 duration-300">
                  <HugeiconsIcon icon={Alert01Icon} className="h-5 w-5 shrink-0 mt-0.5" color="currentColor" />
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-wider">No active roles</p>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                      You must define at least one Election Role before adding any candidates to this campaign.
                    </p>
                  </div>
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="name">Candidate Full Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g. John Doe"
                  {...register("name")}
                  disabled={isPending}
                />
                {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Election Role Assignment</FieldLabel>
                <Select 
                  onValueChange={(val) => setValue("electionRoleId", val)} 
                  value={watch("electionRoleId")} 
                  disabled={isPending}
                >
                  <SelectTrigger id="role" className="w-full h-11 rounded-xl border-muted-foreground/20 bg-background/50">
                    <SelectValue placeholder="Assign an active role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-muted-foreground/20 shadow-xl">
                    {availableRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="focus:bg-primary/5 focus:text-primary transition-colors cursor-pointer py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-sm">{role.name}</span>
                          <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground opacity-50">Priority Order: {role.order}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.electionRoleId && <FieldError errors={[{ message: errors.electionRoleId.message }]} />}
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel>Profile Image</FieldLabel>
                  <ImageUpload
                    value={profileImage || ""}
                    onChange={(val) => setValue("profileImage", val)}
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
                    disabled={isPending}
                    folder="candidates/symbols"
                  />
                  {errors.symbolImage && <FieldError errors={[{ message: errors.symbolImage.message }]} />}
                </Field>
              </div>

              {serverError && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200 shadow-sm">
                  <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="font-semibold tracking-tight">{serverError}</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t bg-muted/10 gap-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-muted-foreground/20 hover:bg-muted font-bold text-[11px] uppercase tracking-wider"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Discard Changes
            </Button>
            <Button
              type="submit"
              className="rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-md active:scale-95 transition-all"
              disabled={isPending || availableRoles.length === 0}
            >
              {isPending ? "Processing..." : isEditing ? "Update Candidate" : "Register Candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
