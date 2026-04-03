"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { LaptopIcon, MoreHorizontalIcon, EyeIcon, CheckmarkCircle02Icon, Cancel01Icon, Alert01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { SystemStatus } from "@prisma/client"
import { SystemDetailsSheet } from "./SystemDetailsSheet"
import { updateSystemStatusAction } from "../_actions"
import { toast } from "sonner"

interface System {
  id: string
  name: string | null
  hostName: string | null
  ipAddress: string | null
  macAddress: string | null
  status: SystemStatus
  createdAt: Date
  updatedAt: Date
  approvedAt?: Date | null
  approvedBy?: {
    name: string | null
    email: string
  } | null
}

interface SystemsListProps {
  initialSystems: System[]
}

export function SystemsList({ initialSystems }: SystemsListProps) {
  const router = useRouter()
  const [selectedSystem, setSelectedSystem] = React.useState<System | null>(null)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null)
  
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

  if (initialSystems.length === 0) {
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
      />

      <div className="rounded-2xl border bg-card/50 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider text-nowrap">System Name</TableHead>
              <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider">Hostname</TableHead>
              <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider">Added</TableHead>
              <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-wider text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialSystems.map((system) => (
              <TableRow 
                key={system.id} 
                className="hover:bg-muted/30 transition-colors border-b last:border-0 cursor-pointer"
                onClick={() => openDetails(system)}
              >
                <TableCell className="py-4 px-6 font-medium text-foreground">
                  {system.name || "Unnamed PC"}
                </TableCell>
                <TableCell className="py-4 px-6 text-muted-foreground whitespace-nowrap">
                  {system.hostName || "-"}
                </TableCell>
                <TableCell className="py-4 px-6 text-muted-foreground text-sm text-nowrap">
                  {format(new Date(system.createdAt), "PP")}
                </TableCell>

                <TableCell className="py-4 px-6">
                  {system.status === "APPROVED" && (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5">
                      Approved
                    </Badge>
                  )}
                  {system.status === "PENDING" && (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5 animate-pulse text-nowrap">
                      Pending
                    </Badge>
                  )}
                  {system.status === "REJECTED" && (
                    <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5">
                      Rejected
                    </Badge>
                  )}
                  {system.status === "REVOKED" && (
                    <Badge variant="outline" className="bg-zinc-500/10 text-zinc-600 border-zinc-500/20 font-semibold text-[10px] tracking-wide uppercase px-2 py-0.5">
                      Revoked
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50 transition-colors rounded-full" disabled={isUpdating === system.id}>
                        <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Quick Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openDetails(system)} className="flex items-center gap-2 cursor-pointer">
                        <HugeiconsIcon icon={EyeIcon} className="h-3.5 w-3.5" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {system.status === "PENDING" && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(system.id, SystemStatus.APPROVED)} 
                            className="flex items-center gap-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-500/10 cursor-pointer"
                          >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3.5 w-3.5" />
                            Approve Hardware
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleStatusUpdate(system.id, SystemStatus.REJECTED)} 
                            className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-500/10 cursor-pointer"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" />
                            Reject Hardware
                          </DropdownMenuItem>
                        </>
                      )}
                      {system.status === "APPROVED" && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(system.id, SystemStatus.REVOKED)} 
                          className="flex items-center gap-2 text-orange-600 focus:text-orange-700 focus:bg-orange-500/10 cursor-pointer"
                        >
                          <HugeiconsIcon icon={Alert01Icon} className="h-3.5 w-3.5" />
                          Revoke Access
                        </DropdownMenuItem>
                      )}
                      {(system.status === "REJECTED" || system.status === "REVOKED") && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusUpdate(system.id, SystemStatus.PENDING)} 
                          className="flex items-center gap-2 text-blue-600 focus:text-blue-700 focus:bg-blue-500/10 cursor-pointer"
                        >
                          <HugeiconsIcon icon={Tick02Icon} className="h-3.5 w-3.5" />
                          Restore to Pending
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
