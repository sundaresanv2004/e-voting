"use client"

import * as React from "react"
import { ElectionDataTable } from "./data-table"
import { columns } from "./columns"
import { ElectionDetailsSheet, type Election } from "./election-details-sheet"
import { ElectionDialog } from "./election-dialog"
import { DeleteElectionDialog } from "./delete-election-dialog"
import { deleteElection, toggleElectionStatus } from "../_actions"
import { toast } from "sonner"

interface ElectionsListProps {
  elections: Election[]
}

export function ElectionsList({ elections }: ElectionsListProps) {
  const [selectedElection, setSelectedElection] = React.useState<Election | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  
  const [electionToEdit, setElectionToEdit] = React.useState<Election | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const [electionToDelete, setElectionToDelete] = React.useState<Election | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null)

  const handleView = (election: Election) => {
    setSelectedElection(election)
    setIsSheetOpen(true)
  }

  const handleEdit = (election: Election) => {
    setElectionToEdit(election)
    setIsEditDialogOpen(true)
  }

  const handleToggleStatus = async (electionId: string) => {
    setIsUpdating(electionId)
    try {
      const res = await toggleElectionStatus(electionId)
      if (res.success) {
        toast.success(`Election status updated to ${res.status}`)
      } else {
        toast.error(res.error || "Failed to update status")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <>
      {selectedElection && (
        <ElectionDetailsSheet 
          election={selectedElection}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onEdit={() => handleEdit(selectedElection)}
          onDelete={() => {
            setElectionToDelete(selectedElection)
            setIsDeleteDialogOpen(true)
          }}
          onToggleStatus={handleToggleStatus}
        />
      )}

      <ElectionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={electionToEdit ? {
          id: electionToEdit.id,
          name: electionToEdit.name,
          startTime: electionToEdit.startTime,
          endTime: electionToEdit.endTime,
        } : undefined}
      />

      <DeleteElectionDialog
        election={electionToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />

      <ElectionDataTable 
        columns={columns(
          handleView,
          handleEdit,
          (election) => {
            setElectionToDelete(election)
            setIsDeleteDialogOpen(true)
          },
          handleToggleStatus,
          isUpdating
        )} 
        data={elections} 
        searchPlaceholder="Search elections by name or code..."
        onRowClick={handleView}
      />
    </>
  )
}
