"use client"

import * as React from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalCircle01Icon,
  ViewIcon,
  Edit02Icon,
  Delete02Icon,
  Search01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  ArrowUpDownIcon,
  FilterIcon,
  UserGroupIcon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"

import { AddMemberDialog } from "./add-member-dialog"
import { EditMemberDialog } from "./edit-member-dialog"
import { DeleteMemberDialog } from "./delete-member-dialog"
import { MemberDetailsSheet } from "./member-details-sheet"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "name" | "role" | "createdAt"
type SortDir = "asc" | "desc"

const PAGE_SIZE = 15

// ─── Main component ───────────────────────────────────────────────────────────

interface MembersDataTableProps {
  members: any[]
  currentUserId?: string
}

export function MembersDataTable({ members, currentUserId }: MembersDataTableProps) {
  // Dialog / sheet state
  const [addOpen, setAddOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null)
  const [detailsTarget, setDetailsTarget] = React.useState<any | null>(null)

  // Table state
  const [search, setSearch] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("ALL")
  const [sort, setSort] = React.useState<{ field: SortField; dir: SortDir }>({ field: "createdAt", dir: "desc" })
  const [page, setPage] = React.useState(1)

  // Reset page whenever filters change
  React.useEffect(() => { setPage(1) }, [search, roleFilter])

  // Format data with custom role from user table
  const tableData = React.useMemo(() => {
    return members.map(m => ({
      ...m,
      displayName: m.user.name || "Unknown",
      email: m.user.email,
      customRole: m.user.role || "viewer", // the exact role from User table
    }))
  }, [members])

  // ─── Filtering + Sorting ─────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    let rows = [...tableData]

    // Search by name or email
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) => r.displayName.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      )
    }

    // Role filter
    if (roleFilter !== "ALL") {
      rows = rows.filter((r) => r.customRole === roleFilter)
    }

    // Sort
    rows.sort((a, b) => {
      let aVal: any = a[sort.field === "role" ? "customRole" : sort.field]
      let bVal: any = b[sort.field === "role" ? "customRole" : sort.field]

      if (sort.field === "name") {
        aVal = a.displayName.toLowerCase()
        bVal = b.displayName.toLowerCase()
      } else if (sort.field === "createdAt") {
        aVal = new Date(a.createdAt).getTime()
        bVal = new Date(b.createdAt).getTime()
      } else {
        aVal = String(aVal || "").toLowerCase()
        bVal = String(bVal || "").toLowerCase()
      }

      return sort.dir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })

    return rows
  }, [tableData, search, roleFilter, sort])

  // ─── Pagination ───────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSort = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    )
  }

  const pageNumbers = React.useMemo(() => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (safePage > 3) pages.push("ellipsis")
      for (let i = Math.max(2, safePage - 1); i <= Math.min(totalPages - 1, safePage + 1); i++) pages.push(i)
      if (safePage < totalPages - 2) pages.push("ellipsis")
      pages.push(totalPages)
    }
    return pages
  }, [totalPages, safePage])

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) return <HugeiconsIcon icon={ArrowUpDownIcon} className="size-3.5 text-muted-foreground/50 ml-1.5" />
    return sort.dir === "asc"
      ? <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5 ml-1.5" />
      : <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5 ml-1.5" />
  }

  const SortHead = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <button
        className="flex items-center font-medium text-foreground hover:text-primary transition-colors"
        onClick={() => handleSort(field)}
      >
        {children}
        <SortIcon field={field} />
      </button>
    </TableHead>
  )

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case "org_admin":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/20">Org Admin</Badge>
      case "staff":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20">Staff</Badge>
      case "viewer":
        return <Badge className="bg-slate-500/15 text-slate-600 border-slate-500/20">Viewer</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search members by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[160px]">
            <HugeiconsIcon icon={FilterIcon} className="size-4 text-muted-foreground mr-1" />
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="org_admin">Org Admin</SelectItem>
            <SelectItem value="staff">Staff</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
          Add Member
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <SortHead field="name">User</SortHead>
              <SortHead field="role">Role</SortHead>
              <SortHead field="createdAt">Added On</SortHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((row) => {
                const fallback = row.displayName.substring(0, 2).toUpperCase()
                
                return (
                  <TableRow key={row.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          {row.user?.image && (
                            <AvatarImage src={row.user.image} alt={row.displayName} />
                          )}
                          <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                            {fallback}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{row.displayName}</span>
                          <span className="text-xs text-muted-foreground">{row.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(row.customRole)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(row.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="size-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="sr-only">Open menu</span>
                            <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => setDetailsTarget(row)}>
                            <HugeiconsIcon icon={ViewIcon} data-icon="inline-start" />
                            View Details
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => setEditTarget(row)}>
                            <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                            Edit Access
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteTarget(row)}
                            disabled={row.userId === currentUserId}
                          >
                            <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <Empty className="border-none rounded-none py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={UserGroupIcon} />
                      </EmptyMedia>
                      <EmptyTitle>
                        {search || roleFilter !== "ALL"
                          ? "No members match your filters"
                          : "No members yet"}
                      </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <EmptyDescription>
                        {search || roleFilter !== "ALL"
                          ? "Try adjusting your search or filter to find what you're looking for."
                          : "Get started by adding your team members to collaborate."}
                      </EmptyDescription>
                      {!search && roleFilter === "ALL" && (
                        <Button onClick={() => setAddOpen(true)}>
                          Add Member
                        </Button>
                      )}
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer — row count + pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground shrink-0">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} member{filtered.length !== 1 ? "s" : ""}
          </p>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)) }}
                    aria-disabled={safePage === 1}
                    className={safePage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {pageNumbers.map((p, idx) =>
                  p === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === safePage}
                        onClick={(e) => { e.preventDefault(); setPage(p) }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)) }}
                    aria-disabled={safePage === totalPages}
                    className={safePage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Dialogs */}
      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditMemberDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        member={editTarget}
      />
      <DeleteMemberDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        target={deleteTarget ? { id: deleteTarget.userId, name: deleteTarget.displayName, email: deleteTarget.email, type: "member" } : null}
      />
      <MemberDetailsSheet
        open={!!detailsTarget}
        onOpenChange={(open) => !open && setDetailsTarget(null)}
        member={detailsTarget}
      />
    </div>
  )
}
