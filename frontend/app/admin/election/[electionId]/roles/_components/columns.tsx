"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon, Delete02Icon, MoreHorizontalIcon, InformationCircleIcon } from "@hugeicons/core-free-icons"

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
}

import { UserRole } from "@prisma/client"

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
      cell: ({ row }) => {
        const role = row.original

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
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
                  onSelect={() => onView(role)}
                >
                  <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                {(userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF) && (
                  <>
                    <DropdownMenuItem
                      onSelect={() => onEdit(role)}
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
                      <span>Edit Role</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => onDelete(role)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                      <span>Delete Role</span>
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
