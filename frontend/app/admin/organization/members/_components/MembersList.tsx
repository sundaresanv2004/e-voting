"use client"

import * as React from "react"
import { ElectionDataTable } from "../../elections/_components/data-table"
import { columns, type Member } from "./columns"
import { HugeiconsIcon } from "@hugeicons/react"
import { MemberDetailsSheet } from "./member-details-sheet"
import {
  Alert01Icon,
  Delete02Icon,
  InformationCircleIcon
} from "@hugeicons/core-free-icons"
import { EditMemberDialog } from "./EditMemberDialog"
import { DeleteMemberDialog } from "./delete-member-dialog"

interface MembersListProps {
  initialMembers: Member[]
  orgCreatorId?: string
  currentUserId?: string
}

export function MembersList({ initialMembers, orgCreatorId, currentUserId }: MembersListProps) {
  const [members, setMembers] = React.useState(initialMembers)
  const [memberToRemove, setMemberToRemove] = React.useState<Member | null>(null)
  const [isRemoveOpen, setIsRemoveOpen] = React.useState(false)
  const [selectedMemberForView, setSelectedMemberForView] = React.useState<Member | null>(null)
  const [isViewSheetOpen, setIsViewSheetOpen] = React.useState(false)
  const [memberToEdit, setMemberToEdit] = React.useState<Member | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  // Update local state when initialMembers change (e.g. on revalidate)
  React.useEffect(() => {
    setMembers(initialMembers)
  }, [initialMembers])

  const handleRemoveInitiate = (member: Member) => {
    setMemberToRemove(member)
    setIsRemoveOpen(true)
  }

  const handleEdit = (member: Member) => {
    setMemberToEdit(member)
    setIsEditOpen(true)
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
          columns={columns(handleView, handleEdit, handleRemoveInitiate, orgCreatorId, currentUserId)}
          data={members}
          emptyMessage="No members found matching your search."
          onRowClick={handleView}
        />
      )}

      <DeleteMemberDialog
        member={memberToRemove}
        open={isRemoveOpen}
        onOpenChange={setIsRemoveOpen}
        onSuccess={() => {
          if (memberToRemove) {
            setMembers(prev => prev.filter(m => m.id !== memberToRemove.id))
          }
        }}
      />

      <MemberDetailsSheet
        member={selectedMemberForView}
        open={isViewSheetOpen}
        onOpenChange={setIsViewSheetOpen}
        onEdit={handleEdit}
        onRemove={handleRemoveInitiate}
        isOwner={selectedMemberForView?.id === orgCreatorId}
        isCurrentUser={selectedMemberForView?.id === currentUserId}
      />

      <EditMemberDialog
        member={memberToEdit}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </div>
  )
}
