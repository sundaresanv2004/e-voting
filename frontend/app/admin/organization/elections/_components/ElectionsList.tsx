"use client"

import * as React from "react"
import { ElectionDataTable } from "./data-table"
import { columns } from "./columns"
import { ElectionDetailsSheet, type Election } from "./election-details-sheet"
import { ElectionDialog } from "./election-dialog"
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

  const handleDelete = async () => {
    if (!electionToDelete) return
    setIsPending(true)
    try {
      const result = await deleteElection(electionToDelete.id)
      if (result.success) {
        toast.success("Election deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete election")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
      setIsDeleteDialogOpen(false)
      setElectionToDelete(null)
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the <strong>{electionToDelete?.name}</strong> election and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} onClick={() => setElectionToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending ? "Deleting..." : "Delete Election"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
