"use client"

import * as React from "react"
import Image from "next/image"
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
  UserMultipleIcon,
  PlusSignIcon,
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
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

import { CandidateDialog } from "./candidate-dialog"
import { CandidateDetailsSheet } from "./candidate-details-sheet"
import { DeleteCandidateDialog } from "./delete-candidate-dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "name" | "role"
type SortDir = "asc" | "desc"
const PAGE_SIZE = 10

export type CandidateRow = {
  id: string
  name: string
  profileImage: string | null
  symbolImage: string | null
  role: { id: string; name: string; order: number }
  _count: { votes: number }
  createdAt: Date
  updatedAt: Date
  createdBy: { id: string; name: string | null; email: string; image: string | null } | null
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CandidatesDataTableProps {
  data: CandidateRow[]
  electionId: string
  canManage: boolean
  allRoles: { id: string; name: string; order: number }[]
}

export function CandidatesDataTable({ data, electionId, canManage, allRoles }: CandidatesDataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams.get("new") === "true"

  // Dialog / sheet state
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<CandidateRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<CandidateRow | null>(null)
  const [detailsTarget, setDetailsTarget] = React.useState<CandidateRow | null>(null)

  // Table state
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<{ field: SortField; dir: SortDir }>({
    field: "role",
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
      const aVal = sort.field === "role" ? a.role.order : a.name.toLowerCase()
      const bVal = sort.field === "role" ? b.role.order : b.name.toLowerCase()
      if (aVal === bVal) {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      }
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

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <InputGroup className="flex-1 max-w-lg">
          <InputGroupAddon align="inline-start">
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search candidates by name..."
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
              <SortHead field="name">Candidate</SortHead>
              <SortHead field="role">Role</SortHead>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((candidate) => (
                <TableRow
                  key={candidate.id}
                  className="group cursor-pointer"
                  onClick={() => setDetailsTarget(candidate)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border shrink-0">
                        {candidate.profileImage && (
                          <AvatarImage src={candidate.profileImage} alt={candidate.name} className="object-cover" />
                        )}
                        <AvatarFallback className="text-xs font-semibold">
                          {candidate.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{candidate.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        #{candidate.role.order}
                      </code>
                      <span className="text-sm">{candidate.role.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {candidate.symbolImage ? (
                      <div className="relative size-8 rounded border flex items-center justify-center bg-muted/30 overflow-hidden">
                        <Image src={candidate.symbolImage} alt="Symbol" fill className="object-contain" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None</span>
                    )}
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
                        <DropdownMenuItem onClick={() => setDetailsTarget(candidate)}>
                          <HugeiconsIcon icon={ViewIcon} data-icon="inline-start" />
                          View Details
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuItem onClick={() => setEditTarget(candidate)}>
                              <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                              Edit Candidate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(candidate)}
                            >
                              <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                              Delete Candidate
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
                <TableCell colSpan={4} className="p-0">
                  <Empty className="border-none rounded-none py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={UserMultipleIcon} />
                      </EmptyMedia>
                      <EmptyTitle>
                        {search ? "No candidates match your search" : "No candidates yet"}
                      </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <EmptyDescription>
                        {search
                          ? "Try adjusting your search to find what you're looking for."
                          : "Register candidates for the various roles in this election."}
                      </EmptyDescription>
                      {!search && canManage && (
                        <Button onClick={() => setCreateOpen(true)}>
                          <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                          Add Candidate
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
            {filtered.length} candidate{filtered.length !== 1 ? "s" : ""}
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
      <CandidateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        electionId={electionId}
        allRoles={allRoles}
      />
      <CandidateDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        electionId={electionId}
        candidate={editTarget ?? undefined}
        allRoles={allRoles}
      />
      <DeleteCandidateDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        candidate={deleteTarget}
        electionId={electionId}
      />
      <CandidateDetailsSheet
        open={!!detailsTarget}
        onOpenChange={(open) => !open && setDetailsTarget(null)}
        candidate={detailsTarget}
        canManage={canManage}
        onEdit={(candidate) => setEditTarget(candidate as CandidateRow)}
        onDelete={(candidate) => setDeleteTarget(candidate as CandidateRow)}
      />
    </div>
  )
}
