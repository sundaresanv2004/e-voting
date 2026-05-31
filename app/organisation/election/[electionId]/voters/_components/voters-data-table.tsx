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
  UserCircleIcon,
  PlusSignIcon,
  Tick01Icon,
  Cancel01Icon,
  GridIcon,
  CloudUploadIcon,
  FilterIcon,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

import { VoterDialog, type CategoryOption } from "./voter-dialog"
import { VoterDetailsSheet, type VoterDetails } from "./voter-details-sheet"
import { DeleteVoterDialog } from "./delete-voter-dialog"
import { ImportVotersDialog } from "./import-voters-dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "name" | "category" | "voted"
type SortDir = "asc" | "desc"
const PAGE_SIZE = 15

export type VoterRow = {
  id: string
  name: string
  uniqueId: string
  categoryId: string | null
  electionId: string
  category: { id: string; name: string; code: string } | null
  ballots: { id: string; createdAt: Date }[]
  createdAt: Date
  updatedAt: Date
  createdBy: { id: string; name: string | null; email: string; image: string | null } | null
  updatedBy: { id: string; name: string | null; email: string; image: string | null } | null
}

// ─── Main component ───────────────────────────────────────────────────────────

interface VotersDataTableProps {
  data: VoterRow[]
  electionId: string
  allCategories: CategoryOption[]
  canManage: boolean
}

