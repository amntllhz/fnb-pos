'use client'

import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { id } from "react-day-picker/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" })

function formatRange(range?: DateRange) {
    if (!range?.from) return "Pilih tanggal"
    if (!range.to || range.to.getTime() === range.from.getTime()) return dateFormat.format(range.from)
    return `${dateFormat.format(range.from)} – ${dateFormat.format(range.to)}`
}

type Props = {
    value: DateRange | undefined
    onChange: (range: DateRange | undefined) => void
}

export function HistoryDateRangePicker({ value, onChange }: Props) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="h-8 justify-start gap-2 text-xs font-normal">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    {formatRange(value)}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                    mode="range"
                    locale={id}
                    numberOfMonths={2}
                    defaultMonth={value?.from}
                    selected={value}
                    onSelect={onChange}
                    disabled={{ after: new Date() }}
                />
            </PopoverContent>
        </Popover>
    )
}