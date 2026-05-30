"use client"

import * as React from "react"
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
  Shield02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
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

import { RoleDialog } from "./role-dialog"
import { RoleDetailsSheet } from "./role-details-sheet"
import { DeleteRoleDialog } from "./delete-role-dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "name" | "order"
type SortDir = "asc" | "desc"
const PAGE_SIZE = 10

export type RoleRow = {
  id: string
  name: string
  order: number
  electionId: string
  categories: { id: string; name: string; code: string }[]
  _count: { candidates: number }
  candidates: { id: string; name: string; profileImage: string | null }[]
  createdAt: Date
  updatedAt: Date
  createdBy: { id: string; name: string | null; email: string; image: string | null } | null
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null
}

// ─── Main component ───────────────────────────────────────────────────────────

interface RolesDataTableProps {
  data: RoleRow[]
  electionId: string
  canManage: boolean
  allCategories: { id: string; name: string; code: string }[]
  electionCode: string
}

export function RolesDataTable({ data, electionId, canManage, allCategories, electionCode }: RolesDataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams.get("new") === "true"

  // Dialog / sheet state
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<RoleRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<RoleRow | null>(null)
  const [detailsTarget, setDetailsTarget] = React.useState<RoleRow | null>(null)

  // Table state
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<{ field: SortField; dir: SortDir }>({
    field: "order",
    dir: "asc",
  })
  const [page, setPage] = React.useState(1)

  // Open create dialog when ?new=true
  React.useEffect(() => {
    if (isNew) {
      setCreateOpen(true)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("new")
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }, [isNew, searchParams, router])

  React.useEffect(() => { setPage(1) }, [search])

  // ─── Filtering + Sorting ────────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    let rows = [...data]
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((r) => r.name.toLowerCase().includes(q))
    }
    rows.sort((a, b) => {
      const aVal = sort.field === "order" ? a.order : a.name.toLowerCase()
      const bVal = sort.field === "order" ? b.order : b.name.toLowerCase()
      return sort.dir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
    return rows
  }, [data, search, sort])

  // ─── Pagination ─────────────────────────────────────────────────────────────

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

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field)
      return <HugeiconsIcon icon={ArrowUpDownIcon} className="size-3.5 text-muted-foreground/50 ml-1.5" />
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

  const nextSuggestedOrder =
    data.length > 0 ? Math.max(...data.map((r) => r.order)) + 1 : 1

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <InputGroup className="flex-1 max-w-lg">
          <InputGroupAddon align="inline-start">
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search roles by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <SortHead field="name">Role Name</SortHead>
              <SortHead field="order">Order</SortHead>
              <TableHead>Categories</TableHead>
              <TableHead>Candidates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((role) => (
                <TableRow
                  key={role.id}
                  className="group cursor-pointer"
                  onClick={() => setDetailsTarget(role)}
                >
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>
                    <code className="px-2 py-0.5 rounded-md bg-muted text-xs font-mono">
                      #{role.order}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.categories.length > 0 ? (
                        role.categories.slice(0, 3).map((cat) => (
                          <Badge key={cat.id} variant="secondary" className="text-xs shadow-none">
                            {cat.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">None</span>
                      )}
                      {role.categories.length > 3 && (
                        <Badge variant="outline" className="text-xs shadow-none">
                          +{role.categories.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="shadow-none">
                      {role._count.candidates} {role._count.candidates === 1 ? "Candidate" : "Candidates"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="size-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Open menu</span>
                          <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setDetailsTarget(role)}>
                          <HugeiconsIcon icon={ViewIcon} data-icon="inline-start" />
                          View Details
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuItem onClick={() => setEditTarget(role)}>
                              <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(role)}
                            >
                              <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                              Delete Role
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="p-0">
                  <Empty className="border-none rounded-none py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={Shield02Icon} />
                      </EmptyMedia>
                      <EmptyTitle>
                        {search ? "No roles match your search" : "No roles yet"}
                      </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <EmptyDescription>
                        {search
                          ? "Try adjusting your search to find what you're looking for."
                          : "Create the positions that candidates will contest for in this election."}
                      </EmptyDescription>
                      {!search && canManage && (
                        <Button onClick={() => setCreateOpen(true)}>
                          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                          Create Role
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
            {filtered.length} role{filtered.length !== 1 ? "s" : ""}
          </p>
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto">
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
      <RoleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        electionId={electionId}
        nextSuggestedOrder={nextSuggestedOrder}
        allCategories={allCategories}
        electionCode={electionCode}
      />
      <RoleDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        electionId={electionId}
        role={editTarget ?? undefined}
        nextSuggestedOrder={nextSuggestedOrder}
        allCategories={allCategories}
        electionCode={electionCode}
      />
      <DeleteRoleDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        role={deleteTarget}
        electionId={electionId}
      />
      <RoleDetailsSheet
        open={!!detailsTarget}
        onOpenChange={(open) => !open && setDetailsTarget(null)}
        role={detailsTarget}
        canManage={canManage}
        onEdit={(role) => setEditTarget(role as RoleRow)}
        onDelete={(role) => setDeleteTarget(role as RoleRow)}
      />
    </div>
  )
}
