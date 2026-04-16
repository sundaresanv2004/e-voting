"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PencilEdit01Icon,
  Delete02Icon,
  MoreHorizontalIcon,
  ViewIcon,
  Tick01Icon,
  Cancel01Icon,
  ArrowUpDownIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
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
import { cn } from "@/lib/utils"

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
  userRole: string,
  onView: (voter: VoterColumn) => void,
  onEdit: (voter: VoterColumn) => void,
  onDelete: (voter: VoterColumn) => void
): ColumnDef<VoterColumn>[] => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Voter
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
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
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarImage src={voter.image || undefined} className="object-cover" />
              <AvatarFallback className="text-[10px] bg-primary/5 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold">{voter.name}</span>
          </div>
        )
      }
    },
    {
      accessorKey: "uniqueId",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Unique ID
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-mono text-[10px] py-0 px-1.5 h-auto pointer-events-none">
          {row.original.uniqueId}
        </Badge>
      )
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
            Registered
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-medium">
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </span>
      )
    },
    {
      id: "votedAt",
      header: "Voted At",
      cell: ({ row }) => {
        const votedAt = row.original.ballot?.createdAt
        if (!votedAt) return <span className="text-[10px] font-bold text-muted-foreground/30">—</span>

        return (
          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            {format(new Date(votedAt), "MMM d, yyyy")}
          </span>
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
            variant="outline"
            className={cn(
              "flex w-fit items-center gap-1 py-0.5 px-2 text-[10px] font-bold uppercase tracking-wider pointer-events-none",
              hasVoted
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            )}
          >
            {hasVoted ? "Voted" : "Not Voted"}
          </Badge>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const voter = row.original
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
                <DropdownMenuItem onSelect={() => onView(voter)}>
                  <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
                  View Details
                </DropdownMenuItem>

                {canManage && (
                  <>
                    <DropdownMenuItem onSelect={() => onEdit(voter)}>
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" color="currentColor" />
                      Edit Voter
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onSelect={() => onDelete(voter)}
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
