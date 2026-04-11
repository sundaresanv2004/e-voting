"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon, Delete02Icon, MoreHorizontalIcon, ViewIcon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { UserRole } from "@prisma/client"

export type CandidateColumn = {
  id: string
  name: string
  electionRoleId: string
  profileImage: string | null
  symbolImage: string | null
  createdAt: Date | string
  updatedAt: Date | string
  role: {
    name: string
  }
  createdBy?: {
    name: string | null
    email: string | null
    image: string | null
  }
  updatedBy?: {
    name: string | null
    email: string | null
    image: string | null
  }
}

export const columns = (
  userRole: string,
  onView: (candidate: CandidateColumn) => void,
  onEdit: (candidate: CandidateColumn) => void,
  onDelete: (candidate: CandidateColumn) => void
): ColumnDef<CandidateColumn>[] => [
  {
    accessorKey: "name",
    header: "Candidate",
    cell: ({ row }) => {
      const candidate = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={candidate.profileImage || ""} alt={candidate.name} className="object-cover" />
            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
              {candidate.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold">{candidate.name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "role",
    header: "Contesting Role",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-auto">
        {row.original.role.name}
      </Badge>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => (
      <span className="text-sm text-muted-foreground font-medium">
        Active
      </span>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const candidate = row.original
      const canManage = userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF

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
              <DropdownMenuItem onSelect={() => onView(candidate)}>
                <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
                View Details
              </DropdownMenuItem>

              {canManage && (
                <>
                  <DropdownMenuItem onSelect={() => onEdit(candidate)}>
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" color="currentColor" />
                    Edit Candidate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => onDelete(candidate)}
                  >
                    <HugeiconsIcon
                      icon={Delete02Icon}
                      className="h-4 w-4"
                    />
                    Delete Candidate
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
