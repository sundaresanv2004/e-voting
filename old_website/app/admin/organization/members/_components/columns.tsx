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
  ArrowUpDownIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  LogoutSquare01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserRole } from "@prisma/client"
import { useRouter } from "next/navigation"

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
  isActive: boolean
  lastLoginAt: Date | null
  lockedUntil: Date | null
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

// Generate a stable color from a string (for avatar fallback)
export function getAvatarColor(str: string) {
  const colors = [
    "bg-violet-500/20 text-violet-600",
    "bg-blue-500/20 text-blue-600",
    "bg-emerald-500/20 text-emerald-600",
    "bg-amber-500/20 text-amber-600",
    "bg-rose-500/20 text-rose-600",
    "bg-cyan-500/20 text-cyan-600",
    "bg-indigo-500/20 text-indigo-600",
    "bg-pink-500/20 text-pink-600",
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function getRoleBadgeStyle(role: UserRole) {
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
  onView: (member: Member) => void,
  onEdit: (member: Member) => void,
  onRemove: (member: Member) => void,
  ownerId?: string,
  currentUserId?: string
): ColumnDef<Member>[] => [
    {
      id: "user",
      accessorFn: (row) => `${row.name || ""} ${row.email}`,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Member
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
      cell: ({ row }) => {
        const member = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarImage src={member.image || ""} alt={member.name || "User"} className="object-cover" />
              <AvatarFallback className={`text-[10px] font-bold ${getAvatarColor(member.email)}`}>
                {member.name?.charAt(0) || member.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm truncate leading-tight">{member.name || "Anonymous Professional"}</span>
                {member.id === currentUserId && (
                  <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 font-bold uppercase tracking-widest text-[8px] py-0 px-1.5 h-4 shadow-none">
                    You
                  </Badge>
                )}
              </div>
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
      filterFn: "equals",
      enableColumnFilter: true,
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4 font-bold text-foreground hover:bg-muted/50"
          >
            Joined On
            <SortIcon isSorted={column.getIsSorted()} />
          </Button>
        )
      },
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
        const isOwner = member.id === ownerId

        const isCurrentUserRow = member.id === currentUserId

        if (isCurrentUserRow) {
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
                    <Badge variant="outline" className="bg-blue-50/50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 font-bold uppercase tracking-widest text-[9px] py-0 px-2 h-5 shadow-none">
                      You
                    </Badge>
                  </div>
                  <DropdownMenuSeparator className="opacity-40" />
                  <DropdownMenuItem onSelect={() => onView(member)} className="gap-2 cursor-pointer py-2.5 rounded-xl font-semibold text-sm">
                    <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="opacity-40" />
                  <LeaveOrgMenuItem />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }

        if (isOwner) {
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
                    <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
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
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Open menu</span>
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" color="currentColor" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  Actions
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onView(member)}>
                  <HugeiconsIcon icon={ViewIcon} className="h-4 w-4" color="currentColor" />
                  View Details
                </DropdownMenuItem>

                {member.id !== currentUserId && (
                  <>
                    <DropdownMenuItem onSelect={() => onEdit(member)}>
                      <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4" color="currentColor" />
                      Edit Access
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => onRemove(member)}
                      variant="destructive"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        className="h-4 w-4"
                        color="currentColor"
                      />
                      Remove
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

function LeaveOrgMenuItem() {
  const router = useRouter()
  return (
    <DropdownMenuItem
      variant="destructive"
      onSelect={() => router.push("/user/settings?tab=danger")}
    >
      <HugeiconsIcon icon={LogoutSquare01Icon} className="h-4 w-4" color="currentColor" />
      Leave Organization
    </DropdownMenuItem>
  )
}
