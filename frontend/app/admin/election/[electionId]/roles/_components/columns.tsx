"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  PencilEdit01Icon, 
  Delete02Icon, 
  MoreHorizontalIcon, 
  ViewIcon,
  ArrowUpDownIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"

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

export type RoleColumn = {
  id: string
  name: string
  order: number
  electionId: string
  allowedSystems: { id: string; name: string | null; hostName?: string | null }[]
  _count?: {
    candidates: number
  }
  candidates?: { id: string; name: string; profileImage: string | null }[]
  createdAt?: string | Date
  updatedAt?: string | Date
  createdBy?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  updatedBy?: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

import { UserRole } from "@prisma/client"

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
  electionId: string,
  availableSystems: { id: string; name: string | null }[],
  userRole: string,
  onView: (role: RoleColumn) => void,
  onEdit: (role: RoleColumn) => void,
  onDelete: (role: RoleColumn) => void
): ColumnDef<RoleColumn>[] => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Role Name
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>
    },
    {
      accessorKey: "order",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Order
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-1.5 py-0.5 rounded-full px-2 font-mono">
          {row.original.order}
        </code>
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
      accessorKey: "_count",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50 text-nowrap"
          >
            Candidates
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => {
        const count = row.original._count?.candidates ?? 0
        return (
          <Badge variant="secondary" className="font-semibold bg-muted px-2 py-0.5 pointer-events-none">
            {count} {count === 1 ? "Candidate" : "Candidates"}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const role = row.original

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
                <DropdownMenuItem onSelect={() => onView(role)}>
                  <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
                  View Details
                </DropdownMenuItem>
                {(userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF) && (
                  <>
                    <DropdownMenuItem onSelect={() => onEdit(role)}>
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" color="currentColor" />
                      Edit Role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => onDelete(role)}
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        className="h-4 w-4"
                      />
                      Delete Role
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ]
