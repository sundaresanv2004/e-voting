"use client"

import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import * as React from "react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, ArrowLeft01Icon, ArrowRight01Icon, FilterIcon, Tick01Icon, Cancel01Icon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  emptyMessage?: string
  onRowClick?: (row: TData) => void
  searchKey?: string
}

export function VoterDataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No voters found.",
  onRowClick,
  searchKey = "name",
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  })

  // Get counts for badges
  const totalCount = data.length
  const votedCount = data.filter((item: any) => !!item.ballot).length
  const notVotedCount = totalCount - votedCount

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20 p-4 rounded-2xl border border-dashed">
        <Tabs 
          defaultValue="all" 
          className="w-full sm:w-auto"
          onValueChange={(value) => {
            if (value === "all") {
              table.getColumn("status")?.setFilterValue(undefined)
            } else {
              table.getColumn("status")?.setFilterValue(value)
            }
          }}
        >
          <TabsList className="bg-background shadow-sm border p-1 h-10">
            <TabsTrigger value="all" className="gap-2 px-4 data-[state=active]:bg-muted">
              <HugeiconsIcon icon={UserGroupIcon} className="h-3.5 w-3.5" />
              <span>All</span>
              <span className="ml-1 text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded-full opacity-70">{totalCount}</span>
            </TabsTrigger>
            <TabsTrigger value="voted" className="gap-2 px-4 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600">
              <HugeiconsIcon icon={Tick01Icon} className="h-3.5 w-3.5" />
              <span>Voted</span>
              <span className="ml-1 text-[10px] font-bold bg-green-500/10 px-1.5 py-0.5 rounded-full">{votedCount}</span>
            </TabsTrigger>
            <TabsTrigger value="not-voted" className="gap-2 px-4 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600">
              <HugeiconsIcon icon={Cancel01Icon} className="h-3.5 w-3.5" />
              <span>Not Voted</span>
              <span className="ml-1 text-[10px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-full">{notVotedCount}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 flex-1 sm:justify-end">
          <div className="relative max-w-sm flex-1">
            <HugeiconsIcon 
              icon={Search01Icon} 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" 
            />
            <Input
              placeholder={`Search by ${searchKey}...`}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="pl-10 h-10 bg-background border-muted-foreground/20 focus-visible:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-10 w-10 p-0 bg-background"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-10 w-10 p-0 bg-background"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border bg-card/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-bold text-foreground h-11 px-6 text-xs uppercase tracking-widest opacity-70">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "hover:bg-muted/30 transition-colors border-b last:border-0",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground italic">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest opacity-40">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </p>
        <div className="flex items-center gap-1.5">
           <span className="text-xs font-bold text-muted-foreground leading-none mr-2">{table.getFilteredRowModel().rows.length} Total Voters</span>
        </div>
      </div>
    </div>
  )
}
