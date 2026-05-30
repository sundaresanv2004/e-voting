"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShuffleIcon, Alert01Icon } from "@hugeicons/core-free-icons"

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@/components/ui/input-group"
import { Field, FieldLabel, FieldError, FieldContent, FieldDescription } from "@/components/ui/field"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { VoterSchema, type VoterFormValues } from "@/lib/schemas/voter"
import { createVoter, updateVoter, getNewUniqueCode } from "@/lib/actions/voter"

export type CategoryOption = { id: string; name: string; code: string }

interface VoterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  electionId: string
  allCategories: CategoryOption[]
  voter?: {
    id: string
    name: string
    uniqueId: string
    categoryId: string | null
  }
}

export function VoterDialog({
  open,
  onOpenChange,
  electionId,
  allCategories,
  voter,
}: VoterDialogProps) {
  const router = useRouter()
  const isEditing = !!voter
  const [isPending, setIsPending] = React.useState(false)
  const [isGenerating, setIsGenerating] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<VoterFormValues>({
    resolver: zodResolver(VoterSchema),
    defaultValues: {
      name: "",
      uniqueId: "",
      categoryId: null,
    },
  })

  React.useEffect(() => {
    if (open) {
      reset({
        name: voter?.name ?? "",
        uniqueId: voter?.uniqueId ?? "",
        categoryId: voter?.categoryId ?? null,
      })
    }
  }, [open, voter, reset])

  const onSubmit = async (data: VoterFormValues) => {
    setIsPending(true)
    try {
      const res = isEditing
        ? await updateVoter(voter.id, electionId, data)
        : await createVoter(electionId, data)

      if (!res.success) {
        const msg = res.error || "Something went wrong"
        if (msg.toLowerCase().includes("unique id") || msg.toLowerCase().includes("unique_id")) {
          setError("uniqueId", { type: "manual", message: msg })
        } else if (msg.toLowerCase().includes("name")) {
          setError("name", { type: "manual", message: msg })
        } else {
          toast.error(msg)
        }
        return
      }

      toast.success(isEditing ? "Voter updated successfully" : "Voter registered successfully")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  const handleGenerateCode = async () => {
    setIsGenerating(true)
    try {
      const result = await getNewUniqueCode(electionId)
      if (result.code) {
        setValue("uniqueId", result.code, { shouldValidate: true })
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch {
      toast.error("Failed to generate code")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 py-5">
            <DialogTitle className="font-heading">
              {isEditing ? "Edit Voter" : "Register Voter"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details for this registered voter."
                : "Add a new voter to this election."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Name */}
              <Field data-invalid={!!errors.name}>
                <FieldLabel>Full Name</FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="e.g. John Doe"
                    disabled={isPending}
                    {...register("name")}
                  />
                  {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </FieldContent>
              </Field>

              {/* Unique ID */}
              <Field data-invalid={!!errors.uniqueId}>
                <FieldLabel>Unique ID <span className="text-muted-foreground font-normal">(Optional)</span></FieldLabel>
                <FieldContent>
                  <InputGroup>
                    <InputGroupInput
                      placeholder="Leave empty to auto-generate"
                      disabled={isPending}
                      className="font-mono text-sm"
                      {...register("uniqueId")}
                    />
                    <InputGroupAddon align="inline-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InputGroupButton
                            variant="ghost"
                            size="icon-xs"
                            type="button"
                            onClick={handleGenerateCode}
                            disabled={isPending || isGenerating}
                          >
                            {isGenerating ? (
                              <Spinner className="h-3.5 w-3.5" />
                            ) : (
                              <HugeiconsIcon icon={ShuffleIcon} className="h-3.5 w-3.5" />
                            )}
                          </InputGroupButton>
                        </TooltipTrigger>
                        <TooltipContent side="top">Generate random code</TooltipContent>
                      </Tooltip>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldDescription>
                    If left empty, a secure ID will be automatically assigned.
                  </FieldDescription>
                  {errors.uniqueId && <FieldError>{errors.uniqueId.message}</FieldError>}
                </FieldContent>
              </Field>

              {/* Category */}
              <Field data-invalid={!!errors.categoryId}>
                <FieldLabel>Category <span className="text-muted-foreground font-normal">(Optional)</span></FieldLabel>
                <FieldContent>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(val) => field.onChange(val === "__global__" ? null : val)}
                        value={field.value ?? "__global__"}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Any Category (Global)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Voter Category</SelectLabel>
                            <SelectItem value="__global__">
                              Any Category (Global)
                            </SelectItem>
                            {allCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                <span>{cat.name}</span>
                                <code className="ml-2 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">
                                  {cat.code}
                                </code>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldDescription>
                    Restricts the voter to roles within this category. Leave as global to allow voting in all categories.
                  </FieldDescription>
                  {errors.categoryId && <FieldError>{errors.categoryId.message}</FieldError>}
                </FieldContent>
              </Field>

              {/* Warning if no categories exist */}
              {allCategories.length === 0 && (
                <div className="rounded-2xl bg-amber-500/5 p-4 border border-amber-500/20 flex gap-3 text-amber-600 animate-in fade-in zoom-in-95 duration-300">
                  <HugeiconsIcon icon={Alert01Icon} className="h-5 w-5 shrink-0 mt-0.5" color="currentColor" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">No categories defined</p>
                    <p className="text-xs font-medium opacity-80 leading-relaxed">
                      This voter will be able to vote in all election roles. Create categories first to restrict access.
                    </p>
                  </div>
                </div>
              )}
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
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                {isPending
                  ? isEditing ? "Saving..." : "Registering..."
                  : isEditing ? "Save Changes" : "Register Voter"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
