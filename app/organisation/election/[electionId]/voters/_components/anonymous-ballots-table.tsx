"use client"

import * as React from "react"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { GridIcon, Search01Icon, LockKeyIcon, MoreVerticalCircle01Icon, ViewIcon, Delete02Icon } from "@hugeicons/core-free-icons"

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
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { DataExport } from "@/components/ui/data-export"

import { AnonymousBallotSheet } from "./anonymous-ballot-sheet"
import { DeleteAnonymousBallotDialog } from "./delete-anonymous-ballot-dialog"

export type AnonymousBallotRow = {
  id: string
  submissionKey: string
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  category: { id: string; name: string; code: string } | null
}

interface AnonymousBallotsTableProps {
  data: AnonymousBallotRow[]
  electionId: string
  canManage: boolean
}

export function AnonymousBallotsTable({
  data,
  electionId,
  canManage,
}: AnonymousBallotsTableProps) {
  const [search, setSearch] = React.useState("")
  const [detailsTarget, setDetailsTarget] = React.useState<AnonymousBallotRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<AnonymousBallotRow | null>(null)

  const filtered = React.useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(
      (r) =>
        r.submissionKey.toLowerCase().includes(q) ||
        r.ipAddress?.toLowerCase().includes(q) ||
        r.category?.name.toLowerCase().includes(q)
    )
  }, [data, search])

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <InputGroup className="max-w-md w-full">
          <InputGroupAddon align="inline-start">
            <HugeiconsIcon icon={Search01Icon} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by submission key, IP, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <DataExport
          data={filtered}
          filename="anonymous_ballots"
          transformData={(data) => {
            return data.map((b) => ({
              "Submission Key": b.submissionKey,
              "Category": b.category?.name || "Global",
              "IP Address": b.ipAddress || "Unknown",
              "User Agent": b.userAgent || "Unknown",
              "Submitted At": new Date(b.createdAt).toLocaleString(),
            }))
          }}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Submission Key</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((ballot) => (
                <TableRow 
                  key={ballot.id}
                  className="group cursor-pointer"
                  onClick={() => setDetailsTarget(ballot)}
                >
                  <TableCell>
                    <code className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-mono">
                      {ballot.submissionKey}
                    </code>
                  </TableCell>
                  <TableCell>
                    {ballot.category ? (
                      <Badge variant="infoOutline" className="shadow-none gap-1.5">
                        <HugeiconsIcon icon={GridIcon} className="size-3" />
                        {ballot.category.name}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="shadow-none opacity-60">
                        Global
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ballot.ipAddress || "Unknown"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(ballot.createdAt), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="size-8 p-0"
                        >
                          <span className="sr-only">Open menu</span>
                          <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setDetailsTarget(ballot)}>
                          <HugeiconsIcon icon={ViewIcon} data-icon="inline-start" />
                          View Details
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleteTarget(ballot)}
                            >
                              <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
                              Delete Ballot
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
                        <HugeiconsIcon icon={LockKeyIcon} />
                      </EmptyMedia>
                      <EmptyTitle>No anonymous ballots found</EmptyTitle>
                    </EmptyHeader>
                    <EmptyContent>
                      <EmptyDescription>
                        {data.length > 0
                          ? "Try adjusting your search criteria."
                          : "No anonymous ballots have been submitted yet."}
                      </EmptyDescription>
                    </EmptyContent>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AnonymousBallotSheet
        open={!!detailsTarget}
        onOpenChange={(open) => !open && setDetailsTarget(null)}
        ballot={detailsTarget}
        canManage={canManage}
        onDelete={(ballot) => setDeleteTarget(ballot)}
      />

      <DeleteAnonymousBallotDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        ballot={deleteTarget}
        electionId={electionId}
      />
    </div>
  )
}
