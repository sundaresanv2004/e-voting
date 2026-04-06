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
        <div className="flex items-center gap-3 py-4 px-6">
          <Avatar className="h-9 w-9 border bg-background shadow-sm">
            <AvatarImage src={candidate.profileImage || ""} alt={candidate.name} className="object-cover" />
            <AvatarFallback className="text-[10px] font-medium uppercase bg-primary/5 text-primary">
              {candidate.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="font-semibold tracking-tight">{candidate.name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "role",
    header: "Contesting Role",
    cell: ({ row }) => (
      <div className="py-4 px-6">
        <Badge variant="secondary" className="font-bold px-2.5 py-0.5 text-[10px] uppercase tracking-wider bg-muted text-muted-foreground border-border/50">
          {row.original.role.name}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => (
      <div className="py-4 px-6">
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">
          Active
        </Badge>
      </div>
    )
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const candidate = row.original
      const canManage = userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF

      return (
        <div className="flex justify-end px-6" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted group rounded-lg">
                <span className="sr-only">Open menu</span>
                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 border shadow-md rounded-xl p-1">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black p-2 opacity-60">Actions</DropdownMenuLabel>
              <DropdownMenuSeparator className="mx-1" />
              <DropdownMenuItem 
                className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground py-2 rounded-lg" 
                onSelect={() => onView(candidate)}
              >
                <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">View Details</span>
              </DropdownMenuItem>
              
              {canManage && (
                <>
                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer focus:bg-accent focus:text-accent-foreground py-2 rounded-lg" 
                    onSelect={() => onEdit(candidate)}
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Edit Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-1" />
                  <DropdownMenuItem 
                    className="gap-2 text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer py-2 rounded-lg" 
                    onSelect={() => onDelete(candidate)}
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                    <span className="font-medium text-sm">Delete Candidate</span>
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
