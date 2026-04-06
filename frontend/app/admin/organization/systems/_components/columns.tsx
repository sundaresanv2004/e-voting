"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  MoreHorizontalIcon,
  EyeIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Alert01Icon,
  Clock01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { SystemStatus } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type System = {
  id: string
  name: string | null
  hostName: string | null
  ipAddress: string | null
  macAddress: string | null
  status: SystemStatus
  createdAt: Date
  updatedAt: Date
  lastOpenedAt?: Date | null
  lastClosedAt?: Date | null
  electionAccess: {
    election: {
      name: string
    }
  }[]
  approvedAt?: Date | null
  approvedBy?: {
    name: string | null
    email: string
    image: string | null
  } | null
  updatedBy?: {
    name: string | null
    email: string
    image: string | null
  } | null
}

export const columns = (
  onView: (system: System) => void,
  onStatusUpdate: (systemId: string, status: SystemStatus) => void,
  isUpdating: string | null
): ColumnDef<System>[] => [
    {
      accessorKey: "name",
      header: "System Name",
      cell: ({ row }) => <span className="font-semibold">{row.original.name || "Unnamed PC"}</span>,
    },
    {
      accessorKey: "hostName",
      header: "Hostname",
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {row.getValue("hostName") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Added",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-medium text-nowrap">
          {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Last Updated",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm text-foreground font-medium text-nowrap">
            {format(new Date(row.original.updatedAt), "MMM d")}
          </span>
          {row.original.updatedBy && (
            <span className="text-xs text-muted-foreground text-nowrap truncate max-w-[100px]">
              {row.original.updatedBy.name?.split(' ')[0] || "Admin"}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        if (status === "APPROVED") {
          return (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              APPROVED
            </Badge>
          )
        }
        if (status === "PENDING") {
          return (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse">
              PENDING
            </Badge>
          )
        }
        if (status === "REJECTED") {
          return (
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
              REJECTED
            </Badge>
          )
        }
        if (status === "REVOKED") {
          return (
            <Badge variant="outline" className="bg-zinc-500/10 text-zinc-600 border-zinc-500/20">
              REVOKED
            </Badge>
          )
        }
        return <Badge variant="outline">{status}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const system = row.original

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isUpdating === system.id}>
                  <span className="sr-only">Open menu</span>
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" color="currentColor" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl">
                <DropdownMenuLabel>
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(system)} className="gap-2 cursor-pointer">
                  <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {system.status === "PENDING" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => onStatusUpdate(system.id, SystemStatus.APPROVED)} 
                      className="flex items-center gap-2 text-emerald-600 focus:text-emerald-700 focus:bg-emerald-500/10 cursor-pointer"
                    >
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" color="currentColor" />
                      Approve Hardware
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusUpdate(system.id, SystemStatus.REJECTED)} 
                      className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-500/10 cursor-pointer"
                    >
                      <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" color="currentColor" />
                      Reject Hardware
                    </DropdownMenuItem>
                  </>
                )}
                {system.status === "APPROVED" && (
                  <DropdownMenuItem 
                    onClick={() => onStatusUpdate(system.id, SystemStatus.REVOKED)} 
                    className="flex items-center gap-2 text-orange-600 focus:text-orange-700 focus:bg-orange-500/10 cursor-pointer"
                  >
                    <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" color="currentColor" />
                    Revoke Access
                  </DropdownMenuItem>
                )}
                {(system.status === "REJECTED" || system.status === "REVOKED") && (
                  <DropdownMenuItem 
                    onClick={() => onStatusUpdate(system.id, SystemStatus.PENDING)} 
                    className="flex items-center gap-2 text-blue-600 focus:text-blue-700 focus:bg-blue-500/10 cursor-pointer"
                  >
                    <HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" color="currentColor" />
                    Restore to Pending
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
