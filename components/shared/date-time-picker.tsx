"use client"

import * as React from "react"
import { format, isBefore } from "date-fns"
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
import { TimePicker } from "@/components/ui/time-picker"

interface DateTimePickerProps {
  date?: Date
  onChange?: (date: Date) => void
  label?: string
  id?: string
  minDate?: Date
  disabled?: boolean
}

export function DateTimePicker({ date, onChange, label, minDate, disabled }: DateTimePickerProps) {
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
      {label && (
        <div className="flex justify-between items-center px-0.5">
          <span className="text-sm font-medium">{label} Date</span>
          <span className="text-sm font-medium">Time</span>
        </div>
      )}
      <div className="flex gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              disabled={disabled}
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
              disabled={(day) => {
                if (!minDate) return false
                const min = new Date(minDate)
                min.setHours(0, 0, 0, 0)
                return isBefore(day, min)
              }}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-[120px] justify-between font-normal px-3"
              disabled={disabled}
            >
              {format(selectedDate, "hh:mm a")}
              <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <TimePicker value={selectedDate} onChange={handleTimeChange} minDate={minDate} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
