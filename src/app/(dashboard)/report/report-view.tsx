'use client'

import Link from "next/link"
import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { DateRange } from "react-day-picker"
import NoData from "@/assets/no-data.svg"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { EmptyState } from "@/components/empty-state"
import { Stat } from "@/components/stat-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { localDateToYmd, ymdToLocalDate } from "@/lib/business-date"
import { formatRupiah } from "@/lib/format"
import { toHistoryQuery } from "@/lib/history-url"
import type { ReportResult } from "@/lib/queries/report"
import { cn } from "@/lib/utils"
import { HistoryDateRangePicker } from "../history/history-date-range-picker"
import { ReportExport } from "@/components/report-export"
import { RevenueBarChart } from "@/components/revenue-bar-chart"
import { MethodPieChart } from "@/components/method-pie-chart"

const cardClass = "rounded-xl border bg-card p-4"
const headClass = "h-9 text-xs font-medium text-neutral-400 text-center"
const cellClass = "text-xs text-center tabular-nums"

function ReportFilter({ applied }: { applied: { from: string; to: string } }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    const [range, setRange] = useState<DateRange | undefined>({
        from: ymdToLocalDate(applied.from),
        to: ymdToLocalDate(applied.to),
    })

    function apply() {
        const from = range?.from
        const to = range?.to ?? from // satu klik saja = rentang satu hari
        startTransition(() => {
            router.push(
                `${pathname}${toHistoryQuery({
                    from: from ? localDateToYmd(from) : undefined,
                    to: to ? localDateToYmd(to) : undefined,
                })}`
            )
        })
    }

    return (
        <form onSubmit={(e) => { e.preventDefault(); apply() }} className="flex items-center gap-2">
            <HistoryDateRangePicker value={range} onChange={setRange} />
            <Button type="submit" size="sm" className="h-8 bg-prim text-xs hover:bg-prim-dark" disabled={isPending}>
                {isPending ? <><Spinner className="mr-1.5" />Memuat...</> : "Terapkan"}
            </Button>
        </form>
    )
}

const shortDate = (ymd: string) => `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`
const longDate = (ymd: string) => `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}/${ymd.slice(0, 4)}`

function DailyChart({ daily }: { daily: ReportResult["daily"] }) {
    const peak = daily.reduce((a, b) => (b.total > a.total ? b : a))

    return (
        <div className={cardClass}>
            <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold">Tren Penjualan Harian</p>
                <p className="text-[11px] text-neutral-400">Total omzet (Rp) per hari pada periode terpilih. Label di bawah batang adalah tanggal (hari/bulan).</p>
            </div>
            <div className="mt-4">
                <RevenueBarChart
                    bars={daily.map((d) => ({ key: d.date, label: shortDate(d.date), value: d.total }))}
                />
            </div>
            <p className="mt-3 text-[10px] text-neutral-400">
                Hari terbaik: <span className="font-medium text-foreground">{longDate(peak.date)}</span>
                {" · "}
                {formatRupiah(peak.total)} dari {peak.count} transaksi
            </p>
        </div>
    )
}

