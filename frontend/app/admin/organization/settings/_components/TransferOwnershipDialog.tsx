"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAccountIcon,
  Alert01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
  Loading03Icon,
  Search01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { getOrganizationMembersAction, transferOwnershipAction } from "../_actions"
import { useRouter } from "next/navigation"
import { Spinner } from "@/components/ui/spinner"

interface TransferOwnershipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "selection" | "confirmation"

export function TransferOwnershipDialog({ open, onOpenChange }: TransferOwnershipDialogProps) {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>("selection")
  const [isPending, setIsPending] = React.useState(false)
  const [members, setMembers] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null)
  const [hasLoaded, setHasLoaded] = React.useState(false)

  // Fetch members when dialog opens
  React.useEffect(() => {
    if (open && !hasLoaded) {
      const fetchMembers = async () => {
        setIsPending(true)
        try {
          const res = await getOrganizationMembersAction()
          if (res.success) {
            setMembers(res.data || [])
            setHasLoaded(true)
          } else {
            toast.error("Failed to load organization members")
          }
        } catch (err) {
          toast.error("An error occurred while loading members")
        } finally {
          setIsPending(false)
        }
      }
      fetchMembers()
    }
  }, [open, hasLoaded])

  // Reset state when closed
  React.useEffect(() => {
    if (!open) {
      setStep("selection")
      setSelectedUser(null)
      setSearchQuery("")
    }
  }, [open])

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTransfer = async () => {
    if (!selectedUser) return
    setIsPending(true)
    try {
      const res = await transferOwnershipAction(selectedUser.id)
      if (res.success) {
        toast.success(`Ownership successfully transferred to ${selectedUser.name}`)
        onOpenChange(false)
        // Optionally redirect or refresh the page since permissions changed
        window.location.reload()
      } else {
        toast.error((res as any).error || "Failed to transfer ownership")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0 flex flex-col bg-card border-blue-500/10">
        <DialogHeader className="px-6 py-4 border-b bg-card gap-1">
          <DialogTitle className="text-xl font-bold">
            {step === "selection" ? "Select New Owner" : "Confirm Transfer"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {step === "selection"
              ? "Choose a member from your organization to take over ownership."
              : `You are about to transfer full control to ${selectedUser?.name}.`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-[300px] flex flex-col">
          {step === "selection" && (
            <div className="p-4 space-y-4 flex-1 flex flex-col">
              {members.length > 0 ? (
                <>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" className="pl-3">
                      <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                      placeholder="Search members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </InputGroup>

                  <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="space-y-2 pb-2">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((member) => (
                          <div
                            key={member.id}
                            className="w-full flex hover:cursor-pointer items-center gap-3 p-3 rounded-xl border bg-card hover:bg-blue-500/5 hover:border-blue-500/30 transition-all text-left group hover:cursor-pointer"
                            onClick={() => {
                              setSelectedUser(member)
                              setStep("confirmation")
                            }}
                          >
                            <Avatar className="h-9 w-9 border">
                              <AvatarImage src={member.image || ""} />
                              <AvatarFallback className="bg-blue-500/10 text-blue-600 font-bold text-xs uppercase">
                                {member.name?.charAt(0) || member.email?.charAt(0) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate group-hover:text-blue-600 transition-colors">
                                {member.name || "Anonymous Member"}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate italic">
                                {member.email}
                              </p>
                            </div>
                            <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 transition-all group-hover:translate-x-0.5" />
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center space-y-2">
                          <HugeiconsIcon icon={Search01Icon} className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                          <p className="text-sm text-muted-foreground">No matching members found.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </>
              ) : isPending ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                  <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm text-muted-foreground font-medium">Scanning members...</p>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6">
                  <Empty className="max-w-[280px]">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="bg-blue-500/10 text-blue-600">
                        <HugeiconsIcon icon={UserGroupIcon} />
                      </EmptyMedia>
                      <EmptyTitle className="text-base font-bold">Alone in Space?</EmptyTitle>
                      <EmptyDescription className="text-xs leading-relaxed w-md">
                        There are no other members in this organization. You must <strong className="text-blue-600">add members</strong> first before you can transfer ownership.
                      </EmptyDescription>
                    </EmptyHeader>
                    <div className="mt-4 w-full px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20"
                        onClick={() => {
                          onOpenChange(false)
                          router.push("/admin/organization/members")
                        }}
                      >
                        Add Members Now
                      </Button>
                    </div>
                  </Empty>
                </div>
              )}
            </div>
          )}

          {step === "confirmation" && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-blue-500/20 shadow-xl">
                    <AvatarImage src={selectedUser?.image || ""} />
                    <AvatarFallback className="bg-blue-500/10 text-blue-600 font-black text-2xl uppercase">
                      {selectedUser?.name?.charAt(0) || selectedUser?.email?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-lg">
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold">{selectedUser?.name}</h4>
                  <p className="text-sm text-muted-foreground italic font-medium">{selectedUser?.email}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />
                  Critical Handover
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-100/80 leading-relaxed font-medium">
                  By clicking confirm, you will transfer <strong className="font-bold">Ownership</strong> of this organization.
                  You will lose administrative control over high-level settings and organizational deletion.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t flex flex-row items-center justify-between gap-3">
          {step === "selection" ? (
            <Button onClick={() => onOpenChange(false)} disabled={isPending} variant="outline">
              Cancel
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setStep("selection")} disabled={isPending}>
              Back
            </Button>
          )}

          {step === "confirmation" && (
            <Button
              onClick={handleTransfer}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Spinner className="h-4 w-4" />
                  <span>Transferring...</span>
                </>
              ) : (
                "Confirm & Transfer"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
