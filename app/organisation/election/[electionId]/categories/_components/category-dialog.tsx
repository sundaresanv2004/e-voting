"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Shield02Icon } from "@hugeicons/core-free-icons"

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

import { CategorySchema, type CategoryFormValues } from "@/lib/schemas/category"
import { createCategory, updateCategory } from "@/lib/actions/category"

type RoleOption = { id: string; name: string; order: number }

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  electionId: string
  allRoles: RoleOption[]
  category?: {
    id: string
    name: string
    roles: { id: string }[]
  }
}

export function CategoryDialog({
  open,
  onOpenChange,
  electionId,
  allRoles,
  category,
}: CategoryDialogProps) {
  const router = useRouter()
  const isEditing = !!category
  const [isPending, setIsPending] = React.useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      roleIds: [],
    },
  })

  const selectedRoleIds = watch("roleIds")

  React.useEffect(() => {
    if (open) {
      reset({
        name: category?.name ?? "",
        roleIds: category?.roles.map((r) => r.id) ?? [],
      })
    }
  }, [open, category, reset])

  const onSubmit = async (data: CategoryFormValues) => {
    setIsPending(true)
    try {
      const res = isEditing
        ? await updateCategory(category.id, electionId, data)
        : await createCategory(electionId, data)

      if (!res.success) {
        const msg = res.error || "Something went wrong"
        if (msg.toLowerCase().includes("name")) {
          setError("name", { type: "manual", message: msg })
        } else {
          toast.error(msg)
        }
        return
      }

      toast.success(isEditing ? "Category updated successfully" : "Category created successfully")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  // Sort roles by order for display
  const sortedRoles = [...allRoles].sort((a, b) => a.order - b.order)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 py-5">
          <DialogTitle className="font-heading">
            {isEditing ? "Edit Category" : "Create Category"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the name and role assignments for this category."
              : "Create a custom category and select which roles it includes."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-5">
            <Field data-invalid={!!errors.name}>
              <FieldLabel>Category Name</FieldLabel>
              <FieldContent>
                <Input
                  placeholder="e.g. House A, Block 1"
                  disabled={isPending}
                  {...register("name")}
                />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </FieldContent>
            </Field>

            {/* Role selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                  Included Roles
                </p>
                <Badge variant="secondary" className="text-[10px] font-black shadow-none">
                  {selectedRoleIds.length} Selected
                </Badge>
              </div>
              <FieldDescription>
                Select which election roles will appear for voters who use this category code.
              </FieldDescription>

              {allRoles.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-8 px-4 text-center">
                  <HugeiconsIcon icon={Shield02Icon} className="size-8 mb-2 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground">
                    No roles exist yet. Create roles first before assigning them to categories.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[220px] pr-1">
                  <div className="space-y-2 pb-2">
                    {sortedRoles.map((role) => {
                      const isSelected = selectedRoleIds.includes(role.id)
                      return (
                        <Controller
                          key={role.id}
                          name="roleIds"
                          control={control}
                          render={({ field }) => (
                            <label
                              htmlFor={`role-${role.id}`}
                              className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                                isSelected ? "bg-primary/5 border-primary/20" : ""
                              }`}
                            >
                              <Checkbox
                                id={`role-${role.id}`}
                                checked={isSelected}
                                disabled={isPending}
                                onCheckedChange={(checked) => {
                                  const next = checked
                                    ? [...field.value, role.id]
                                    : field.value.filter((id) => id !== role.id)
                                  field.onChange(next)
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-tight">{role.name}</p>
                              </div>
                              <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                                #{role.order}
                              </code>
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
                : isEditing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