function MenuTable({ rows, totalSales }: { rows: ReportResult["byMenu"]; totalSales: number }) {
    return (
        <div className="rounded-xl border bg-card p-4 lg:col-span-2">
            <p className="text-xs font-semibold">Penjualan per Menu</p>
            <p className="mb-3 text-[11px] text-neutral-400">Omzet memakai harga saat transaksi terjadi</p>
            <div className="max-h-96 overflow-y-auto rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className={headClass}>Menu</TableHead>
                            <TableHead className={headClass}>Terjual</TableHead>
                            <TableHead className={headClass}>Omzet</TableHead>
                            <TableHead className={headClass}>Kontribusi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((m) => (
                            <TableRow key={m.id}>
                                <TableCell className="text-xs font-medium">{m.name}</TableCell>
                                <TableCell className={cellClass}>{m.qty} porsi</TableCell>
                                <TableCell className={cn(cellClass, "font-semibold")}>{formatRupiah(m.revenue)}</TableCell>
                                <TableCell className={cellClass}>{Math.round((m.revenue / totalSales) * 100)}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function CashierCards({ rows }: { rows: ReportResult["byCashier"] }) {
    return (
        <div className="rounded-xl border bg-card p-4 lg:col-span-2">
            <p className="text-xs font-semibold">Kinerja Kasir</p>
            <p className="mb-3 text-[11px] text-neutral-400">Rigkasan transaksi dari kasir</p>
            <div className="grid gap-3 sm:grid-cols-2">
                {rows.map((c) => (
                    <div key={c.id} className="rounded-lg border p-2">
                        <div className="bg-gray-200 rounded-lg p-0.5 w-20 mx-auto"></div>
                        <div className="flex flex-col space-y-0.5 p-3 mt-1">
                            <p className="truncate text-[9px] font-medium">{c.name}</p>
                            <p className="text-md font-bold tracking-tight tabular-nums mt-0.5">{formatRupiah(c.total)}</p>
                            <p className="text-[9px] text-neutral-400">Omzet</p>
                        </div>
                        <div className="p-3 text-center border-t border-gray-200">
                            <div className="flex justify-between">
                                <p className="text-[10px] text-neutral-400">Transaksi</p>
                                <p className="text-xs font-medium text-[10px] tabular-nums">{c.count}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[10px] text-neutral-400">Rata-rata</p>
                                <p className="text-xs font-medium tracking-tight text-[10px] tabular-nums">{formatRupiah(c.average)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p className="text-[10px] text-neutral-400">Dibatalkan</p>
                                <p className={cn("text-xs font-medium text-[10px] tabular-nums", c.cancelled > 0 && "text-prim")}>{c.cancelled}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ReportView({ result }: { result: ReportResult }) {
    const { summary, change } = result

    return (
        <div className="flex min-h-svh min-w-0 flex-col gap-4 px-6 py-4">
            <div className="flex items-center justify-start gap-4">
                <SidebarTrigger className="text-neutral-300 transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" />
                <DynamicBreadcrumb />
            </div>

            <div className="flex flex-col space-y-1">
                <h1 className="text-xl font-extrabold">Laporan Penjualan</h1>
                <p className="text-xs text-neutral-400">Analisis transaksi selesai pada periode terpilih</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <ReportFilter key={`${result.range.from}|${result.range.to}`} applied={result.range} />
                <div className="flex items-center gap-2">
                    {/* Detail per transaksi tetap di Riwayat, dengan rentang yang sama */}
                    <Link
                        href={`/history${toHistoryQuery(result.range)}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 text-xs")}
                    >
                        Lihat transaksi di Riwayat
                    </Link>

                    <ReportExport options={result.exportOptions} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Total Penjualan" value={formatRupiah(summary.totalSales)} delta={{ value: change.sales, label: "periode sebelumnya" }} />
                <Stat label="Jumlah Transaksi" value={String(summary.orderCount)} delta={{ value: change.orders, label: "periode sebelumnya" }} />
                <Stat label="Rata-rata per Transaksi" value={formatRupiah(summary.average)} delta={{ value: change.average, label: "periode sebelumnya" }} />
                <Stat label="Dibatalkan" value={String(summary.cancelledCount)} />
            </div>

            {summary.orderCount === 0 ? (
                <EmptyState icon={NoData} label="Belum ada penjualan" message="Tidak ada transaksi selesai pada periode ini" />
            ) : (
                <>
                    <DailyChart daily={result.daily} />
                    <div className="grid grid-cols-5 gap-4">
                        <MethodPieChart legendColumn="grid-cols-2" flexCont="flex-wrap" colSpan="lg:col-span-3" byMethod={result.byMethod} totalSales={summary.totalSales} />
                        {/* Tabel kasir tetap tampil walau tanpa penjualan: transaksi yang dibatalkan perlu terlihat */}
                        {result.byCashier.length > 0 && <CashierCards rows={result.byCashier} />}
                    </div>
                    <MenuTable rows={result.byMenu} totalSales={summary.totalSales} />
                </>
            )
            }
        </div >
    )
}