export function VotersDataTable({
  data,
  electionId,
  allCategories,
  canManage,
}: VotersDataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams.get("new") === "true"

  // Dialog / sheet state
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<VoterRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<VoterRow | null>(null)
  const [detailsTarget, setDetailsTarget] = React.useState<VoterRow | null>(null)

  // Table state
  const [search, setSearch] = React.useState("")
  const [sort, setSort] = React.useState<{ field: SortField; dir: SortDir }>({
    field: "name",
    dir: "asc",
  })
  const [page, setPage] = React.useState(1)
  const [statusFilter, setStatusFilter] = React.useState("ALL")

  // Open create dialog when ?new=true
  React.useEffect(() => {
    if (isNew) {
      setCreateOpen(true)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("new")
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }, [isNew, searchParams, router])

  React.useEffect(() => { setPage(1) }, [search, statusFilter])

  // ─── Filtering + Sorting ──────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    let rows = [...data]

    // Status filter
    if (statusFilter === "VOTED") {
      rows = rows.filter((r) => r.ballots.length > 0)
    } else if (statusFilter === "PENDING") {
      rows = rows.filter((r) => r.ballots.length === 0)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.uniqueId.toLowerCase().includes(q) ||
          r.category?.name.toLowerCase().includes(q)
      )
    }
    rows.sort((a, b) => {
      let aVal: string | number
      let bVal: string | number
      if (sort.field === "voted") {
        aVal = a.ballots.length > 0 ? 1 : 0
        bVal = b.ballots.length > 0 ? 1 : 0
      } else if (sort.field === "category") {
        aVal = a.category?.name?.toLowerCase() ?? "zzz"
        bVal = b.category?.name?.toLowerCase() ?? "zzz"
      } else {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      }
      if (aVal === bVal) return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
      return sort.dir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
    return rows
  }, [data, search, sort, statusFilter])

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
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <InputGroup className="max-w-lg w-full">
            <InputGroupAddon align="inline-start">
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by name, ID or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <HugeiconsIcon icon={FilterIcon} className="size-4 text-muted-foreground mr-1" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Voting Status</SelectLabel>
                <SelectItem value="ALL">All voters</SelectItem>
                <SelectItem value="VOTED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <DataExport
          data={filtered}
          filename="voters"
          transformData={(data) => {
            return data.map((v) => ({
              "Unique ID": v.uniqueId,
              "Full Name": v.name,
              "Category": v.category?.name || "Global (All Categories)",
              "Category Code": v.category?.code || "—",
              "Voting Status": v.ballots.length > 0 ? "Voted" : "Pending",
              "Voted At": v.ballots[0]?.createdAt ? new Date(v.ballots[0].createdAt).toLocaleString() : "—",
              "Added By": v.createdBy?.name || v.createdBy?.email || "Unknown",
              "Registered At": new Date(v.createdAt).toLocaleString(),
            }))
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <SortHead field="name">Voter</SortHead>
              <TableHead>Unique ID</TableHead>
              <SortHead field="category">Category</SortHead>
              <SortHead field="voted">Status</SortHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((voter) => {
                const hasVoted = voter.ballots.length > 0
                return (
                  <TableRow
                    key={voter.id}
                    className="group cursor-pointer"
                    onClick={() => setDetailsTarget(voter)}
                  >
                    {/* Name + avatar */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted border text-sm font-bold text-muted-foreground">
                          {voter.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium">{voter.name}</span>
                      </div>
                    </TableCell>

                    {/* Unique ID */}
                    <TableCell>
                      <code className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-mono">
                        {voter.uniqueId}
                      </code>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      {voter.category ? (
                        <Badge variant="infoOutline" className="shadow-none gap-1.5">
                          <HugeiconsIcon icon={GridIcon} className="size-3" />
                          {voter.category.name}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shadow-none opacity-60">
                          Global
                        </Badge>
                      )}
                    </TableCell>

                    {/* Voting status */}
                    <TableCell>
                      {hasVoted ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-none gap-1.5">
                          <HugeiconsIcon icon={Tick01Icon} className="size-3" />
                          Voted
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-none gap-1.5">
                          <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>

                    {/* Registered date */}
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(voter.createdAt), "MMM d, yyyy")}
                      </span>
                    </TableCell>

                    {/* Actions */}
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
                          <DropdownMenuItem onClick={() => setDetailsTarget(voter)}>
                            <HugeiconsIcon icon={ViewIcon} data-icon="inline-start" />
                            View Details
                          </DropdownMenuItem>
                          {canManage && (
                            <>
                              <DropdownMenuItem onClick={() => setEditTarget(voter)}>
                                <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                                Edit Voter
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                disabled={hasVoted}
                                onClick={() => setDeleteTarget(voter)}
                              >
                                <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                                {hasVoted ? "Cannot Delete" : "Remove Voter"}
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
                <TableCell colSpan={6} className="p-0">
                  <Empty className="border-none rounded-none py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={UserCircleIcon} />
                      </EmptyMedia>
                      <EmptyTitle>
                        {data.length > 0
                          ? "No voters match your filters"
                          : "No voters yet"}
                      </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <EmptyDescription>
                        {data.length > 0
                          ? "Try adjusting your search or filter to find what you're looking for."
                          : "Register voters individually or import them in bulk via CSV or Excel."}
                      </EmptyDescription>
                      {data.length === 0 && canManage && (
                        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                          <ImportVotersDialog electionId={electionId} allCategories={allCategories} />
                          <Button onClick={() => setCreateOpen(true)}>
                            <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                            Add Voter
                          </Button>
                        </div>
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
            {filtered.length} voter{filtered.length !== 1 ? "s" : ""}
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
      <VoterDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        electionId={electionId}
        allCategories={allCategories}
      />
      <VoterDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        electionId={electionId}
        allCategories={allCategories}
        voter={editTarget ? {
          id: editTarget.id,
          name: editTarget.name,
          uniqueId: editTarget.uniqueId,
          categoryId: editTarget.categoryId,
        } : undefined}
      />
      <DeleteVoterDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        voter={deleteTarget}
        electionId={electionId}
      />
      <VoterDetailsSheet
        open={!!detailsTarget}
        onOpenChange={(open) => !open && setDetailsTarget(null)}
        voter={detailsTarget as VoterDetails | null}
        canManage={canManage}
        onEdit={(v) => setEditTarget(v as VoterRow)}
        onDelete={(v) => setDeleteTarget(v as VoterRow)}
      />
    </div>
  )
}
