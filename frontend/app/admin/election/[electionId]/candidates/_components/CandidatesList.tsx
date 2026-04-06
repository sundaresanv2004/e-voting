"use client"

import * as React from "react"
import { CandidateDataTable } from "./data-table"
import { columns, CandidateColumn } from "./candidate-columns"
import { CandidateDetailsSheet } from "./CandidateDetailsSheet"
import { CandidateDialog } from "./CandidateDialog"
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
import { deleteCandidate } from "../_actions"
import { toast } from "sonner"
import type { RoleColumn } from "../../roles/_components/columns"

interface CandidatesListProps {
  candidates: CandidateColumn[]
  electionId: string
  availableRoles: RoleColumn[]
  userRole: string
}

export function CandidatesList({ candidates, electionId, availableRoles, userRole }: CandidatesListProps) {
  const [selectedCandidate, setSelectedCandidate] = React.useState<CandidateColumn | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  
  const [candidateToEdit, setCandidateToEdit] = React.useState<CandidateColumn | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const [candidateToDelete, setCandidateToDelete] = React.useState<CandidateColumn | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const handleView = (candidate: CandidateColumn) => {
    setSelectedCandidate(candidate)
    setIsSheetOpen(true)
  }

  const handleEdit = (candidate: CandidateColumn) => {
    setCandidateToEdit(candidate)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!candidateToDelete) return
    setIsPending(true)
    try {
      const result = await deleteCandidate(candidateToDelete.id, electionId)
      if (result.success) {
        toast.success("Candidate deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete candidate")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
      setIsDeleteDialogOpen(false)
      setCandidateToDelete(null)
    }
  }

  return (
    <>
      <CandidateDetailsSheet 
        candidate={selectedCandidate}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        userRole={userRole}
        onEdit={(c) => handleEdit(c as CandidateColumn)}
        onDelete={(c) => {
          setCandidateToDelete(c as CandidateColumn)
          setIsDeleteDialogOpen(true)
        }}
      />

      <CandidateDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        electionId={electionId}
        availableRoles={availableRoles}
        initialData={candidateToEdit ?? undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the candidate profile for <strong>{candidateToDelete?.name}</strong> and all associated votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} onClick={() => setCandidateToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending ? "Deleting..." : "Delete Candidate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CandidateDataTable 
        columns={columns(
          userRole,
          handleView,
          handleEdit,
          (candidate) => {
            setCandidateToDelete(candidate)
            setIsDeleteDialogOpen(true)
          }
        )} 
        data={candidates} 
        onRowClick={handleView}
      />
    </>
  )
}
