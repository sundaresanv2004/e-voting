"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { InformationCircleIcon, Tick02Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

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
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { createRole, updateRole } from "../_actions"

interface RoleDialogProps {
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  electionId: string
  availableSystems: { id: string; name: string | null }[]
  nextSuggestedOrder?: number
  initialData?: {
    id: string
    name: string
    order: number
    allowedSystems: { id: string }[]
  }
}

export function RoleDialog({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  electionId,
  availableSystems,
  nextSuggestedOrder = 1,
  initialData
}: RoleDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen

  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [name, setName] = React.useState("")
  const [order, setOrder] = React.useState<number>(1)
  const [selectedSystemIds, setSelectedSystemIds] = React.useState<string[]>([])

  // Reset form when dialog opens/initialData changes
  React.useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "")
      setOrder(initialData?.order ?? nextSuggestedOrder)
      setSelectedSystemIds(initialData?.allowedSystems.map(s => s.id) ?? [])
      setError(null)
    }
  }, [open, initialData, nextSuggestedOrder])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    try {
      const result = initialData
        ? await updateRole(initialData.id, electionId, { name, order, systemIds: selectedSystemIds })
        : await createRole(electionId, { name, order, systemIds: selectedSystemIds })

      if (result.success) {
        toast.success(`Role ${initialData ? "updated" : "created"} successfully!`)
        setOpen(false)
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  const toggleSystem = (id: string) => {
    setSelectedSystemIds(prev =>
      prev.includes(id) ? prev.filter(sysId => sysId !== id) : [...prev, id]
    )
  }

  const isEdit = !!initialData

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden gap-0 bg-background max-h-[90vh] flex flex-col rounded-2xl">
        <DialogHeader className="px-6 py-6 border-b bg-muted/20">
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Edit Role" : "Create New Role"}
          </DialogTitle>
          <DialogDescription>
            Defines a position to be voted for in this election.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
            <div className="grid grid-cols-4 gap-4 items-end">
              <div className="col-span-3">
                <Field>
                  <FieldLabel htmlFor="name">Role Name</FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Head Boy"
                    required
                    disabled={isPending}
                  />
                </Field>
              </div>
              <div className="col-span-1">
                <Field>
                  <FieldLabel htmlFor="order">Order</FieldLabel>
                  <Input
                    id="order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    disabled={isPending}
                    min={1}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between pl-1">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest pl-1 opacity-60">
                  System Restrictions
                </p>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                  {selectedSystemIds.length === 0 ? "Available everywhere" : `${selectedSystemIds.length} Restricted`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground px-1 pb-1">
                Optionally select specific systems where this role should be displayed. If none selected, it will show on all systems.
              </p>
              <ScrollArea className="h-40 w-full rounded-2xl border bg-muted/5 p-4 shadow-inner">
                <div className="space-y-3">
                  {availableSystems.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">No authorized systems found for this organization.</p>
                  ) : (
                    availableSystems.map((system) => (
                      <div key={system.id} className="flex items-center space-x-2 group cursor-pointer" onClick={() => toggleSystem(system.id)}>
                        <Checkbox
                          id={system.id}
                          checked={selectedSystemIds.includes(system.id)}
                          onCheckedChange={() => toggleSystem(system.id)}
                          disabled={isPending}
                        />
                        <label
                          htmlFor={system.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 group-hover:text-primary transition-colors cursor-pointer"
                        >
                          {system.name || "Unnamed System"}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
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
              disabled={isPending || !name.trim()}
            >
              {isPending ? "Saving..." : (isEdit ? "Save Changes" : "Create Role")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
