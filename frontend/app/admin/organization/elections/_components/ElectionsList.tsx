"use client"

import * as React from "react"
import { ElectionDataTable } from "./data-table"
import { columns } from "./columns"
import { ElectionDetailsSheet, type Election } from "./election-details-sheet"
import { ElectionDialog } from "./election-dialog"
import { DeleteElectionDialog } from "./delete-election-dialog"
import { deleteElection } from "../_actions"
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
  const [isPending, setIsPending] = React.useState(false)

  const handleView = (election: Election) => {
    setSelectedElection(election)
    setIsSheetOpen(true)
  }

  const handleEdit = (election: Election) => {
    setElectionToEdit(election)
    setIsEditDialogOpen(true)
  }

  // Removed handleDelete logic as it's now handled in DeleteElectionDialog component

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
          }
        )} 
        data={elections} 
        onRowClick={handleView}
      />
    </>
  )
}
