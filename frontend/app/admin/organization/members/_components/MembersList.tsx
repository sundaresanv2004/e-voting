"use client"

import * as React from "react"
import { ElectionDataTable } from "../../elections/_components/data-table"
import { columns, type Member } from "./columns"
import { removeMemberAction } from "../_actions"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { MemberDetailsSheet } from "./member-details-sheet"
import { 
  Alert01Icon, 
  Delete02Icon,
  InformationCircleIcon
} from "@hugeicons/core-free-icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface MembersListProps {
  initialMembers: Member[]
  orgCreatorId?: string
}

export function MembersList({ initialMembers, orgCreatorId }: MembersListProps) {
  const [members, setMembers] = React.useState(initialMembers)
  const [memberToRemove, setMemberToRemove] = React.useState<Member | null>(null)
  const [isRemovePending, setIsRemovePending] = React.useState(false)
  const [selectedMemberForView, setSelectedMemberForView] = React.useState<Member | null>(null)
  const [isViewSheetOpen, setIsViewSheetOpen] = React.useState(false)

  // Update local state when initialMembers change (e.g. on revalidate)
  React.useEffect(() => {
    setMembers(initialMembers)
  }, [initialMembers])

  const handleRemove = async () => {
    if (!memberToRemove) return
    
    setIsRemovePending(true)
    try {
      const res = await removeMemberAction(memberToRemove.id)
      if (res.success) {
        toast.success(`Removed ${memberToRemove.name || memberToRemove.email} from organization`)
        setMembers(prev => prev.filter(m => m.id !== memberToRemove.id))
        setMemberToRemove(null)
      } else {
        toast.error(res.error || "Failed to remove member")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsRemovePending(false)
    }
  }

  const handleEdit = (member: Member) => {
    // Currently, we just show a toast as "Add Member" can be used to re-invite/modify if we wanted
    // But for now, we'll just indicate it's coming or use the simple approach.
    toast.info("Access modification can be done by re-adding the user with new settings.")
  }

  const handleView = (member: Member) => {
    setSelectedMemberForView(member)
    setIsViewSheetOpen(true)
  }

  return (
    <div className="space-y-4">
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card/30 rounded-[2.5rem] border border-dashed border-muted-foreground/20 space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-muted/50 flex items-center justify-center text-muted-foreground">
             <HugeiconsIcon icon={InformationCircleIcon} className="h-8 w-8" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold">No members yet</h3>
            <p className="text-sm text-muted-foreground">Invite staff or viewers to your organization to get started.</p>
          </div>
        </div>
      ) : (
        <ElectionDataTable
          columns={columns(handleView, handleEdit, (m) => setMemberToRemove(m), orgCreatorId)}
          data={members}
          emptyMessage="No members found matching your search."
        />
      )}

      <AlertDialog open={!!memberToRemove} onOpenChange={(o) => !o && setMemberToRemove(null)}>
        <AlertDialogContent className="rounded-[2.5rem] p-8 border-muted-foreground/10 shadow-2xl">
          <AlertDialogHeader>
            <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
               <HugeiconsIcon icon={Alert01Icon} className="h-7 w-7" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold tracking-tight">Remove Organization Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium text-muted-foreground/80 pt-2">
              Are you sure you want to remove <strong>{memberToRemove?.name || memberToRemove?.email}</strong> from your organization? 
              They will lose all administrative and viewing access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6 gap-3">
            <AlertDialogCancel className="rounded-2xl font-bold h-12 px-6" disabled={isRemovePending}>Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              className="rounded-2xl font-black h-12 px-8 shadow-lg shadow-destructive/20" 
              onClick={handleRemove}
              disabled={isRemovePending}
            >
              <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" />
              {isRemovePending ? "Removing..." : "Confirm Removal"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MemberDetailsSheet
        member={selectedMemberForView}
        open={isViewSheetOpen}
        onOpenChange={setIsViewSheetOpen}
        onEdit={handleEdit}
        onRemove={(m) => setMemberToRemove(m)}
        isOwner={selectedMemberForView?.id === orgCreatorId}
      />
    </div>
  )
}
