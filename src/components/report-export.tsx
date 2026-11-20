'use client'

import { useState } from "react"
import { Download, CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { localDateToYmd, ymdToLocalDate } from "@/lib/business-date"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ExportOptions } from "@/lib/export-period"
import { cn } from "@/lib/utils"

// Gaya sama dengan tabs di menu-list.tsx
const TRIGGER_CLASS =
    "text-neutral-400 data-active:font-medium data-active:text-prim px-3 font-normal text-xs transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground"

/** Pilihan hanya berisi periode yang sudah final. Server menolak lagi kalau URL-nya dimanipulasi. */
export function ReportExport({ options }: { options: ExportOptions }) {
    const [tab, setTab] = useState("day")
    const [day, setDay] = useState(options.latestDay)
    const [dayOpen, setDayOpen] = useState(false)
    const [month, setMonth] = useState(options.months[0]?.value ?? "")

    const valid = tab === "day" ? day !== "" && day <= options.latestDay : month !== ""
    const href = tab === "day" ? `/report/export?date=${day}` : `/report/export?month=${month}`

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm" className="h-8 bg-prim text-xs hover:bg-prim-dark">
                    <Download className="mr-1.5 size-3.5" />
                    Export CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-sm">Export Data Penjualan</DialogTitle>
                    <DialogDescription className="text-xs">
                        Hanya periode yang sudah selesai yang bisa diekspor. Data hari ini baru tersedia setelah jam tutup, dan data bulan berjalan setelah bulan berakhir.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab} className="space-y-3">
                    <TabsList>
                        <TabsTrigger value="day" className={TRIGGER_CLASS}>Harian</TabsTrigger>
                        <TabsTrigger value="month" className={TRIGGER_CLASS}>Bulanan</TabsTrigger>
                    </TabsList>

                    <TabsContent value="day" className="space-y-1.5">
                        <span className="text-xs text-neutral-500">Tanggal</span>
                        <Popover open={dayOpen} onOpenChange={setDayOpen}>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="outline" className="h-8 w-full justify-start text-xs font-normal">
                                    <CalendarIcon className="mr-1.5 size-3.5" />
                                    {ymdToLocalDate(day).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={ymdToLocalDate(day)}
                                    defaultMonth={ymdToLocalDate(day)}
                                    onSelect={(d) => {
                                        if (d) {
                                            setDay(localDateToYmd(d))
                                            setDayOpen(false)
                                        }
                                    }}
                                    disabled={{ after: ymdToLocalDate(options.latestDay) }}
                                />
                            </PopoverContent>
                        </Popover>
                    </TabsContent>

                    <TabsContent value="month" className="space-y-1.5">
                        <label htmlFor="export-month" className="text-xs text-neutral-500">Bulan</label>
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger id="export-month" size="sm" className="w-full text-xs">
                                <SelectValue placeholder="Pilih bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {options.months.map((m) => (
                                    <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </TabsContent>
                </Tabs>

                {/* <a> biasa, bukan Link: tujuannya berkas unduhan */}
                <a
                    href={href}
                    download
                    aria-disabled={!valid}
                    className={cn(
                        buttonVariants({ size: "sm" }),
                        "h-8 w-full bg-prim text-xs hover:bg-prim-dark",
                        !valid && "pointer-events-none opacity-50"
                    )}
                >
                    <Download className="mr-1.5 size-3.5" />
                    Unduh
                </a>
            </DialogContent>
        </Dialog>
    )
}