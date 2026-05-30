"use client"

import * as React from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
import { deleteCategory } from "@/lib/actions/category"

interface DeleteCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: { id: string; name: string } | null
  electionId: string
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  category,
  electionId,
}: DeleteCategoryDialogProps) {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!category) return

    setIsPending(true)
    try {
      const res = await deleteCategory(category.id, electionId)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success("Category deleted successfully")
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this category?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Voters using this category's code will no longer be able to log in.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isPending} variant="delete">
            {isPending && <Spinner />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
