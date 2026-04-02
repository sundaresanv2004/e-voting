"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Delete02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
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
import { ElectionDialog } from "./election-dialog"
import { ElectionDetailsSheet, type Election } from "./election-details-sheet"

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-500/10 text-green-600 border-green-500/20"
    case "UPCOMING":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20"
    case "COMPLETED":
      return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

export const columns: ColumnDef<Election>[] = [
  {
    accessorKey: "name",
    header: "Election Name",
    cell: ({ row }) => <span className="font-semibold">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <code className="text-xs bg-muted px-1.5 py-0.5 rounded-full px-2 font-mono">
        {row.getValue("code")}
      </code>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <Badge variant="outline" className={getStatusColor(status)}>{status}</Badge>
    },
  },
  {
    accessorKey: "startTime",
    header: "Start Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.getValue("startTime")), "MMM d, yyyy · h:mm a")}
      </span>
    ),
  },
  {
    accessorKey: "endTime",
    header: "End Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.getValue("endTime")), "MMM d, yyyy · h:mm a")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const election = row.original
      const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
      const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
      const [isDeleting, setIsDeleting] = React.useState(false)

      const handleDelete = async () => {
        setIsDeleting(true)
        try {
          const result = await deleteElection(election.id)
          if (result.success) {
            toast.success("Election deleted successfully")
          } else {
            toast.error(result.error || "Failed to delete")
          }
        } catch {
          toast.error("Something went wrong")
        } finally {
          setIsDeleting(false)
          setIsDeleteDialogOpen(false)
        }
      }

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open menu</span>
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" color="currentColor" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsDetailsOpen(true)} className="gap-2">
                <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)} className="gap-2">
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" color="currentColor" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 group"
                onSelect={() => setIsDeleteDialogOpen(true)}
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  className="h-4 w-4 text-destructive/60 group-data-[highlighted]:text-destructive"
                />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ElectionDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            initialData={{
              id: election.id,
              name: election.name,
              startTime: election.startTime,
              endTime: election.endTime,
            }}
          />

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Election Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete <strong>{election.name}</strong> and all associated ballots, candidates, and settings. This action is irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete()
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Confirm Deletion"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <ElectionDetailsSheet
            election={election}
            open={isDetailsOpen}
            onOpenChange={setIsDetailsOpen}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        </div>
      )
    },
  },
]
