"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Alert01Icon, CheckmarkCircle01Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { searchPotentialMember, addMemberAction } from "@/lib/actions/member"

// Types
const AddMemberSchema = z.object({
  role: z.enum(["org_admin", "staff", "viewer"]),
  hasAllAccess: z.boolean(),
  // For MVP we won't strictly enforce electionIds via zod until a full multi-select is implemented,
  // but we provide the array for future use.
  electionIds: z.array(z.string()),
})

type AddMemberFormValues = z.infer<typeof AddMemberSchema>

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({ open, onOpenChange }: AddMemberDialogProps) {
  const router = useRouter()
  
  // Search State
  const [search, setSearch] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [searchStatus, setSearchStatus] = React.useState<"idle" | "not_found" | "error" | "success">("idle")
  
  // Selected User State
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<AddMemberFormValues>({
    resolver: zodResolver(AddMemberSchema),
    defaultValues: {
      role: "viewer",
      hasAllAccess: false,
      electionIds: [],
    },
  })

  const roleValue = watch("role")
  const hasAllAccess = watch("hasAllAccess")

  // Reset dialog on open/close
  React.useEffect(() => {
    if (!open) {
      setSearch("")
      setSearchResults([])
      setSearchStatus("idle")
      setSelectedUser(null)
      reset()
    }
  }, [open, reset])

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length < 3) {
        setSearchResults([])
        setSearchStatus("idle")
        return
      }
      
      setIsSearching(true)
      const res = await searchPotentialMember(search)
      
      if (!res.success) {
        setSearchStatus("error")
        setSearchResults([])
      } else if (res.status === "not_found" || !res.results || res.results.length === 0) {
        setSearchStatus("not_found")
        setSearchResults([])
      } else {
        setSearchStatus("success")
        setSearchResults(res.results)
      }
      setIsSearching(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const onSubmit = async (data: AddMemberFormValues) => {
    if (!selectedUser) return
    
    setIsSubmitting(true)
    try {
      const res = await addMemberAction(
        selectedUser.id,
        data.role,
        data.hasAllAccess,
        data.electionIds
      )
      
      if (!res.success) {
        toast.error(res.error || "Failed to add member")
      } else {
        toast.success(`${selectedUser.name} added to organization`)
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Effect to automatically force all access if org_admin
  React.useEffect(() => {
    if (roleValue === "org_admin" && !hasAllAccess) {
      setValue("hasAllAccess", true)
    }
  }, [roleValue, hasAllAccess, setValue])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Search for an existing user to add to your organization.
          </DialogDescription>
        </DialogHeader>

        {!selectedUser ? (
          <div className="space-y-4 py-4">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name or email (min 3 chars)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {isSearching && <div className="text-sm text-center text-muted-foreground py-4">Searching...</div>}
            
            {!isSearching && searchStatus === "not_found" && (
              <div className="text-sm text-center text-muted-foreground py-4">No users found.</div>
            )}

            {!isSearching && searchStatus === "success" && (
              <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-2">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    className="flex items-center gap-3 p-3 text-left border rounded-lg hover:border-primary transition-colors disabled:opacity-50 disabled:hover:border-border"
                    disabled={user.status !== "available"}
                    onClick={() => setSelectedUser(user)}
                  >
                    <Avatar className="size-10">
                      {user.image && <AvatarImage src={user.image} />}
                      <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-sm">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                    <div>
                      {user.status === "available" && <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">Available</Badge>}
                      {user.status === "already_in_org" && <Badge variant="secondary">Already in Org</Badge>}
                      {user.status === "in_another_org" && <Badge variant="destructive">In Another Org</Badge>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Show an info alert if a user was in another org */}
            {!isSearching && searchStatus === "success" && searchResults.some(u => u.status === "in_another_org") && (
              <Alert variant="destructive" className="mt-4">
                <HugeiconsIcon icon={Alert01Icon} className="size-4" />
                <AlertTitle>Organization Conflict</AlertTitle>
                <AlertDescription>
                  Users marked as "In Another Org" must leave their current organization before they can join yours.
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
              <Avatar className="size-10">
                {selectedUser.image && <AvatarImage src={selectedUser.image} />}
                <AvatarFallback>{selectedUser.name?.substring(0, 2).toUpperCase() || "?"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <span className="font-medium text-sm">{selectedUser.name}</span>
                <span className="text-xs text-muted-foreground">{selectedUser.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} type="button">
                Change
              </Button>
            </div>

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
                    disabled={roleValue === "org_admin"} // Org admins always get full access
                  />
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
