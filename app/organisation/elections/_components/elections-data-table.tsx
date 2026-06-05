"use client"

import * as React from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalCircle01Icon,
  ViewIcon,
  Edit02Icon,
  Delete02Icon,
  Settings02Icon,
  PauseIcon,
  PlayIcon,
  Search01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  ArrowUpDownIcon,
  FilterIcon,
  MapsIcon,
} from "@hugeicons/core-free-icons"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

import { ElectionDialog } from "./election-dialog"
import { DeleteElectionDialog } from "./delete-election-dialog"
import { ElectionDetailsSheet } from "./election-details-sheet"
import { toggleElectionStatus } from "@/lib/actions/election"

// ─── Types ────────────────────────────────────────────────────────────────────

type SortField = "name" | "status" | "startTime" | "endTime"
type SortDir = "asc" | "desc"

const PAGE_SIZE = 10

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="successOutline">Active</Badge>
    case "UPCOMING":
      return <Badge variant="infoOutline">Upcoming</Badge>
    case "COMPLETED":
      return <Badge variant="secondary">Completed</Badge>
    case "PAUSED":
      return <Badge variant="warningOutline">Paused</Badge>
    case "CANCELLED":
      return <Badge variant="destructiveOutline">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ field, sort }: { field: SortField; sort: { field: SortField; dir: SortDir } }) {
  if (sort.field !== field) return <HugeiconsIcon icon={ArrowUpDownIcon} className="size-3.5 text-muted-foreground/50 ml-1.5" />
  return sort.dir === "asc"
    ? <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5 ml-1.5" />
    : <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5 ml-1.5" />
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ElectionsDataTableProps {
  data: any[]
  isAdmin?: boolean
}

export function ElectionsDataTable({ data, isAdmin = false }: ElectionsDataTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNew = searchParams.get("new") === "true"

  // Dialog / sheet state
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editElection, setEditElection] = React.useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null)
  const [detailsTarget, setDetailsTarget] = React.useState<any | null>(null)

  // Table state
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [sort, setSort] = React.useState<{ field: SortField; dir: SortDir }>({ field: "startTime", dir: "desc" })
  const [page, setPage] = React.useState(1)

  // Open create dialog when ?new=true is in URL
  React.useEffect(() => {
    if (isNew) {
      setCreateOpen(true)
      const params = new URLSearchParams(searchParams.toString())
      params.delete("new")
      router.replace(`?${params.toString()}`, { scroll: false })
    }
  }, [isNew, searchParams, router])

  // Reset page whenever filters change
  React.useEffect(() => { setPage(1) }, [search, statusFilter])

  // Poll for updates every 40 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 40000)
    return () => clearInterval(interval)
  }, [router])

  // ─── Filtering + Sorting ─────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    let rows = [...data]

    // Search by name or code
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (e) => e.name.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)
      )
    }

    // Status filter
    if (statusFilter !== "ALL") {
      rows = rows.filter((e) => e.status === statusFilter)
    }

    // Sort
    rows.sort((a, b) => {
      let aVal: any = a[sort.field]
      let bVal: any = b[sort.field]

      if (sort.field === "startTime" || sort.field === "endTime") {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      } else {
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()
      }

      return sort.dir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })

    return rows
  }, [data, search, statusFilter, sort])

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

  const handleToggleStatus = async (id: string) => {
    const res = await toggleElectionStatus(id)
    if (res.success) {
      toast.success("Election status updated")
      router.refresh()
    } else {
      toast.error(res.error)
    }
  }

  // ─── Pagination page numbers ──────────────────────────────────────────────

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

  // ─── Render ───────────────────────────────────────────────────────────────

  const SortHead = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead>
      <button
        className="flex items-center font-medium text-foreground hover:text-primary transition-colors"
        onClick={() => handleSort(field)}
      >
        {children}
        <SortIcon field={field} sort={sort} />
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
            placeholder="Search by name or code..."
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
              <SelectLabel>Election Status</SelectLabel>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="UPCOMING">Upcoming</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <SortHead field="name">Name</SortHead>
              <TableHead>Code</TableHead>
              <SortHead field="status">Status</SortHead>
              <SortHead field="startTime">Start</SortHead>
              <SortHead field="endTime">End</SortHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length > 0 ? (
              pageRows.map((election) => (
                <TableRow
                  key={election.id}
                  className="group cursor-pointer"
                  onClick={() => setDetailsTarget(election)}
                >
                  <TableCell className="font-medium">
                    <Link
                      href={`/organisation/election/${election.id}`}
                      className="hover:underline underline-offset-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {election.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <code className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-mono">
                      {election.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={election.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(election.startTime), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(election.endTime), "MMM d, yyyy")}
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
                        <DropdownMenuItem onClick={() => setDetailsTarget(election)}>
                          <HugeiconsIcon icon={ViewIcon} data-icon="inline-start" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/organisation/election/${election.id}`}>
                            <HugeiconsIcon icon={Settings02Icon} data-icon="inline-start" />
                            Manage
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditElection(election)}>
                              <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                              Edit Schedule
                            </DropdownMenuItem>
                            {(election.status === "ACTIVE" || election.status === "PAUSED") && (
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(election.id)}
                                variant={election.status === "ACTIVE" ? "warning" : "success"}
                              >
                                <HugeiconsIcon
                                  icon={election.status === "ACTIVE" ? PauseIcon : PlayIcon}
                                  data-icon="inline-start"
                                />
                                {election.status === "ACTIVE" ? "Pause" : "Resume"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(election)}
                              variant="destructive"
                            >
                              <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                              Delete
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
                <TableCell colSpan={6} className="p-0">
                  <Empty className="border-none rounded-none py-16">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={MapsIcon} />
                      </EmptyMedia>
                      <EmptyTitle>
                        {search || statusFilter !== "ALL"
                          ? "No elections match your filters"
                          : "No elections yet"}
                      </EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <EmptyDescription>
                        {search || statusFilter !== "ALL"
                          ? "Try adjusting your search or filter to find what you're looking for."
                          : "Get started by creating your first election for this organization."}
                      </EmptyDescription>
                      {!search && statusFilter === "ALL" && (
                        <Button onClick={() => setCreateOpen(true)}>
                          Create Election
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
            {filtered.length} election{filtered.length !== 1 ? "s" : ""}
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
      <ElectionDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ElectionDialog
        open={!!editElection}
        onOpenChange={(open) => !open && setEditElection(null)}
        election={editElection}
      />
      <DeleteElectionDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        election={deleteTarget}
      />
      <ElectionDetailsSheet
        open={!!detailsTarget}
        onOpenChange={(open) => !open && setDetailsTarget(null)}
        election={detailsTarget}
        onEdit={(election) => setEditElection(election)}
        onDelete={(election) => setDeleteTarget(election)}
        isAdmin={isAdmin}
      />
    </div>
  )
}
