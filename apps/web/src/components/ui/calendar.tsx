import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/utils/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar-base"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { SelectSingleEventHandler } from "react-day-picker"

interface CalendarDatePickerProps {
  date?: Date
  onSelect?: SelectSingleEventHandler
}

export function CalendarDatePicker({ date, onSelect }: CalendarDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect as any} /* cast to satisfy strict signature */
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}