"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  UserAdd01Icon,
  Alert01Icon,
  InformationCircleIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  HelpCircleIcon,
  Loading03Icon
} from "@hugeicons/core-free-icons"
import { UserRole } from "@prisma/client"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldLabel, FieldDescription, FieldError, FieldContent, FieldTitle } from "@/components/ui/field"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { searchPotentialMember, addMemberAction, getElectionsForAssignment } from "../_actions"

interface AddMemberDialogProps {
  children?: React.ReactNode
}

type Step = "selection" | "permissions"

export function AddMemberDialog({ children }: AddMemberDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<Step>("selection")
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Search State
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<any[]>([])
  const [searchStatus, setSearchStatus] = React.useState<string | null>(null)

  // Debounce search
  React.useEffect(() => {
    if (!query || query.trim().length < 3) {
      setResults([])
      setSearchStatus(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsPending(true)
      setError(null)
      try {
        const res = await searchPotentialMember(query)
        if (res.success) {
          setResults(res.results || [])
          setSearchStatus(res.status || "found")
        } else {
          setError(res.error || "Search failed")
        }
      } catch (err) {
        setError("An error occurred during search")
      } finally {
        setIsPending(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // Selection/Permissions State
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null)
  const [role, setRole] = React.useState<UserRole>(UserRole.STAFF)
  const [hasAllAccess, setHasAllAccess] = React.useState(true)
  const [selectedElectionIds, setSelectedElectionIds] = React.useState<string[]>([])
  const [availableElections, setAvailableElections] = React.useState<any[]>([])

  // Reset when dialog closes
  React.useEffect(() => {
    if (!open) {
      setStep("selection")
      setQuery("")
      setResults([])
      setSearchStatus(null)
      setSelectedUser(null)
      setRole(UserRole.STAFF)
      setHasAllAccess(true)
      setSelectedElectionIds([])
      setError(null)
    }
  }, [open])


  const handleLoadPermissions = async (user: any) => {
    setSelectedUser(user)
    setIsPending(true)
    try {
      const elections = await getElectionsForAssignment()
      setAvailableElections(elections)
      setStep("permissions")
    } catch (err) {
      toast.error("Failed to load elections list")
    } finally {
      setIsPending(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedUser) return
    setIsPending(true)
    setError(null)

    try {
      const res = await addMemberAction(
        selectedUser.id,
        role,
        hasAllAccess,
        selectedElectionIds
      )

      if (res.success) {
        toast.success(`Successfully added ${selectedUser.name} to organization`)
        setOpen(false)
      } else {
        setError(res.error || "Failed to add member")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button><HugeiconsIcon icon={UserAdd01Icon} className="h-4 w-4" /> Add Member</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden gap-0 max-h-[95vh] flex flex-col bg-card">
        <DialogHeader className="px-6 py-4 border-b bg-card gap-1 overflow-hidden relative">
          <DialogTitle className="font-semibold text-xl tracking-tight">
            {step === "selection" && "Find New Member"}
            {step === "permissions" && "Configure Access"}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground/80">
            {step === "selection" && "Search for existing users by email or name to add them."}
            {step === "permissions" && `Adding ${selectedUser?.name} to organization.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {step === "selection" && (
            <div
              key="selection"
              className="px-8 py-6 space-y-6"
            >
              <div className="space-y-6">
                <Field>
                  <FieldLabel htmlFor="search">Search User</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" className="pl-4">
                      <HugeiconsIcon
                        icon={Search01Icon}
                        className="h-5 w-5 text-muted-foreground group-focus-within/input-group:text-primary dark:group-focus-within/input-group:text-blue-600 transition-colors"
                      />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="search"
                      placeholder="e.g., john@gmail.com"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="text-base h-full"
                      autoFocus
                    />
                    {isPending && (
                      <InputGroupAddon align="inline-end" className="pr-4">
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          className="h-5 w-5 text-primary dark:text-blue-600 animate-spin"
                        />
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                </Field>

                {error && (
                  <FieldError className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 text-destructive border border-destructive/10">
                    <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </FieldError>
                )}

                <div className="relative">
                  {query.length >= 3 && searchStatus === "not_found" && (
                    <Empty className="p-8 rounded-[2rem] border-dashed bg-muted/5">
                      <EmptyHeader>
                        <EmptyMedia variant="icon" className="bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <HugeiconsIcon icon={HelpCircleIcon} />
                        </EmptyMedia>
                        <EmptyTitle className="text-sm font-bold">Account Not Found</EmptyTitle>
                        <EmptyDescription className="text-xs">
                          This user must create an account on E-Voting first.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>)}

                  {results.length > 0 && (
                    <div
                      key="results"
                      className="space-y-4"
                    >
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 pl-1">
                        Found Users
                      </p>
                      <ScrollArea className="max-h-[300px] -mx-4 px-4 pr-6">
                        <div className="space-y-3 pb-4">
                          {isPending && results.length === 0 && (
                            <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="p-4 rounded-[1.5rem] border bg-muted/5 animate-pulse flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-muted shadow-sm" />
                                  <div className="flex-1 space-y-2">
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-3 w-32 bg-muted rounded opacity-60" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {results.map((user) => (
                            <div
                              key={user.id}
                              className={`p-4 rounded-2xl border transition-all ${user.status === 'available'
                                ? ' hover:bg-primary/5 hover:border-primary/30 cursor-pointer'
                                : 'bg-muted/20 opacity-80 cursor-not-allowed'
                                }`}
                              onClick={() => user.status === 'available' && handleLoadPermissions(user)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border">
                                  <AvatarImage src={user.image || ""} />
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                    {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-sm truncate">{user.name || "Anonymous"}</h4>
                                    {user.status === 'available' && (
                                      <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-[8px] py-0 px-1 font-bold uppercase tracking-tighter h-4">Ready</Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                                </div>
                                {user.status === 'available' && (
                                  <div className="h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-blue-600 shadow-inner">
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                                  </div>
                                )}
                              </div>

                              {user.status === 'in_another_org' && (
                                <div className="mt-3 flex gap-2 text-[10px] text-amber-700 font-medium">
                                  <HugeiconsIcon icon={Alert01Icon} className="h-3 w-3 shrink-0" />
                                  <p>Already in <strong>{user.currentOrgName}</strong>. They must leave to join yours.</p>
                                </div>
                              )}

                              {user.status === 'already_in_org' && (
                                <div className="mt-3 flex gap-2 items-center text-xs text-blue-700 font-medium">
                                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" />
                                  <p>This user is already part of your organization.</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "permissions" && (
            <div
              key="permissions"
              className="flex-1 overflow-y-auto p-8 space-y-6"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border">
                  <Avatar className="h-12 w-12 border-2 border">
                    <AvatarImage src={selectedUser?.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {selectedUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base truncate">{selectedUser?.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{selectedUser?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => setStep("selection")}
                  >
                    Change
                  </Button>
                </div>

                <div className="flex flex-col gap-6">
                  <Field>
                    <FieldLabel>Organizational Role</FieldLabel>
                    <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={isPending}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.STAFF}>Organization Staff</SelectItem>
                        <SelectItem value={UserRole.VIEWER}>Organization Viewer</SelectItem>
                        <SelectItem value={UserRole.ORG_ADMIN}>Organization Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field orientation="horizontal">
                    <Checkbox
                      id="all-access"
                      checked={hasAllAccess}
                      onCheckedChange={(c) => setHasAllAccess(!!c)}
                      disabled={role === UserRole.ORG_ADMIN || isPending}
                    />
                    <FieldContent>
                      <FieldLabel htmlFor="all-access">Include All Elections</FieldLabel>
                      <FieldDescription>Grant access to all current and future elections.</FieldDescription>
                    </FieldContent>
                  </Field>
                </div>

                {!hasAllAccess && role !== UserRole.ORG_ADMIN && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pl-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest opacity-60">
                        Specific Assignments
                      </p>
                      <Badge variant="secondary" className="text-[10px] font-semibold">{selectedElectionIds.length} Selected</Badge>
                    </div>
                    <ScrollArea className="h-[180px] w-full">
                      <div className="space-y-3">
                        {availableElections.length === 0 ? (
                          <p className="text-sm text-muted-foreground italic text-center py-8">No elections found to assign.</p>
                        ) : (
                          availableElections.map((election) => {
                            const isSelected = selectedElectionIds.includes(election.id);
                            return (
                              <FieldLabel
                                key={election.id}
                                htmlFor={election.id}
                                className="cursor-pointer"
                                data-checked={isSelected}
                              >
                                <Field orientation="horizontal">
                                  <FieldContent>
                                    <FieldTitle className="text-sm font-bold">
                                      {election.name}
                                    </FieldTitle>
                                    <FieldDescription className="text-[10px] uppercase tracking-wider font-bold">
                                      {election.status}
                                    </FieldDescription>
                                  </FieldContent>
                                  <Checkbox
                                    id={election.id}
                                    checked={isSelected}
                                    onCheckedChange={() => {
                                      setSelectedElectionIds(prev =>
                                        prev.includes(election.id)
                                          ? prev.filter(id => id !== election.id)
                                          : [...prev, election.id]
                                      )
                                    }}
                                  />
                                </Field>
                              </FieldLabel>
                            )
                          })
                        )}
                      </div>
                    </ScrollArea>
                    <p className="text-[11px] text-muted-foreground pl-1">
                      Invitations will be sent for each assigned election.
                    </p>
                  </div>
                )}

                {error && (
                  <FieldError className="flex items-start gap-3 p-4 rounded-2xl bg-destructive/5 text-destructive border border-destructive/10">
                    <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 shrink-0" />
                    <span className="font-medium text-xs">{error}</span>
                  </FieldError>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-3 border-t flex flex-row items-center justify-between gap-3">
          {step === "permissions" ? (
            <>
              <Button variant="outline" onClick={() => setStep("selection")} disabled={isPending}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || (!hasAllAccess && selectedElectionIds.length === 0 && role !== UserRole.ORG_ADMIN)}
              >
                {isPending ? "Configuring..." : "Add to Organization"}
              </Button>
            </>
          ) : (
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setOpen(false)} disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
