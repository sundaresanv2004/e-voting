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
  ArrowUpDownIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  PencilEdit01Icon,
  Delete02Icon,
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
  secretToken: string | null
  tokenExpiresAt?: Date | null
  createdAt: Date
  updatedAt: Date
  lastOpenedAt?: Date | null
  lastClosedAt?: Date | null
  _count?: {
    logs: number
    ballots: number
  }
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

export function getSystemStatusBadgeStyle(status: SystemStatus) {
  switch (status) {
    case "APPROVED": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
    case "PENDING": return "bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse"
    case "REJECTED": return "bg-red-500/10 text-red-600 border-red-500/20"
    case "REVOKED": return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20"
    case "EXPIRED": return "bg-orange-500/10 text-orange-600 border-orange-500/20"
    case "SUSPENDED": return "bg-purple-500/10 text-purple-600 border-purple-500/20"
    default: return ""
  }
}

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
  if (isSorted === "asc") {
    return <HugeiconsIcon icon={ArrowUp01Icon} className="ml-2 h-3.5 w-3.5 text-foreground" />
  }
  if (isSorted === "desc") {
    return <HugeiconsIcon icon={ArrowDown01Icon} className="ml-2 h-3.5 w-3.5 text-foreground" />
  }
  return <HugeiconsIcon icon={ArrowUpDownIcon} className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
}

export const columns = (
  onView: (system: System) => void,
  onEdit: (system: System) => void,
  onDelete: (system: System) => void,
  onStatusUpdate: (systemId: string, status: SystemStatus) => void,
  isUpdating: string | null
): ColumnDef<System>[] => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            System Name
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => <span className="font-semibold">{row.original.name || "Unnamed PC"}</span>,
    },
    {
      accessorKey: "hostName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Hostname
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {row.getValue("hostName") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Added
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-medium text-nowrap">
          {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Last Updated
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
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
      filterFn: "equals",
      enableColumnFilter: true,
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant="outline" className={getSystemStatusBadgeStyle(status) || undefined}>
            {status}
          </Badge>
        )
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
                <DropdownMenuItem onClick={() => onEdit(system)} className="gap-2 cursor-pointer">
                  <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" color="currentColor" />
                  Edit System
                </DropdownMenuItem>
                {system.status === "PENDING" && (
                  <>
                    <DropdownMenuSeparator />
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
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onStatusUpdate(system.id, SystemStatus.REVOKED)}
                      className="flex items-center gap-2 text-orange-600 focus:text-orange-700 focus:bg-orange-500/10 cursor-pointer"
                    >
                      <HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" color="currentColor" />
                      Revoke Access
                    </DropdownMenuItem>
                  </>
                )}
                {system.status === "EXPIRED" && (
                  <>
                    <DropdownMenuSeparator />
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(system)}
                  variant="destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" color="currentColor" />
                  Delete System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
