"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon, Exchange01Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Spinner } from "@/components/ui/spinner"

import { getOrganizationMembersAction, transferOwnershipAction } from "@/lib/actions/settings"

interface TransferOwnershipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferOwnershipDialog({
  open,
  onOpenChange,
}: TransferOwnershipDialogProps) {
  const router = useRouter()
  const [members, setMembers] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  
  // We need to store both MemberId and UserId
  const [selectedMemberVal, setSelectedMemberVal] = React.useState<string>("")

  // Fetch members when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedMemberVal("")
      setIsLoading(true)
      getOrganizationMembersAction().then((res) => {
        if (res.success && res.data) {
          setMembers(res.data)
        } else {
          toast.error(res.error || "Failed to load members")
        }
        setIsLoading(false)
      })
    }
  }, [open])

  const handleTransfer = async () => {
    if (!selectedMemberVal) return

    // The value is stored as "memberId|userId"
    const [memberId, userId] = selectedMemberVal.split("|")
    
    setIsSubmitting(true)
    try {
      const res = await transferOwnershipAction(memberId, userId)

      if (!res.success) {
        toast.error(res.error || "Failed to transfer ownership")
      } else {
        toast.success("Ownership transferred successfully")
        onOpenChange(false)
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Exchange01Icon} className="size-5" />
            Transfer Ownership
          </DialogTitle>
          <DialogDescription>
            Transfer full ownership of this organization to another member. 
            You will be demoted to an Org Admin.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert variant="destructive">
            <HugeiconsIcon icon={Alert01Icon} className="size-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This is a critical action. The new owner will have full control over the organization, including the ability to delete it or remove you.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="new-owner">Select New Owner</Label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-md bg-muted/30">
                <Spinner className="size-4" /> Loading members...
              </div>
            ) : members.length === 0 ? (
              <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/30">
                No other members found in the organization.
              </div>
            ) : (
              <Select value={selectedMemberVal} onValueChange={setSelectedMemberVal}>
                <SelectTrigger id="new-owner" className="w-full">
                  <SelectValue placeholder="Select a member..." />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem 
                      key={member.memberId} 
                      value={`${member.memberId}|${member.userId}`}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="size-5">
                          {member.image && <AvatarImage src={member.image} />}
                          <AvatarFallback className="text-[10px]">
                            {member.name?.substring(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                        <span className="text-muted-foreground ml-1">({member.email})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
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
          <Button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedMemberVal || isSubmitting}
          >
            {isSubmitting ? "Transferring..." : "Transfer Ownership"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
