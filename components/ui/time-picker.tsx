"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1)   // [1..12]
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5)     // [0,5,10,...,55]
const PERIODS: ("AM" | "PM")[] = ["AM", "PM"]

const ITEM_H = 36 // px — height of each scroll item

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

/** Snap-scroll a column to the given index */
function scrollToIndex(el: HTMLDivElement | null, index: number, smooth = true) {
  if (!el) return
  el.scrollTo({ top: index * ITEM_H, behavior: smooth ? "smooth" : "instant" })
}

/** Return the selected index from a scroll container's scroll position */
function indexFromScroll(scrollTop: number) {
  return Math.round(scrollTop / ITEM_H)
}

// ─── ScrollColumn ─────────────────────────────────────────────────────────────
// A single vertically-scrolling drum-roll column

interface ScrollColumnProps<T extends string | number> {
  items: T[]
  selected: T
  onSelect: (value: T) => void
  format?: (v: T) => string
  disabled?: (v: T) => boolean
  className?: string
}

function ScrollColumn<T extends string | number>({
  items,
  selected,
  onSelect,
  format = (v) => String(v),
  disabled,
  className,
}: ScrollColumnProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const selectedIndex = items.indexOf(selected)

  // Guards against the scroll-debounce re-firing after a programmatic scroll
  const isProgrammaticRef = React.useRef(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // On mount: instant-scroll to the selected item (no animation)
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = Math.max(0, selectedIndex) * ITEM_H
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Programmatic scroll helper — sets the guard flag so onScroll ignores it
  const programmaticScrollTo = React.useCallback((idx: number) => {
    const el = containerRef.current
    if (!el) return
    isProgrammaticRef.current = true
    clearTimeout(timerRef.current)
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" })
    // Clear the guard after the animation settles
    timerRef.current = setTimeout(() => {
      isProgrammaticRef.current = false
    }, 400)
  }, [])

  // When the selected value changes from the outside (e.g. parent sets a new date),
  // scroll to it without triggering onSelect again.
  const prevSelectedRef = React.useRef(selected)
  React.useEffect(() => {
    if (prevSelectedRef.current === selected) return
    prevSelectedRef.current = selected
    programmaticScrollTo(selectedIndex < 0 ? 0 : selectedIndex)
  }, [selected, selectedIndex, programmaticScrollTo])

  // Clicking any item: immediately select it, then scroll it to center
  const handleClick = (item: T, idx: number) => {
    if (disabled?.(item)) return
    onSelect(item)
    programmaticScrollTo(idx)
  }

  // User-driven scroll: debounce, snap, then fire onSelect
  const onScroll = React.useCallback(() => {
    if (isProgrammaticRef.current) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const el = containerRef.current
      if (!el) return
      const idx = Math.min(Math.round(el.scrollTop / ITEM_H), items.length - 1)
      // Snap to the nearest item
      isProgrammaticRef.current = true
      el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" })
      timerRef.current = setTimeout(() => { isProgrammaticRef.current = false }, 400)
      // Select if changed
      if (items[idx] !== undefined && items[idx] !== selected && !disabled?.(items[idx])) {
        onSelect(items[idx])
      }
    }, 180)
  }, [items, selected, onSelect, disabled])

  React.useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* The scrollable drum — shows 5 items: 2 above + selected + 2 below */}
      <div
        ref={containerRef}
        onScroll={onScroll}
        className={cn(
          "h-[180px] w-[56px] overflow-y-auto overscroll-contain",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "snap-y snap-mandatory"
        )}
      >
        {/* top padding (2 items) */}
        <div className="h-[72px] shrink-0" aria-hidden />
        {items.map((item, idx) => {
          const isSelected = item === selected
          const isDisabled = disabled?.(item) ?? false
          return (
            <button
              key={item}
              type="button"
              aria-selected={isSelected}
              disabled={isDisabled}
              onClick={() => handleClick(item, idx)}
              className={cn(
                "flex h-[36px] w-[56px] snap-center items-center justify-center",
                "text-sm font-medium transition-all duration-150 select-none",
                isSelected
                  ? "text-foreground font-semibold scale-105 rounded-full"
                  : "text-muted-foreground hover:text-foreground rounded-lg",
                isDisabled && "opacity-25 cursor-not-allowed pointer-events-none"
              )}
            >
              {format(item)}
            </button>
          )
        })}
        {/* bottom padding (2 items) */}
        <div className="h-[72px] shrink-0" aria-hidden />
      </div>

      {/* Selection highlight — stripe behind the centre row */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-[72px] h-[36px]",
          "rounded-full bg-foreground/8 ring-1 ring-inset ring-border/60"
        )}
      />
    </div>
  )
}


