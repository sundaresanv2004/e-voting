"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import {
  Calendar01Icon,
  FilterIcon,
  Search01Icon,
  Cancel01Icon,
  Tick01Icon,
  Sorting05Icon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput
} from "@/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { AuditEntityType, AuditStatus } from "@prisma/client"

interface AuditFiltersProps {
  initialValues: {
    q: string
    entityType: string
    status: string
    from: string
    to: string
  }
  entityTypes: string[]
  auditStatuses: string[]
}

export function AuditFiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="space-y-2 lg:col-span-2">
          <Skeleton className="h-3 w-16 ml-1 rounded-full" />
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 ml-1 rounded-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 ml-1 rounded-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-2 lg:col-span-2">
          <Skeleton className="h-3 w-16 ml-1 rounded-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </div>
  )
}

export function AuditFilters({ initialValues, entityTypes, auditStatuses }: AuditFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [q, setQ] = React.useState(initialValues.q)
  const [entityType, setEntityType] = React.useState(initialValues.entityType)
  const [status, setStatus] = React.useState(initialValues.status)
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialValues.from ? new Date(initialValues.from) : undefined,
    to: initialValues.to ? new Date(initialValues.to) : undefined,
  })

  const hasFilters = Boolean(
    q ||
    (entityType && entityType !== "ALL" && entityType !== "") ||
    (status && status !== "ALL" && status !== "") ||
    date?.from ||
    date?.to
  )

  const handleApply = () => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (entityType && entityType !== "ALL") params.set("entityType", entityType)
    if (status && status !== "ALL") params.set("status", status)
    if (date?.from) params.set("from", format(date.from, "yyyy-MM-dd"))
    if (date?.to) params.set("to", format(date.to, "yyyy-MM-dd"))

    router.push(`?${params.toString()}`)
  }

  const handleReset = () => {
    setQ("")
    setEntityType("ALL")
    setStatus("ALL")
    setDate(undefined)
    router.push("/admin/organization/audit")
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {/* Search Input */}
        <div className="space-y-2 lg:col-span-2">
          <Label className="text-xs tracking-widest text-muted-foreground ml-1">Search</Label>
          <InputGroup className="bg-background/50">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Actor, action, record ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </InputGroup>
        </div>

        {/* Entity Select */}
        <div className="space-y-2">
          <Label className="text-xs tracking-widest text-muted-foreground ml-1">Entity</Label>
          <Select value={entityType || "ALL"} onValueChange={setEntityType}>
            <SelectTrigger className="bg-background/50 w-full">
              <SelectValue placeholder="All entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs uppercase tracking-wider">All Entities</SelectItem>
              {entityTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-xs uppercase tracking-wider">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Select */}
        <div className="space-y-2">
          <Label className="text-xs tracking-widest text-muted-foreground ml-1">Status</Label>
          <Select value={status || "ALL"} onValueChange={setStatus}>
            <SelectTrigger className="bg-background/50 w-full">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL" className="text-xs uppercase tracking-wider">All Statuses</SelectItem>
              {auditStatuses.map((item) => (
                <SelectItem key={item} value={item} className="text-xs uppercase tracking-wider">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label className="text-xs tracking-widest text-muted-foreground ml-1">Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full bg-background/50 justify-start text-left font-normal border-border/50",
                  !date && "text-muted-foreground"
                )}
              >
                <HugeiconsIcon icon={Calendar01Icon} className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span className="text-sm font-normal">Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-border/50" align="end">
              <Calendar
                initialFocus
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

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleApply}
        >
          <HugeiconsIcon icon={Tick01Icon} className="w-3 h-3" />
          Apply Filters
        </Button>

        {hasFilters && (
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
            Reset
          </Button>
        )}
      </div>
    </div>
  )
}
