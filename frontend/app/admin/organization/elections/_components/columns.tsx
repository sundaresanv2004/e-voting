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
import { type Election } from "./election-details-sheet"

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

export const columns = (
  onView: (election: Election) => void,
  onEdit: (election: Election) => void,
  onDelete: (election: Election) => void
): ColumnDef<Election>[] => [
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
        <span className="text-sm text-muted-foreground font-medium">
          {format(new Date(row.getValue("startTime")), "MMM d, yyyy · h:mm a")}
        </span>
      ),
    },
    {
      accessorKey: "endTime",
      header: "End Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-medium">
          {format(new Date(row.getValue("endTime")), "MMM d, yyyy · h:mm a")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const election = row.original

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Open menu</span>
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" color="currentColor" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onView(election)}>
                  <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(election)}>
                  <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" color="currentColor" />
                  Edit Election
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onDelete(election)}
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    className="h-4 w-4"
                  />
                  Delete Election
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
