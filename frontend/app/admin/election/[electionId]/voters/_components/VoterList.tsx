"use client"

import * as React from "react"
import { toast } from "sonner"
import { deleteVoter, resetVoterVote } from "../_actions"
import { VoterDataTable } from "./data-table"
import { columns, VoterColumn } from "./columns"
import { VoterDetailsSheet } from "./VoterDetailsSheet"
import { VoterDialog } from "./VoterDialog"
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
import { Spinner } from "@/components/ui/spinner"

interface VoterListProps {
  voters: VoterColumn[]
  electionId: string
  userRole: string
}

export function VoterList({ voters, electionId, userRole }: VoterListProps) {
  const [selectedVoter, setSelectedVoter] = React.useState<VoterColumn | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  
  const [voterToEdit, setVoterToEdit] = React.useState<VoterColumn | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const [voterToDelete, setVoterToDelete] = React.useState<VoterColumn | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

  const [voterToReset, setVoterToReset] = React.useState<VoterColumn | null>(null)
  const [isResetDialogOpen, setIsResetDialogOpen] = React.useState(false)

  const [isPending, setIsPending] = React.useState(false)

  const handleView = (voter: VoterColumn) => {
    setSelectedVoter(voter)
    setIsSheetOpen(true)
  }

  const handleEdit = (voter: VoterColumn) => {
    // Transform Date if needed for the form
    setVoterToEdit({
        ...voter,
        dob: voter.dob ? new Date(voter.dob) : null
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!voterToDelete) return
    setIsPending(true)
    try {
      const result = await deleteVoter(voterToDelete.id, electionId)
      if (result.success) {
        toast.success("Voter removed")
      } else {
        toast.error(result.error || "Failed to remove voter")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
      setIsDeleteDialogOpen(false)
      setVoterToDelete(null)
    }
  }

  const handleResetConfirm = async () => {
    if (!voterToReset) return
    setIsPending(true)
    try {
      const result = await resetVoterVote(voterToReset.id, electionId)
      if (result.success) {
        toast.success("Voter's ballot has been reset")
      } else {
        toast.error(result.error || "Failed to reset vote")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
      setIsResetDialogOpen(false)
      setVoterToReset(null)
    }
  }

  return (
    <>
      <VoterDetailsSheet 
        voter={selectedVoter}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        userRole={userRole}
        onEdit={handleEdit}
        onDelete={(voter) => {
          setVoterToDelete(voter)
          setIsDeleteDialogOpen(true)
        }}
        onReset={(voter) => {
          setVoterToReset(voter as any)
          setIsResetDialogOpen(true)
        }}
      />

      <VoterDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        electionId={electionId}
        initialData={voterToEdit ?? undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Voter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{voterToDelete?.name}</strong> from this election. This action cannot be undone. 
              {voterToDelete?.ballot && (
                <span className="block mt-2 font-bold text-destructive">
                  Warning: Action not possible as this voter has already cast a ballot.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} onClick={() => setVoterToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isPending || !!voterToDelete?.ballot}
              className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-700 transition-colors"
            >
              {isPending && <Spinner className="mr-2" color="currentColor" />}
              {isPending ? "Removing..." : "Remove Voter"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Voter&apos;s Ballot?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{voterToReset?.name}&apos;s</strong> cast ballot from this election and allow them to vote again. The system will record an audit trail for this administrative action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} onClick={() => setVoterToReset(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleResetConfirm} 
              disabled={isPending}
              className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20 hover:border-yellow-500/30 hover:text-yellow-700 transition-colors"
            >
              {isPending && <Spinner className="mr-2" color="currentColor" />}
              {isPending ? "Resetting..." : "Reset Vote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VoterDataTable 
        columns={columns(
          electionId, 
          userRole,
          handleView,
          handleEdit,
          (voter) => {
            setVoterToDelete(voter)
            setIsDeleteDialogOpen(true)
          },
          (voter) => {
            setVoterToReset(voter)
            setIsResetDialogOpen(true)
          }
        )} 
        data={voters} 
        onRowClick={handleView}
      />
    </>
  )
}
