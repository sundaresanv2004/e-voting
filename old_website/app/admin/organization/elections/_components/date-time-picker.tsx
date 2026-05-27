"use client"

import * as React from "react"
import { format, setHours, setMinutes, isBefore, isAfter, addHours } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Clock01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TimePickerProps {
  date?: Date
  onChange?: (date: Date) => void
  minDate?: Date
}

function TimePicker({ date, onChange, minDate }: TimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)
  const ampm = ["AM", "PM"]

  const selectedDate = date || new Date()

  const currentHour = selectedDate.getHours()
  const displayHour = currentHour % 12 || 12
  const currentMinute = selectedDate.getMinutes()
  const currentAMPM = currentHour >= 12 ? "PM" : "AM"

  // Find the closest 5-min interval for highlighting
  const closestMinute = Math.round(currentMinute / 5) * 5

  const handleTimeChange = (type: "hour" | "minute" | "ampm", value: string | number) => {
    const newDate = new Date(selectedDate)

    if (type === "hour") {
      const h = value as number
      const isPM = currentAMPM === "PM"
      newDate.setHours(isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h))
    } else if (type === "minute") {
      newDate.setMinutes(value as number)
    } else if (type === "ampm") {
      const isPM = value === "PM"
      const h = displayHour
      newDate.setHours(isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h))
    }

    onChange?.(newDate)
  }

  // Check if a specific time is before minDate (only if they are on the same day)
  const isTimeDisabled = (type: "hour" | "minute" | "ampm", value: string | number) => {
    if (!minDate) return false
    
    // Create a candidate date to test
    const testDate = new Date(selectedDate)
    if (type === "hour") {
      const h = value as number
      const isPM = currentAMPM === "PM"
      testDate.setHours(isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h))
    } else if (type === "minute") {
      testDate.setMinutes(value as number)
    } else if (type === "ampm") {
      const isPM = value === "PM"
      const h = displayHour
      testDate.setHours(isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h))
    }
    
    return isBefore(testDate, minDate)
  }

  return (
    <div className="flex gap-1 p-2">
      {/* Hours */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium text-muted-foreground text-center mb-1">Hr</span>
        <div className="grid grid-cols-3 gap-0.5">
          {hours.map((h) => {
             const disabled = isTimeDisabled("hour", h)
             return (
              <Button
                key={h}
                variant={displayHour === h ? "default" : "ghost"}
                disabled={disabled}
                size="sm"
                className={cn("h-8 w-8 p-0 text-xs", displayHour !== h && "text-muted-foreground")}
                onClick={() => handleTimeChange("hour", h)}
              >
                {h.toString().padStart(2, "0")}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="w-px bg-border mx-1" />

      {/* Minutes */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium text-muted-foreground text-center mb-1">Min</span>
        <div className="grid grid-cols-3 gap-0.5">
          {minutes.map((m) => {
             const disabled = isTimeDisabled("minute", m)
             return (
              <Button
                key={m}
                variant={closestMinute === m ? "default" : "ghost"}
                disabled={disabled}
                size="sm"
                className={cn("h-8 w-8 p-0 text-xs", closestMinute !== m && "text-muted-foreground")}
                onClick={() => handleTimeChange("minute", m)}
              >
                {m.toString().padStart(2, "0")}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="w-px bg-border mx-1" />

      {/* AM/PM */}
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium text-muted-foreground text-center mb-1">Period</span>
        <div className="flex flex-col gap-0.5">
          {ampm.map((a) => {
             const disabled = isTimeDisabled("ampm", a)
             return (
              <Button
                key={a}
                variant={currentAMPM === a ? "default" : "ghost"}
                disabled={disabled}
                size="sm"
                className={cn("h-8 w-12 p-0 text-xs", currentAMPM !== a && "text-muted-foreground")}
                onClick={() => handleTimeChange("ampm", a)}
              >
                {a}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface DateTimePickerProps {
  date?: Date
  onChange?: (date: Date) => void
  label?: string
  id?: string
  minDate?: Date
}

export function DateTimePicker({ date, onChange, label, minDate }: DateTimePickerProps) {
  const selectedDate = date || new Date()

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return
    const combined = new Date(newDate)
    combined.setHours(selectedDate.getHours())
    combined.setMinutes(selectedDate.getMinutes())
    
    // If combined is now before minDate, snap it to minDate
    if (minDate && isBefore(combined, minDate)) {
      onChange?.(minDate)
    } else {
      onChange?.(combined)
    }
  }

  const handleTimeChange = (newTime: Date) => {
    onChange?.(newTime)
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-0.5">
        <span className="text-sm font-medium">{label} Date</span>
        <span className="text-sm font-medium">Time</span>
      </div>
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="mr-1 h-4 w-4" />
              {date ? format(date, "MMMM do, yyyy") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              disabled={(day) => (minDate ? isBefore(day, new Date(minDate.setHours(0, 0, 0, 0))) : false)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[120px] justify-between font-normal px-3"
            >
              {format(selectedDate, "hh:mm a")}
              <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <TimePicker date={selectedDate} onChange={handleTimeChange} minDate={minDate} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
