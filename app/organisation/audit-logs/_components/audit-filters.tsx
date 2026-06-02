"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AuditEntityType, AuditStatus } from "@prisma/client"
import { Search01Icon, Calendar01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { DateRange } from "react-day-picker"

interface AuditFiltersProps {
  q?: string
  entityTypeParam?: string
  statusParam?: string
  fromParam?: string
  toParam?: string
}

export function AuditFilters({ q, entityTypeParam, statusParam, fromParam, toParam }: AuditFiltersProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : undefined,
    to: toParam ? new Date(toParam) : undefined,
  })

  return (
    <Card>
      <CardContent className="px-4 md:px-6 py-2">
        <form method="GET" action="/organisation/audit-logs" className="flex flex-col gap-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end">
            {/* Search */}
            <div className="space-y-1.5 flex-1 w-full lg:col-span-1">
              <label htmlFor="q" className="text-xs font-bold text-muted-foreground tracking-wide">Search</label>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <HugeiconsIcon icon={Search01Icon} className="h-4 w-4" />
                </InputGroupAddon>
                <InputGroupInput
                  id="q"
                  name="q"
                  placeholder="Search action, user, or desc..."
                  defaultValue={q}
                />
              </InputGroup>
            </div>

            {/* Entity Filter */}
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-bold text-muted-foreground tracking-wide">Entity Type</label>
              <Select name="entityType" defaultValue={entityTypeParam || "ALL"}>
                <SelectTrigger className="w-full rounded-3xl">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Entities</SelectLabel>
                    <SelectItem value="ALL">All Entities</SelectItem>
                    {Object.values(AuditEntityType).map((et) => (
                      <SelectItem key={et} value={et}>{et}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-bold text-muted-foreground tracking-wide">Status</label>
              <Select name="status" defaultValue={statusParam || "ALL"}>
                <SelectTrigger className="w-full rounded-3xl">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Statuses</SelectLabel>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    {Object.values(AuditStatus).map((as) => (
                      <SelectItem key={as} value={as}>{as}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            <div className="space-y-1.5 flex-1 w-full lg:col-span-1">
              <label className="text-xs font-bold text-muted-foreground tracking-wide">Date Range</label>
              <input type="hidden" name="from" value={date?.from ? format(date.from, "yyyy-MM-dd") : ""} />
              <input type="hidden" name="to" value={date?.to ? format(date.to, "yyyy-MM-dd") : ""} />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left font-normal overflow-hidden rounded-3xl border border-transparent bg-input/50 hover:bg-input/60",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end border-t border-border/30 pt-3">
            <div className="flex items-center gap-3">
              {Boolean(q || entityTypeParam || statusParam || fromParam || toParam) && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/organisation/audit-logs">Clear Filters</Link>
                </Button>
              )}
              <Button type="submit" size="sm">
                Apply Filters
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
