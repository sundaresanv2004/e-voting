"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field"
import { updateMemberAccess } from "@/lib/actions/member"

const EditMemberSchema = z.object({
  role: z.enum(["org_admin", "staff", "viewer"]),
  hasAllAccess: z.boolean(),
  // For MVP, we'll keep electionIds empty if they have all access, 
  // or a list if we implemented a multi-select component.
  // We'll skip the multi-select UI here for simplicity unless requested.
})

type EditMemberFormValues = z.infer<typeof EditMemberSchema>

interface EditMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: any // The Member object including nested user data
}

export function EditMemberDialog({ open, onOpenChange, member }: EditMemberDialogProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<EditMemberFormValues>({
    resolver: zodResolver(EditMemberSchema),
    defaultValues: {
      role: "viewer",
      hasAllAccess: false,
    },
  })

  const roleValue = watch("role")
  const hasAllAccess = watch("hasAllAccess")

  React.useEffect(() => {
    if (open && member) {
      reset({
        role: member.customRole as any || "viewer",
        hasAllAccess: member.user?.hasAllElectionsAccess || false,
      })
    }
  }, [open, member, reset])

  const onSubmit = async (data: EditMemberFormValues) => {
    setIsPending(true)
    try {
      // Update both custom role/access and Better Auth role via server action
      const accessRes = await updateMemberAccess(
        member.userId,
        data.role,
        data.hasAllAccess, 
        [] // Pass election IDs if granular UI was implemented
      )

      if (!accessRes.success) {
        toast.error(accessRes.error || "Failed to update member")
      } else {
        toast.success("Member updated successfully")
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>
            Update role and permissions for {member?.user?.name || member?.user?.email}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <Field data-invalid={!!errors.role}>
            <FieldLabel>Organization Role</FieldLabel>
            <FieldContent>
              <Select
                value={roleValue}
                onValueChange={(val: any) => setValue("role", val, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="org_admin">Org Admin (Full Access)</SelectItem>
                  <SelectItem value="staff">Staff (Limited Access)</SelectItem>
                  <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <FieldError>{errors.role.message}</FieldError>}
            </FieldContent>
          </Field>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
            <div className="space-y-0.5">
              <Label className="text-base">Full Election Access</Label>
              <p className="text-sm text-muted-foreground">
                Grant access to all current and future elections.
              </p>
            </div>
            <Controller
              control={control}
              name="hasAllAccess"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={roleValue === "org_admin"}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
