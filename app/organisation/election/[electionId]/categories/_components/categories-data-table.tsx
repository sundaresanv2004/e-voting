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
  GridIcon,
  PlusSignIcon,
  LockIcon,
} from "@hugeicons/core-free-icons"
import { useSearchParams, useRouter } from "next/navigation"

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

import { DataExport } from "@/components/ui/data-export"

import { CategoryDialog } from "./category-dialog"
import { CategoryDetailsSheet } from "./category-details-sheet"
import { DeleteCategoryDialog } from "./delete-category-dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "name" | "roles"
type SortDir = "asc" | "desc"
const PAGE_SIZE = 10

export type CategoryRow = {
  id: string
  name: string
  code: string
  electionId: string
  electionCode: string // to detect default category
  roles: { id: string; name: string; order: number }[]
  createdAt: Date
  updatedAt: Date
  createdBy: { id: string; name: string | null; email: string; image: string | null } | null
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null
}

export type RoleOption = { id: string; name: string; order: number }

// ─── Main component ───────────────────────────────────────────────────────────

interface CategoriesDataTableProps {
  data: CategoryRow[]
  electionId: string
  electionCode: string
  allRoles: RoleOption[]
  canManage: boolean
}

export function CategoriesDataTable({
  data,
  electionId,
  electionCode,
  allRoles,
  canManage,
}: CategoriesDataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams.get("new") === "true"

  // Dialog / sheet state
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<CategoryRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<CategoryRow | null>(null)
  const [detailsTarget, setDetailsTarget] = React.useState<CategoryRow | null>(null)

  // Table state
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<{ field: SortField; dir: SortDir }>({
    field: "name",
    dir: "asc",
  })
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    if (isNew) {
      setCreateOpen(true)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("new")
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }, [isNew, searchParams, router])

  React.useEffect(() => { setPage(1) }, [search])

  const isDefault = (cat: CategoryRow) => cat.code === electionCode

  // ─── Filtering + Sorting ──────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    let rows = [...data]
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
      )
    }
    rows.sort((a, b) => {
      const aVal = sort.field === "roles" ? a.roles.length : a.name.toLowerCase()
      const bVal = sort.field === "roles" ? b.roles.length : b.name.toLowerCase()
      return sort.dir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
    return rows
  }, [data, search, sort])

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

  // ─── Helpers ─────────────────────────────────────────────────────────────

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

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <InputGroup className="flex-1 max-w-lg">
          <InputGroupAddon align="inline-start">
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search categories by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
        
        <DataExport
          data={filtered}
          filename="categories"
          transformData={(data) => {
            return data.map((c) => ({
              "Name": c.name,
              "Code": c.code,
              "Type": isDefault(c) ? "Default" : "Custom",
              "Roles": c.roles.map((r) => r.name).join(", ") || "None",
              "Role Count": c.roles.length,
              "Created By": c.createdBy?.name || c.createdBy?.email || "Unknown",
              "Registered At": new Date(c.createdAt).toLocaleString(),
            }))
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <SortHead field="name">Name</SortHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <SortHead field="roles">Roles</SortHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((category) => {
                const def = isDefault(category)
                return (
                  <TableRow
                    key={category.id}
                    className="group cursor-pointer"
                    onClick={() => setDetailsTarget(category)}
                  >
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      <code className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-mono">
                        {category.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      {def ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none gap-1.5">
                          <HugeiconsIcon icon={LockIcon} className="size-3" />
                          Default
                        </Badge>
                      ) : (
                        <Badge variant="infoOutline" className="shadow-none">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="shadow-none">
                        {category.roles.length} {category.roles.length === 1 ? "Role" : "Roles"}
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
                          <DropdownMenuItem onClick={() => setDetailsTarget(category)}>
                            <HugeiconsIcon icon={ViewIcon} data-icon="inline-start" />
                            View Details
                          </DropdownMenuItem>
                          {canManage && !def && (
                            <>
                              <DropdownMenuItem onClick={() => setEditTarget(category)}>
                                <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                                Edit Category
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setDeleteTarget(category)}
                              >
                                <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                                Delete Category
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="p-0">
                  <Empty className="border-none rounded-none py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={GridIcon} />
                      </EmptyMedia>
                      <EmptyTitle>
                        {search ? "No categories match your search" : "No categories yet"}
                      </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <EmptyDescription>
                        {search
                          ? "Try adjusting your search to find what you're looking for."
                          : "Create custom categories to group roles for specific voter groups."}
                      </EmptyDescription>
                      {!search && canManage && (
                        <Button onClick={() => setCreateOpen(true)}>
                          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                          Create Category
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

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground shrink-0">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} categor{filtered.length !== 1 ? "ies" : "y"}
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
      <CategoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        electionId={electionId}
        allRoles={allRoles}
      />
      <CategoryDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        electionId={electionId}
        category={editTarget ?? undefined}
        allRoles={allRoles}
      />
      <DeleteCategoryDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        category={deleteTarget}
        electionId={electionId}
      />
      <CategoryDetailsSheet
        open={!!detailsTarget}
        onOpenChange={(open) => !open && setDetailsTarget(null)}
        category={detailsTarget}
        electionCode={electionCode}
        canManage={canManage}
        onEdit={(cat) => setEditTarget(cat as CategoryRow)}
        onDelete={(cat) => setDeleteTarget(cat as CategoryRow)}
      />
    </div>
  )
}
