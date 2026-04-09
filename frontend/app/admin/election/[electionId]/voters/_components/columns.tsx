"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon, Delete02Icon, MoreHorizontalIcon, ViewIcon, Tick01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { format } from "date-fns"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserRole } from "@prisma/client"

export type VoterColumn = {
  id: string
  uniqueId: string
  name: string
  image: string | null
  dob: Date | null
  electionId: string
  ballot?: { id: string; createdAt: string | Date } | null
  createdAt: string | Date
  updatedAt?: string | Date
}

export const columns = (
  electionId: string,
  userRole: string,
  onView: (voter: VoterColumn) => void,
  onEdit: (voter: VoterColumn) => void,
  onDelete: (voter: VoterColumn) => void
): ColumnDef<VoterColumn>[] => [
    {
      accessorKey: "name",
      header: "Voter",
      cell: ({ row }) => {
        const voter = row.original
        const initials = voter.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={voter.image || undefined} />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-sm leading-none">{voter.name}</span>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: "createdAt",
      header: "Registered",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium">
            {format(new Date(row.original.createdAt), "MMM d, yyyy")}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(row.original.createdAt), "hh:mm a")}
          </span>
        </div>
      )
    },
    {
      id: "votedAt",
      header: "Voted At",
      cell: ({ row }) => {
        const votedAt = row.original.ballot?.createdAt
        if (!votedAt) return <span className="text-[10px] font-bold text-muted-foreground/30">—</span>
        
        return (
          <div className="flex flex-col text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold">
              {format(new Date(votedAt), "MMM d, yyyy")}
            </span>
            <span className="text-[10px] opacity-70 font-medium">
              {format(new Date(votedAt), "hh:mm a")}
            </span>
          </div>
        )
      }
    },

    {
      id: "status",
      accessorFn: (row) => row.ballot ? "voted" : "not-voted",
      filterFn: "equals",
      enableColumnFilter: true,
      header: "Status",
      cell: ({ row }) => {
        const hasVoted = !!row.original.ballot
        return (
          <Badge 
            variant={hasVoted ? "success" : "secondary"} 
            className="flex w-fit items-center gap-1 py-0.5 px-2 text-[10px] font-bold uppercase tracking-wider"
          >
            <HugeiconsIcon 
              icon={hasVoted ? Tick01Icon : Cancel01Icon} 
              className="h-3 w-3" 
            />
            {hasVoted ? "Voted" : "Not Voted"}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const voter = row.original

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open menu</span>
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" color="currentColor" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest opacity-50">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(voter)} className="gap-2">
                  <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 text-muted-foreground" />
                  View Details
                </DropdownMenuItem>
                {(userRole === UserRole.ORG_ADMIN || userRole === UserRole.STAFF) && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(voter)} className="gap-2">
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 text-muted-foreground" />
                      Edit Voter
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => onDelete(voter)}
                      className="gap-2"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        className="h-4 w-4"
                      />
                      Delete Voter
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