// ─── Public API ───────────────────────────────────────────────────────────────

export interface TimePickerValue {
  hours: number    // 0-23 (24h internal)
  minutes: number  // 0, 5, 10, … 55
}

interface TimePickerProps {
  value?: Date
  onChange?: (date: Date) => void
  /** Dates before this will be disabled (time-level) */
  minDate?: Date
  className?: string
}

export function TimePicker({ value, onChange, minDate, className }: TimePickerProps) {
  const base = value ?? new Date()

  const totalHour = base.getHours()
  const period = totalHour >= 12 ? "PM" : "AM"
  const displayHour = (totalHour % 12) || 12  // 1-12

  // Snap current minutes to the nearest 5-min interval
  const snappedMinute = Math.round(base.getMinutes() / 5) * 5 % 60

  // ── Column change handlers ─────────────────────────────────────────────────

  const update = (newH24: number, newMin: number) => {
    const d = new Date(base)
    d.setHours(newH24, newMin, 0, 0)
    onChange?.(d)
  }

  const handleHour = (h12: number) => {
    const h24 = period === "PM"
      ? (h12 === 12 ? 12 : h12 + 12)
      : (h12 === 12 ? 0 : h12)
    update(h24, snappedMinute)
  }

  const handleMinute = (m: number) => {
    update(totalHour, m)
  }

  const handlePeriod = (p: "AM" | "PM") => {
    let h24 = totalHour
    if (p === "PM" && totalHour < 12) h24 = totalHour + 12
    if (p === "AM" && totalHour >= 12) h24 = totalHour - 12
    update(h24, snappedMinute)
  }

  // ── Disabled predicates ────────────────────────────────────────────────────

  const isHourDisabled = (h12: number) => {
    if (!minDate) return false
    const h24 = period === "PM"
      ? (h12 === 12 ? 12 : h12 + 12)
      : (h12 === 12 ? 0 : h12)
    const test = new Date(base)
    test.setHours(h24, snappedMinute, 0, 0)
    return test < minDate
  }

  const isMinuteDisabled = (m: number) => {
    if (!minDate) return false
    const test = new Date(base)
    test.setHours(totalHour, m, 0, 0)
    return test < minDate
  }

  const isPeriodDisabled = (p: "AM" | "PM") => {
    if (!minDate) return false
    let h24 = totalHour
    if (p === "PM" && totalHour < 12) h24 = totalHour + 12
    if (p === "AM" && totalHour >= 12) h24 = totalHour - 12
    const test = new Date(base)
    test.setHours(h24, snappedMinute, 0, 0)
    return test < minDate
  }

  return (
    <div
      role="group"
      aria-label="Time picker"
      className={cn("flex items-center gap-1 select-none", className)}
    >
      {/* Column labels */}
      <div className="flex flex-col items-center gap-0">
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Hr
        </span>
        <ScrollColumn
          items={HOURS_12}
          selected={displayHour}
          onSelect={handleHour}
          format={pad}
          disabled={isHourDisabled}
        />
      </div>

      {/* Separator */}
      <span className="mb-1 mt-[calc(1em+4px)] text-base font-bold text-muted-foreground/60 select-none">
        :
      </span>

      <div className="flex flex-col items-center gap-0">
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Min
        </span>
        <ScrollColumn
          items={MINUTES}
          selected={snappedMinute}
          onSelect={handleMinute}
          format={pad}
          disabled={isMinuteDisabled}
        />
      </div>

      {/* Separator */}
      <div className="mx-0.5 mb-1 mt-[calc(1em+4px)] h-[180px] w-px bg-border/50" aria-hidden />

      <div className="flex flex-col items-center gap-0">
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          AM/PM
        </span>
        <ScrollColumn
          items={PERIODS}
          selected={period}
          onSelect={handlePeriod as (v: string | number) => void}
          disabled={(p) => isPeriodDisabled(p as "AM" | "PM")}
          className="w-[52px]"
        />
      </div>
    </div>
  )
}
