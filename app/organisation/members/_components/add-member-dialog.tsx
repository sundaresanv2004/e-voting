"use client"

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  Alert01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  HelpCircleIcon,
  Loading03Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
  FieldContent,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"

import {
  MemberPermissionsSchema,
  type MemberPermissionsValues,
} from "@/lib/schemas/member"
import {
  searchPotentialMember,
  addMemberAction,
  getElectionsForAssignment,
} from "@/lib/actions/member"

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "selection" | "permissions"

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AddMemberDialog({ open, onOpenChange }: AddMemberDialogProps) {
  const router = useRouter()

  // ── Step ──────────────────────────────────────────────────────────────────────
  const [step, setStep] = React.useState<Step>("selection")

  // ── Search ────────────────────────────────────────────────────────────────────
  const [query, setQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [searchStatus, setSearchStatus] = React.useState<
    "idle" | "not_found" | "error" | "success"
  >("idle")
  const [searchError, setSearchError] = React.useState<string | null>(null)

  // ── Selected User ─────────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null)

  // ── Elections ─────────────────────────────────────────────────────────────────
  const [availableElections, setAvailableElections] = React.useState<any[]>([])
  const [isLoadingElections, setIsLoadingElections] = React.useState(false)

  // ── Form ──────────────────────────────────────────────────────────────────────
  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<MemberPermissionsValues>({
    resolver: zodResolver(MemberPermissionsSchema),
    defaultValues: {
      role: "viewer",
      hasAllAccess: false,
      electionIds: [],
    },
  })

  const roleValue = watch("role")
  const hasAllAccess = watch("hasAllAccess")
  const electionIds = watch("electionIds")

  // ── Auto full access for org_admin ────────────────────────────────────────────
  React.useEffect(() => {
    if (roleValue === "org_admin" && !hasAllAccess) {
      setValue("hasAllAccess", true, { shouldValidate: true })
      setValue("electionIds", [], { shouldValidate: true })
    }
  }, [roleValue, hasAllAccess, setValue])

  // ── Reset on close ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!open) {
      setStep("selection")
      setQuery("")
      setSearchResults([])
      setSearchStatus("idle")
      setSearchError(null)
      setSelectedUser(null)
      setAvailableElections([])
      reset()
    }
  }, [open, reset])

  // ── Debounced Search ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!query || query.trim().length < 3) {
      setSearchResults([])
      setSearchStatus("idle")
      setSearchError(null)
      return
    }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      setSearchError(null)
      try {
        const res = await searchPotentialMember(query)
        if (!res.success) {
          setSearchStatus("error")
          setSearchError(res.error || "Search failed")
          setSearchResults([])
        } else if (res.status === "not_found" || !res.results?.length) {
          setSearchStatus("not_found")
          setSearchResults([])
        } else {
          setSearchStatus("success")
          setSearchResults(res.results)
        }
      } catch {
        setSearchStatus("error")
        setSearchError("An error occurred during search")
      } finally {
        setIsSearching(false)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  // ── Select user → load elections → go to step 2 ───────────────────────────────
  const handleSelectUser = async (user: any) => {
    setSelectedUser(user)
    setIsLoadingElections(true)
    try {
      const res = await getElectionsForAssignment()
      setAvailableElections(res.elections || [])
    } catch {
      toast.error("Failed to load elections list")
    } finally {
      setIsLoadingElections(false)
      setStep("permissions")
    }
  }

  // ── Toggle election ───────────────────────────────────────────────────────────
  const toggleElection = (electionId: string) => {
    const current = electionIds
    const updated = current.includes(electionId)
      ? current.filter((id) => id !== electionId)
      : [...current, electionId]
    setValue("electionIds", updated, { shouldValidate: true })
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  const onSubmit = async (data: MemberPermissionsValues) => {
    if (!selectedUser) return
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
    } catch {
      toast.error("An unexpected error occurred")
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[520px] p-0 overflow-hidden gap-0 flex flex-col max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header — no bottom border */}
        <DialogHeader className="px-6 py-5">
          <DialogTitle className="font-heading text-xl">
            {step === "selection" ? "Find New Member" : "Configure Access"}
          </DialogTitle>
          <DialogDescription>
            {step === "selection"
              ? "Search for existing users by email or name."
              : `Setting up permissions for ${selectedUser?.name}.`}
          </DialogDescription>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {/* ─── Step 1: Selection ──────────────────────────────────────────── */}
          {step === "selection" && (
            <div className="px-6 pb-6 flex flex-col gap-5">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="search-member">Search User</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <HugeiconsIcon
                        icon={Search01Icon}
                        className="text-muted-foreground group-focus-within/input-group:text-primary transition-colors"
                      />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="search-member"
                      placeholder="Enter name or full email address..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      autoFocus
                    />
                    {isSearching && (
                      <InputGroupAddon align="inline-end">
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          className="animate-spin text-primary"
                        />
                      </InputGroupAddon>
                    )}
                    {query && !isSearching && (
                      <InputGroupAddon align="inline-end">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setQuery("")
                            setSearchResults([])
                            setSearchStatus("idle")
                          }}
                          type="button"
                          aria-label="Clear search"
                        >
                          <HugeiconsIcon icon={Delete02Icon} />
                        </Button>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                  {searchError && <FieldError>{searchError}</FieldError>}
                </Field>
              </FieldGroup>

              {/* Results */}
              <div>
                {!isSearching && searchStatus === "idle" && !query && (
                  <Empty className="border-dashed py-10">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={Search01Icon} />
                      </EmptyMedia>
                      <EmptyTitle>Search to add members</EmptyTitle>
                      <EmptyDescription>
                        Type at least 3 characters to find users.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}

                {!isSearching && searchStatus === "not_found" && (
                  <Empty className="border-dashed py-10 border-amber-500/20">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="bg-amber-500/10 text-amber-600">
                        <HugeiconsIcon icon={HelpCircleIcon} />
                      </EmptyMedia>
                      <EmptyTitle>User Not Found</EmptyTitle>
                      <EmptyDescription>
                        No registered user matches &ldquo;{query}&rdquo;. They must
                        register first, or use their full email address.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}

                {!isSearching && searchStatus === "success" && searchResults.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">
                      Found Users
                    </p>
                    <ScrollArea className="max-h-[280px]">
                      <div className="flex flex-col gap-2.5 pb-1 pr-3">
                        {searchResults.map((user) => {
                          const isAvailable = user.status === "available"
                          return (
                            <button
                              key={user.id}
                              type="button"
                              disabled={!isAvailable}
                              onClick={() => isAvailable && handleSelectUser(user)}
                              className="group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 enabled:hover:border-primary/40 enabled:hover:bg-primary/5"
                            >
                              <Avatar className="size-10 border">
                                {user.image && <AvatarImage src={user.image} />}
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                  {user.name?.charAt(0)?.toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm truncate">
                                    {user.name || "Anonymous"}
                                  </span>
                                  {isAvailable && (
                                    <Badge
                                      variant="successOutline"
                                      className="text-[9px] py-0 px-1.5 h-4 font-bold uppercase tracking-tight"
                                    >
                                      Ready
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {user.email}
                                </p>
                                {user.status === "in_another_org" && (
                                  <p className="flex items-center gap-1 text-[11px] text-amber-600 font-medium mt-1.5">
                                    <HugeiconsIcon icon={Alert01Icon} className="size-3 shrink-0" />
                                    Already in another organization
                                  </p>
                                )}
                                {user.status === "already_in_org" && (
                                  <p className="flex items-center gap-1 text-[11px] text-blue-600 font-medium mt-1.5">
                                    <HugeiconsIcon
                                      icon={CheckmarkCircle02Icon}
                                      className="size-3 shrink-0"
                                    />
                                    Already in your organization
                                  </p>
                                )}
                              </div>
                              {isAvailable && (
                                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary/20 transition-colors">
                                  <HugeiconsIcon icon={ArrowRight01Icon} />
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Step 2: Permissions ─────────────────────────────────────────── */}
          {step === "permissions" && (
            <ScrollArea className="flex-1 max-h-[calc(90vh-140px)]">
              <form
                id="add-member-form"
                onSubmit={handleSubmit(onSubmit)}
                className="px-6 pb-6 flex flex-col gap-6"
              >
                {/* Selected user card */}
                <div className="flex items-center gap-3 rounded-2xl border bg-muted/40 px-4 py-3">
                  <Avatar className="size-10 border">
                    {selectedUser?.image && <AvatarImage src={selectedUser.image} />}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {selectedUser?.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{selectedUser?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedUser?.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setStep("selection")}
                  >
                    Change
                  </Button>
                </div>

                {/* Role */}
                <FieldGroup>
                  <Field data-invalid={!!errors.role}>
                    <FieldLabel>Organization Role</FieldLabel>
                    <FieldContent>
                      <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger className="w-full rounded-2xl">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Roles</SelectLabel>
                                <SelectItem value="org_admin">
                                  Org Admin (Full Access)
                                </SelectItem>
                                <SelectItem value="staff">Staff (Limited Access)</SelectItem>
                                <SelectItem value="viewer">Viewer (Read Only)</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.role && <FieldError>{errors.role.message}</FieldError>}
                    </FieldContent>
                  </Field>
                </FieldGroup>

                <Separator />

                {/* Full access */}
                <FieldGroup>
                  <Field orientation="horizontal">
                    <Controller
                      control={control}
                      name="hasAllAccess"
                      render={({ field }) => (
                        <Checkbox
                          id="has-all-access"
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(!!checked)
                            if (checked) {
                              setValue("electionIds", [], { shouldValidate: true })
                            }
                          }}
                          disabled={roleValue === "org_admin" || isSubmitting}
                        />
                      )}
                    />
                    <FieldContent>
                      <FieldTitle>
                        <label
                          htmlFor="has-all-access"
                          className="cursor-pointer font-medium text-sm"
                        >
                          Include All Elections
                        </label>
                      </FieldTitle>
                      <FieldDescription>
                        Grant access to all current and future elections.
                      </FieldDescription>
                    </FieldContent>
                  </Field>
                </FieldGroup>

                {/* Per-election selection */}
                {!hasAllAccess && roleValue !== "org_admin" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                        Specific Elections
                      </p>
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {electionIds.length} selected
                      </Badge>
                    </div>

                    {isLoadingElections ? (
                      <div className="flex flex-col gap-2.5">
                        {[1, 2, 3].map((i) => (
                          <Skeleton key={i} className="h-[58px] w-full rounded-2xl" />
                        ))}
                      </div>
                    ) : availableElections.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center italic py-6">
                        No elections found to assign.
                      </p>
                    ) : (
                      <ScrollArea className="max-h-[200px]">
                        <FieldGroup className="gap-2 pr-3">
                          {availableElections.map((election) => {
                            const isSelected = electionIds.includes(election.id)
                            return (
                              <FieldLabel
                                key={election.id}
                                htmlFor={`election-${election.id}`}
                                className="cursor-pointer"
                                data-checked={isSelected}
                              >
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle className="text-sm">
                                      {election.name}
                                    </FieldTitle>
                                    <FieldDescription className="text-[10px] uppercase tracking-wider font-semibold">
                                      {election.status}
                                    </FieldDescription>
                                  </FieldContent>
                                  <Checkbox
                                    id={`election-${election.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => toggleElection(election.id)}
                                    disabled={isSubmitting}
                                  />
                                </Field>
                              </FieldLabel>
                            )
                          })}
                        </FieldGroup>
                      </ScrollArea>
                    )}

                    {errors.electionIds && (
                      <FieldError>{errors.electionIds.message}</FieldError>
                    )}
                  </div>
                )}
              </form>
            </ScrollArea>
          )}
        </div>

        {/* Footer — no top border */}
        <DialogFooter className="px-6 py-4">
          {step === "selection" ? (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          ) : (
            <div className="flex w-full items-center justify-between gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setStep("selection")}
                disabled={isSubmitting}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
                Back
              </Button>
              <Button
                type="submit"
                form="add-member-form"
                disabled={isSubmitting}
              >
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {isSubmitting ? "Adding..." : "Add to Organization"}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
