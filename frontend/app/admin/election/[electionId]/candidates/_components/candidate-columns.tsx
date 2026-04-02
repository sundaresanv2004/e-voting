"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon, Delete02Icon, MoreHorizontalIcon, InformationCircleIcon } from "@hugeicons/core-free-icons"

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

export type CandidateColumn = {
  id: string
  name: string
  electionRoleId: string
  profileImage: string | null
  symbolImage: string | null
  role: {
    name: string
  }
}

export const columns = (
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
          <Avatar className="h-8 w-8 border bg-background">
            <AvatarImage src={candidate.profileImage || ""} alt={candidate.name} className="object-cover" />
            <AvatarFallback className="text-[10px] font-medium uppercase">
              {candidate.name.substring(0, 2)}
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
      <Badge variant="secondary" className="font-medium px-2.5 py-0.5">
        {row.original.role.name}
      </Badge>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => (
      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
        Active
      </Badge>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const candidate = row.original

      return (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted group">
                <span className="sr-only">Open menu</span>
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border shadow-md rounded-xl">
              <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider font-bold p-2">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground py-2" 
                onSelect={() => onView(candidate)}
              >
                <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
                <span>View Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground py-2" 
                onSelect={() => onEdit(candidate)}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2" 
                onSelect={() => onDelete(candidate)}
              >
                <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                <span>Delete Candidate</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  }
]
