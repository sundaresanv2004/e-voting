"use client"

import * as React from "react"
import { format } from "date-fns"
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
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  date?: Date
  onChange?: (date: Date) => void
  label?: string
  id?: string
}

export function DateTimePicker({ date, onChange, label, id }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [time, setTime] = React.useState(date ? format(date, "HH:mm") : "14:23")

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return
    setSelectedDate(newDate)
    
    // Combine with current time
    const [hours, minutes] = time.split(":").map(Number)
    const combined = new Date(newDate)
    combined.setHours(hours)
    combined.setMinutes(minutes)
    
    onChange?.(combined)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTime(newTime)
    
    if (selectedDate) {
      const [hours, minutes] = newTime.split(":").map(Number)
      const combined = new Date(selectedDate)
      combined.setHours(hours)
      combined.setMinutes(minutes)
      onChange?.(combined)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>{label} Date</span>
        <span>Time</span>
      </div>
      <div className="flex gap-3 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "flex-1 justify-start text-left font-normal h-12 bg-background/50 border-muted-foreground/20",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="mr-2 h-4 w-4 text-muted-foreground" />
              {selectedDate ? format(selectedDate, "MMMM do, yyyy") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="relative w-32">
          <Input
            id={`${id}-time`}
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="h-12 bg-background/50 border-muted-foreground/20 appearance-none font-medium text-center"
          />
        </div>
      </div>
    </div>
  )
}
