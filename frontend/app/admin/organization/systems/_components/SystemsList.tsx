"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { LaptopIcon } from "@hugeicons/core-free-icons"
import { SystemStatus } from "@prisma/client"
import { toast } from "sonner"

import { SystemDetailsSheet } from "./SystemDetailsSheet"
import { EditSystemDialog } from "./EditSystemDialog"
import { DeleteSystemDialog } from "./DeleteSystemDialog"
import { updateSystemStatusAction } from "../_actions"
import { columns, type System } from "./columns"
import { SystemDataTable } from "./data-table"

interface SystemsListProps {
  initialSystems: System[]
}

export function SystemsList({ initialSystems }: SystemsListProps) {
  const router = useRouter()
  const [systems, setSystems] = React.useState(initialSystems)
  const [selectedSystem, setSelectedSystem] = React.useState<System | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null)

  // Edit dialog state
  const [systemToEdit, setSystemToEdit] = React.useState<System | null>(null)
  const [isEditOpen, setIsEditOpen] = React.useState(false)

  // Delete dialog state
  const [systemToDelete, setSystemToDelete] = React.useState<System | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

  // Sync local state when server revalidates
  React.useEffect(() => {
    setSystems(initialSystems)
  }, [initialSystems])

  // Real-time Polling: Refresh every 10 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 10000)
    return () => clearInterval(interval)
  }, [router])

  const handleStatusUpdate = async (systemId: string, status: SystemStatus) => {
    setIsUpdating(systemId)
    try {
      const result = await updateSystemStatusAction(systemId, status)
      if (result.success) {
        toast.success(`Hardware ${status.toLowerCase()} successfully`)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update status")
      }
    } catch {
      toast.error("An unexpected error occurred")
    } finally {
      setIsUpdating(null)
    }
  }

  const openDetails = (system: System) => {
    setSelectedSystem(system)
    setIsSheetOpen(true)
  }

  const handleEdit = (system: System) => {
    setSystemToEdit(system)
    setIsEditOpen(true)
  }

  const handleDelete = (system: System) => {
    setSystemToDelete(system)
    setIsDeleteOpen(true)
  }

  if (systems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-[2rem] border border-dashed border-muted-foreground/20 p-8 text-center bg-muted/5">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4 shadow-sm border border-muted-foreground/10">
          <HugeiconsIcon icon={LaptopIcon} strokeWidth={1.5} className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2 tracking-tight">No systems found</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Authorized hardware will appear here once they attempt to connect using your organization access code.
        </p>
      </div>
    )
  }

  return (
    <>
      <SystemDetailsSheet
        system={selectedSystem}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <EditSystemDialog
        system={systemToEdit}
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) router.refresh()
        }}
      />

      <DeleteSystemDialog
        system={systemToDelete}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onSuccess={() => {
          if (systemToDelete) {
            setSystems((prev) => prev.filter((s) => s.id !== systemToDelete.id))
            setIsSheetOpen(false)
          }
        }}
      />

      <SystemDataTable
        columns={columns(openDetails, handleEdit, handleDelete, handleStatusUpdate, isUpdating)}
        data={systems}
        emptyMessage="No systems found."
        searchPlaceholder="Search systems by name or hostname..."
        onRowClick={openDetails}
      />
    </>
  )
}
