"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldContent,
  FieldTitle
} from "@/components/ui/field"
import { RoleSchema, type RoleFormValues } from "@/lib/schemas/role"
import { createRole, updateRole } from "../_actions"

interface RoleDialogProps {
  children?: React.ReactNode
  electionId: string
  availableSystems: { id: string; name: string | null; hostName: string | null }[]
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id: string
    name: string
    order: number
    allowedSystems: { id: string }[]
  }
  nextSuggestedOrder: number
}

export function RoleDialog({
  children,
  electionId,
  availableSystems,
  open,
  onOpenChange,
  initialData,
  nextSuggestedOrder,
}: RoleDialogProps) {
  const [isPending, setIsPending] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setError,
    formState: { errors }
  } = useForm<RoleFormValues>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      order: initialData?.order ?? nextSuggestedOrder,
      allSystems: initialData ? initialData.allowedSystems.length === 0 : true,
      systemIds: initialData?.allowedSystems.map(s => s.id) ?? [],
    }
  })

  const allSystems = watch("allSystems")
  const selectedSystemIds = watch("systemIds")

  // Reset form when dialog opens/initialData changes
  React.useEffect(() => {
    if (open) {
      reset({
        name: initialData?.name ?? "",
        order: initialData?.order ?? nextSuggestedOrder,
        allSystems: initialData ? initialData.allowedSystems.length === 0 : true,
        systemIds: initialData?.allowedSystems.map(s => s.id) ?? [],
      })
      setServerError(null)
    }
  }, [open, initialData, nextSuggestedOrder, reset])

  const onSubmit = async (values: RoleFormValues) => {
    setIsPending(true)
    setServerError(null)

    try {
      const result = initialData
        ? await updateRole(initialData.id, electionId, values)
        : await createRole(electionId, values)

      if (result.success) {
        toast.success(`Role ${initialData ? "updated" : "created"} successfully!`)
        onOpenChange(false)
      } else {
        const errorMsg = result.error || "Something went wrong"

        // Handle field-specific errors
        if (errorMsg.includes("Priority order")) {
          setError("order", {
            type: "manual",
            message: errorMsg
          })
        } else if (errorMsg.toLowerCase().includes("name")) {
          setError("name", {
            type: "manual",
            message: errorMsg
          })
        } else {
          setServerError(errorMsg)
        }
      }
    } catch {
      setServerError("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  const isEdit = !!initialData

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 bg-card">
        <DialogHeader className="px-6 py-4 border-b bg-card">
          <DialogTitle className="font-bold text-xl tracking-tight">
            {isEdit ? "Edit Election Role" : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details and restrictions for this role."
              : "Define a new position for this election."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name">Role Name</FieldLabel>
                <Input
                  id="name"
                  placeholder="e.g., President"
                  disabled={isPending}
                  {...register("name")}
                />
                {errors.name && <FieldError errors={[{ message: errors.name.message }]} />}
              </Field>

              <Field>
                <FieldLabel htmlFor="order">Priority Order</FieldLabel>
                <Input
                  id="order"
                  type="number"
                  placeholder="1"
                  disabled={isPending}
                  {...register("order", { valueAsNumber: true })}
                />
                <FieldDescription>Determines the display order on the voting terminals.</FieldDescription>
                {errors.order && <FieldError errors={[{ message: errors.order.message }]} />}
              </Field>

              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between pl-1">
                  <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                    System Access
                  </p>
                </div>

                <div className="space-y-4">
                  <Field orientation="horizontal">
                    <Controller
                      name="allSystems"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          id="all-systems-toggle"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending}
                        />
                      )}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="all-systems-toggle">Allow for All Systems</FieldLabel>
                      <FieldDescription>This role will be available on all authorized terminals.</FieldDescription>
                    </FieldContent>
                  </Field>

                  {!allSystems && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-widest opacity-70">Specific Terminals</p>
                        <Badge variant="secondary" className="text-[10px] font-black">{selectedSystemIds.length} Selected</Badge>
                      </div>
                      <ScrollArea className="h-[200px] w-full pr-4">
                        <div className="space-y-2 pb-2">
                          {availableSystems.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No authorized systems found.</p>
                          ) : (
                            availableSystems.map((system) => {
                              const isSelected = selectedSystemIds.includes(system.id);
                              return (
                                <FieldLabel
                                  key={system.id}
                                  htmlFor={`sys-${system.id}`}
                                  className="cursor-pointer block border rounded-3xl transition-all hover:bg-muted/5 group data-[checked=true]:bg-primary/5 data-[checked=true]:border-primary/20"
                                  data-checked={isSelected}
                                >
                                  <Field orientation="horizontal" className="mb-0">
                                    <FieldContent>
                                      <FieldTitle className="text-sm">
                                        {system.name || "Unnamed System"}
                                      </FieldTitle>
                                      {system.hostName && (
                                        <FieldDescription className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground/50">
                                          {system.hostName}
                                        </FieldDescription>
                                      )}
                                    </FieldContent>
                                    <Controller
                                      name="systemIds"
                                      control={control}
                                      render={({ field }) => (
                                        <Checkbox
                                          id={`sys-${system.id}`}
                                          checked={isSelected}
                                          onCheckedChange={(checked) => {
                                            const nextValue = checked
                                              ? [...field.value, system.id]
                                              : field.value.filter(id => id !== system.id)
                                            field.onChange(nextValue)
                                          }}
                                          disabled={isPending}
                                        />
                                      )}
                                    />
                                  </Field>
                                </FieldLabel>
                              )
                            })
                          )}
                        </div>
                      </ScrollArea>
                      {errors.systemIds && <FieldError errors={[{ message: errors.systemIds.message as string }]} />}
                    </div>
                  )}
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

          <DialogFooter className="px-6 py-3 border-t bg-muted/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Role")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
