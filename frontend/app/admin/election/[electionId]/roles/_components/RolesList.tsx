"use client"

import * as React from "react"
import { RoleDataTable } from "./data-table"
import { columns, RoleColumn } from "./columns"
import { RoleDetailsSheet } from "./RoleDetailsSheet"
import { RoleDialog } from "./RoleDialog"
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
import { deleteRole } from "../_actions"
import { toast } from "sonner"

interface RolesListProps {
  roles: RoleColumn[]
  electionId: string
  availableSystems: { id: string; name: string | null; hostName: string | null }[]
  userRole: string
}

export function RolesList({ roles, electionId, availableSystems, userRole }: RolesListProps) {
  const [selectedRole, setSelectedRole] = React.useState<RoleColumn | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  
  const [roleToEdit, setRoleToEdit] = React.useState<RoleColumn | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const [roleToDelete, setRoleToDelete] = React.useState<RoleColumn | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const handleView = (role: RoleColumn) => {
    setSelectedRole(role)
    setIsSheetOpen(true)
  }

  const handleEdit = (role: RoleColumn) => {
    setRoleToEdit(role)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!roleToDelete) return
    setIsPending(true)
    try {
      const result = await deleteRole(roleToDelete.id, electionId)
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
      setRoleToDelete(null)
    }
  }

  const nextSuggestedOrder = roles.length > 0 ? Math.max(...roles.map(r => r.order)) + 1 : 1

  return (
    <>
      <RoleDetailsSheet 
        role={selectedRole}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        userRole={userRole}
        onEdit={(role) => handleEdit(role as RoleColumn)}
        onDelete={(role) => {
          setRoleToDelete(role as RoleColumn)
          setIsDeleteDialogOpen(true)
        }}
      />

      <RoleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        electionId={electionId}
        availableSystems={availableSystems}
        initialData={roleToEdit ?? undefined}
        nextSuggestedOrder={nextSuggestedOrder}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the <strong>{roleToDelete?.name}</strong> role and all associated candidates and votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} onClick={() => setRoleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending ? "Deleting..." : "Delete Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RoleDataTable 
        columns={columns(
          electionId, 
          availableSystems,
          userRole,
          handleView,
          handleEdit,
          (role) => {
            setRoleToDelete(role)
            setIsDeleteDialogOpen(true)
          }
        )} 
        data={roles} 
        onRowClick={handleView}
      />
    </>
  )
}
