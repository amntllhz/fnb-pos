'use client'

import Link from "next/link"
import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Download } from "lucide-react"
import type { DateRange } from "react-day-picker"
import NoData from "@/assets/no-data.svg"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { EmptyState } from "@/components/empty-state"
import { SimpleBarChart } from "@/components/simple-bar-chart"
import { Delta, Stat } from "@/components/stat-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { localDateToYmd, ymdToLocalDate } from "@/lib/business-date"
import { paymentMethodLabels } from "@/lib/constants"
import { formatRupiah } from "@/lib/format"
import { toHistoryQuery } from "@/lib/history-url"
import type { PaymentMethod } from "@/lib/order-schema"
import type { ReportResult } from "@/lib/queries/report"
import { cn } from "@/lib/utils"
import { HistoryDateRangePicker } from "../history/history-date-range-picker"

const COLORS: Record<PaymentMethod, string> = {
    CASH: "#16a34a",
    EWALLET: "#2563eb",
    BANK_TRANSFER: "#f59e0b",
    QRIS: "#8b5cf6",
}

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
            <p className="text-xs font-semibold">Tren Penjualan Harian</p>
            <p className="text-[11px] text-neutral-400">Total omzet (Rp) per hari pada periode terpilih. Label di bawah batang adalah tanggal (hari/bulan).</p>
            <div className="mt-4">
                <SimpleBarChart
                    ariaLabel="Grafik omzet per hari"
                    labelEvery={daily.length <= 10 ? 1 : Math.ceil(daily.length / 7)}
                    bars={daily.map((d) => ({
                        key: d.date,
                        label: shortDate(d.date),
                        value: d.total,
                        tooltip: `${longDate(d.date)} · ${formatRupiah(d.total)} · ${d.count} transaksi`,
                    }))}
                />
            </div>
            <p className="mt-3 text-[11px] text-neutral-500">
                Hari terbaik: <span className="font-medium text-foreground">{longDate(peak.date)}</span>
                {" · "}
                {formatRupiah(peak.total)} dari {peak.count} transaksi
            </p>
        </div>
    )
}

// ponytail: pie dari conic-gradient, tanpa library chart. Diganti saat pindah ke evilcharts.
export function MethodChart({ byMethod, totalSales }: { byMethod: ReportResult["byMethod"]; totalSales: number }) {
    let acc = 0
    const stops = byMethod.map((m) => {
        const start = acc
        acc += (m.total / totalSales) * 100
        return `${COLORS[m.method]} ${start}% ${acc}%`
    })

    return (
        <div className={cardClass}>
            <p className="text-xs font-semibold">Metode Pembayaran</p>
            <div className="mt-4 flex flex-wrap items-center gap-8">
                <div
                    role="img"
                    aria-label="Diagram pembagian metode pembayaran"
                    className="size-40 rounded-full"
                    style={{ background: `conic-gradient(${stops.join(", ")})` }}
                />
                <ul className="space-y-2 text-xs">
                    {byMethod.map((m) => (
                        <li key={m.method} className="flex items-center gap-2">
                            <span className="size-2.5 rounded-full" style={{ background: COLORS[m.method] }} />
                            <span className="w-28">{paymentMethodLabels[m.method]}</span>
                            <span className="font-medium tabular-nums">{formatRupiah(m.total)}</span>
                            <span className="tabular-nums text-neutral-400">
                                {Math.round((m.total / totalSales) * 100)}% · {m.count} transaksi
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

function MenuTable({ rows, totalSales }: { rows: ReportResult["byMenu"]; totalSales: number }) {
    return (
        <div className={cardClass}>
            <p className="text-xs font-semibold">Penjualan per Menu</p>
            <p className="mb-3 text-[11px] text-neutral-400">Diurutkan dari omzet terbesar. Omzet memakai harga saat transaksi terjadi.</p>
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

function CashierTable({ rows }: { rows: ReportResult["byCashier"] }) {
    return (
        <div className={cardClass}>
            <p className="text-xs font-semibold">Kinerja Kasir</p>
            <p className="mb-3 text-[11px] text-neutral-400">Kolom Dibatalkan membantu memeriksa transaksi yang di-void.</p>
            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className={headClass}>Kasir</TableHead>
                            <TableHead className={headClass}>Transaksi</TableHead>
                            <TableHead className={headClass}>Omzet</TableHead>
                            <TableHead className={headClass}>Rata-rata</TableHead>
                            <TableHead className={headClass}>Dibatalkan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((c) => (
                            <TableRow key={c.id}>
                                <TableCell className="text-xs font-medium">{c.name}</TableCell>
                                <TableCell className={cellClass}>{c.count}</TableCell>
                                <TableCell className={cn(cellClass, "font-semibold")}>{formatRupiah(c.total)}</TableCell>
                                <TableCell className={cellClass}>{formatRupiah(c.average)}</TableCell>
                                <TableCell className={cn(cellClass, c.cancelled > 0 && "font-medium text-prim")}>{c.cancelled}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
                    {/* <a> biasa, bukan Link: tujuannya berkas unduhan, bukan halaman */}
                    <a
                        href={`/report/export${toHistoryQuery(result.range)}`}
                        download
                        className={cn(buttonVariants({ size: "sm" }), "h-8 bg-prim text-xs hover:bg-prim-dark")}
                    >
                        <Download className="mr-1.5 size-3.5" />
                        Export CSV
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Total Penjualan" value={formatRupiah(summary.totalSales)}>
                    <Delta value={change.sales} label="periode sebelumnya" />
                </Stat>
                <Stat label="Jumlah Transaksi" value={String(summary.orderCount)}>
                    <Delta value={change.orders} label="periode sebelumnya" />
                </Stat>
                <Stat label="Rata-rata per Transaksi" value={formatRupiah(summary.average)}>
                    <Delta value={change.average} label="periode sebelumnya" />
                </Stat>
                <Stat label="Dibatalkan" value={String(summary.cancelledCount)} />
            </div>

            {summary.orderCount === 0 ? (
                <EmptyState icon={NoData} label="Belum ada penjualan" message="Tidak ada transaksi selesai pada periode ini" />
            ) : (
                <>
                    <DailyChart daily={result.daily} />
                    <MethodChart byMethod={result.byMethod} totalSales={summary.totalSales} />
                    <MenuTable rows={result.byMenu} totalSales={summary.totalSales} />
                </>
            )}
            {/* Tabel kasir tetap tampil walau tanpa penjualan: transaksi yang dibatalkan perlu terlihat */}
            {result.byCashier.length > 0 && <CashierTable rows={result.byCashier} />}
        </div>
    )
}