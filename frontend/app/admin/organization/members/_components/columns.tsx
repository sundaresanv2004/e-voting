"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import {
  MoreHorizontalIcon,
  PencilEdit01Icon,
  Delete02Icon,
  Shield01Icon,
  UserIcon,
  Mail01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserRole } from "@prisma/client"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export type Member = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: UserRole
  hasAllElectionsAccess: boolean
  createdAt: Date
  updatedAt: Date
  electionAccess: {
    electionId: string
    createdAt: Date
    updatedAt: Date
    election: {
      name: string
    }
    createdBy: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
    updatedBy: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }[]
}

function getRoleBadgeStyle(role: UserRole) {
  switch (role) {
    case UserRole.ORG_ADMIN:
      return "bg-indigo-50/50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 shadow-none"
    case UserRole.STAFF:
      return "bg-sky-50/50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 shadow-none"
    case UserRole.VIEWER:
      return "bg-slate-50/50 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20 shadow-none"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

export const columns = (
  onView: (member: Member) => void,
  onEdit: (member: Member) => void,
  onRemove: (member: Member) => void,
  orgCreatorId?: string
): ColumnDef<Member>[] => [
    {
      accessorKey: "user",
      header: "Member",
      cell: ({ row }) => {
        const member = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarImage src={member.image || ""} alt={member.name || "User"} className="object-cover" />
              <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-bold">
                {member.name?.charAt(0) || member.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm truncate leading-tight">{member.name || "Anonymous Professional"}</span>
              <div className="flex items-center text-[11px] text-muted-foreground/80 mt-0.5">
                <HugeiconsIcon icon={Mail01Icon} className="h-2.5 w-2.5 mr-1" />
                <span className="truncate">{member.email}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Organization Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole
        return (
          <Badge variant="outline" className={`font-black uppercase tracking-widest text-[9px] py-0 px-2 h-5 ${getRoleBadgeStyle(role)}`}>
            {role.replace("_", " ")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "access",
      header: "Election Access",
      cell: ({ row }) => {
        const member = row.original
        if (member.role === UserRole.ORG_ADMIN || member.hasAllElectionsAccess) {
          return (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <HugeiconsIcon icon={Shield01Icon} className="h-3.5 w-3.5" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Full Access</span>
            </div>
          )
        }

        const count = member.electionAccess?.length || 0
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {count === 0 ? "No Elections" : `${count} Assigned ${count === 1 ? 'Election' : 'Elections'}`}
            </span>
            {count > 0 && (
              <div className="flex flex-wrap gap-1">
                {member.electionAccess.slice(0, 2).map((ea, i) => (
                  <span key={i} className="text-[9px] bg-muted px-1 py-0.5 rounded text-muted-foreground font-medium max-w-[80px] truncate">
                    {ea.election.name}
                  </span>
                ))}
                {count > 2 && <span className="text-[9px] text-muted-foreground font-bold">+{count - 2}</span>}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined On",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground font-semibold">
          {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const member = row.original
        const isCreator = member.id === orgCreatorId

        if (isCreator) {
          return (
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted group rounded-xl">
                    <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" color="currentColor" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 shadow-2xl border-muted/20 rounded-2xl p-2">
                  <div className="px-2 py-1 mb-2">
                    <Badge variant="outline" className="bg-orange-50/50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20 font-bold uppercase tracking-widest text-[9px] py-0 px-2 h-5 shadow-none">
                      Owner
                    </Badge>
                  </div>
                  <DropdownMenuSeparator className="opacity-40" />
                  <DropdownMenuItem onSelect={() => onView(member)} className="gap-2 cursor-pointer py-2.5 rounded-xl font-semibold text-sm">
                    <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 text-primary" color="currentColor" />
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }

        return (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted group rounded-xl">
                  <span className="sr-only">Open menu</span>
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" color="currentColor" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 shadow-2xl border-muted/20 rounded-2xl p-2">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase font-black tracking-widest px-2 py-2 mb-1">
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="opacity-40" />
                <DropdownMenuItem onSelect={() => onView(member)} className="gap-2 cursor-pointer py-2.5 rounded-xl font-semibold text-sm">
                  <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 text-primary" color="currentColor" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(member)} className="gap-2 cursor-pointer py-2.5 rounded-xl font-semibold text-sm">
                  <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 text-blue-500" color="currentColor" />
                  Modify Permissions
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onRemove(member)}
                  className="gap-2 text-destructive focus:bg-destructive/10 cursor-pointer py-2.5 rounded-xl font-semibold text-sm"
                >
                  <HugeiconsIcon
                    icon={Delete02Icon}
                    className="h-4 w-4"
                    color="currentColor"
                  />
                  Remove from Org
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
