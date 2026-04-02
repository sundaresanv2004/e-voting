"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon, Delete02Icon, MoreHorizontalIcon, InformationCircleIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

import { RoleDialog } from "./RoleDialog"
import { deleteRole } from "../_actions"

export type RoleColumn = {
  id: string
  name: string
  order: number
  electionId: string
  allowedSystems: { id: string; name: string | null }[]
  _count?: {
    candidates: number
  }
}

export const columns = (
  electionId: string, 
  availableSystems: { id: string; name: string | null }[],
  onView: (role: RoleColumn) => void
): ColumnDef<RoleColumn>[] => [
  {
    accessorKey: "name",
    header: "Role Name",
    cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>
  },
  {
    accessorKey: "order",
    header: "Order",
    cell: ({ row }) => (
      <Badge variant="outline" className="px-2 font-mono">
        {row.original.order}
      </Badge>
    )
  },
  {
    accessorKey: "allowedSystems",
    header: "Allowed Systems",
    cell: ({ row }) => {
      const systems = row.original.allowedSystems
      if (systems.length === 0) return <span className="text-xs text-muted-foreground italic">All Systems</span>
      
      return (
        <div className="flex flex-wrap gap-1">
          {systems.map(s => (
            <Badge key={s.id} variant="secondary" className="text-[10px] py-0 px-1.5 h-auto">
              {s.name || "Default"}
            </Badge>
          ))}
        </div>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <RoleActions 
        role={row.original} 
        electionId={electionId} 
        availableSystems={availableSystems} 
        onView={() => onView(row.original)}
      />
    )
  }
]

function RoleActions({ 
  role, 
  electionId, 
  availableSystems,
  onView
}: { 
  role: RoleColumn; 
  electionId: string; 
  availableSystems: { id: string; name: string | null }[];
  onView: () => void;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const onDelete = async () => {
    setIsPending(true)
    try {
      const result = await deleteRole(role.id, electionId)
      if (result.success) {
        toast.success("Role deleted successfully")
      } else {
        toast.error(result.error || "Failed to delete role")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsPending(false)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <>
      <RoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        electionId={electionId}
        availableSystems={availableSystems}
        initialData={role}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the <strong>{role.name}</strong> role and all associated candidates and votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDelete} 
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending ? "Deleting..." : "Delete Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted group">
            <span className="sr-only">Open menu</span>
            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 border shadow-md rounded-xl">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold p-2">Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground py-2" 
            onSelect={onView}
          >
            <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground py-2" 
            onSelect={() => setIsEditDialogOpen(true)}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
            <span>Edit Role</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2" 
            onSelect={() => setIsDeleteDialogOpen(true)}
          >
            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
            <span>Delete Role</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
