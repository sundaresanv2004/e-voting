"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { GridIcon } from "@hugeicons/core-free-icons"

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
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Field, FieldLabel, FieldError, FieldContent, FieldDescription } from "@/components/ui/field"

import { RoleSchema, type RoleFormValues } from "@/lib/schemas/role"
import { createRole, updateRole } from "@/lib/actions/role"

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  electionId: string
  nextSuggestedOrder: number
  allCategories?: { id: string; name: string; code: string }[]
  electionCode?: string
  role?: {
    id: string
    name: string
    order: number
    categories?: { id: string }[]
  }
}

export function RoleDialog({
  open,
  onOpenChange,
  electionId,
  nextSuggestedOrder,
  allCategories = [],
  electionCode = "",
  role,
}: RoleDialogProps) {
  const router = useRouter()
  const isEditing = !!role
  const [isPending, setIsPending] = React.useState(false)

  // Identify the default category
  const defaultCategory = allCategories.find((c) => c.code === electionCode)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: "",
      order: nextSuggestedOrder,
      categoryIds: defaultCategory ? [defaultCategory.id] : [],
    },
  })

  const selectedCategoryIds = watch("categoryIds")

  React.useEffect(() => {
    if (open) {
      let initialCategoryIds = defaultCategory ? [defaultCategory.id] : []
      if (role?.categories) {
        initialCategoryIds = role.categories.map((c) => c.id)
      }
      // Ensure default category is always in the list
      if (defaultCategory && !initialCategoryIds.includes(defaultCategory.id)) {
        initialCategoryIds.push(defaultCategory.id)
      }

      reset({
        name: role?.name ?? "",
        order: role?.order ?? nextSuggestedOrder,
        categoryIds: initialCategoryIds,
      })
    }
  }, [open, role, nextSuggestedOrder, defaultCategory, reset])

  const onSubmit = async (data: RoleFormValues) => {
    setIsPending(true)
    try {
      const res = isEditing
        ? await updateRole(role.id, electionId, data)
        : await createRole(electionId, data)

      if (!res.success) {
        const msg = res.error || "Something went wrong"
        // Map server errors to field-level errors where possible
        if (msg.toLowerCase().includes("order")) {
          setError("order", { type: "manual", message: msg })
        } else if (msg.toLowerCase().includes("name")) {
          setError("name", { type: "manual", message: msg })
        } else {
          toast.error(msg)
        }
        return
      }

      toast.success(isEditing ? "Role updated successfully" : "Role created successfully")
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
            {isEditing ? "Edit Role" : "Create Role"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details for this election role."
              : "Define a new position for candidates to contest in this election."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-5">
            <Field data-invalid={!!errors.name}>
              <FieldLabel>Role Name</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. Head Boy, President"
                  disabled={isPending}
                  {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.order}>
              <FieldLabel>Priority Order</FieldLabel>
              <FieldContent>
                <Input
                  type="number"
                  min={1}
                  disabled={isPending}
                  {...register("order", { valueAsNumber: true })}
                />
                <FieldDescription>
                  Determines the display order on the ballot. Lower numbers appear first.
                </FieldDescription>
                {errors.order && <FieldError>{errors.order.message}</FieldError>}
              </FieldContent>
            </Field>

            {/* Category selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                  Assign to Categories
                </p>
                <Badge variant="secondary" className="text-[10px] font-black shadow-none">
                  {selectedCategoryIds?.length || 0} Selected
                </Badge>
              </div>
              <FieldDescription>
                Select which categories this role belongs to. The default category is always included.
              </FieldDescription>

              {allCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 px-4 text-center">
                  <HugeiconsIcon icon={GridIcon} className="size-8 mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    No categories found.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[160px]">
                  <div className="space-y-2 pb-2 mr-3">
                    {allCategories.map((cat) => {
                      const isDefault = cat.code === electionCode
                      const isSelected = selectedCategoryIds?.includes(cat.id) || isDefault
                      
                      return (
                        <Controller
                          key={cat.id}
                          name="categoryIds"
                          control={control}
                          render={({ field }) => (
                            <label
                              htmlFor={`cat-${cat.id}`}
                              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                                isDefault ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-muted/50"
                              } ${isSelected ? "bg-primary/5 border-primary/20" : ""}`}
                            >
                              <Checkbox
                                id={`cat-${cat.id}`}
                                checked={isSelected}
                                disabled={isPending || isDefault}
                                onCheckedChange={(checked) => {
                                  if (isDefault) return
                                  const currentIds = field.value || []
                                  const next = checked
                                    ? [...currentIds, cat.id]
                                    : currentIds.filter((id) => id !== cat.id)
                                  field.onChange(next)
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">{cat.name}</p>
                              </div>
                              {isDefault && (
                                <Badge variant="outline" className="text-[10px] shadow-none bg-background">
                                  Default
                                </Badge>
                              )}
                            </label>
                          )}
                        />
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {isPending
                ? isEditing ? "Saving..." : "Creating..."
                : isEditing ? "Save Changes" : "Create Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
