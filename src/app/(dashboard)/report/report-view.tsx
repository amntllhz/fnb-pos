'use client'

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { DateRange } from "react-day-picker"
import NoData from "@/assets/no-data.svg"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Spinner } from "@/components/ui/spinner"
import { localDateToYmd, ymdToLocalDate } from "@/lib/business-date"
import { paymentMethodLabels } from "@/lib/constants"
import { formatRupiah } from "@/lib/format"
import { toHistoryQuery } from "@/lib/history-url"
import type { PaymentMethod } from "@/lib/order-schema"
import type { ReportResult } from "@/lib/queries/report"
import { HistoryDateRangePicker } from "../history/history-date-range-picker"

const COLORS: Record<PaymentMethod, string> = {
    CASH: "#16a34a",
    EWALLET: "#2563eb",
    BANK_TRANSFER: "#f59e0b",
    QRIS: "#8b5cf6",
}

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

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <p className="text-[11px] text-neutral-400">{label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
        </div>
    )
}

// ponytail: pie dari conic-gradient, tanpa library chart. Ganti ke shadcn chart kalau butuh tooltip/animasi.
function MethodChart({ byMethod, totalSales }: { byMethod: ReportResult["byMethod"]; totalSales: number }) {
    let acc = 0
    const stops = byMethod.map((m) => {
        const start = acc
        acc += (m.total / totalSales) * 100
        return `${COLORS[m.method]} ${start}% ${acc}%`
    })

    return (
        <div className="rounded-xl border bg-card p-4">
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

export function ReportView({ result }: { result: ReportResult }) {
    const { totalSales, orderCount, average, cancelledCount, byMethod } = result

    return (
        <div className="flex min-h-svh min-w-0 flex-col gap-4 px-6 py-4">
            <div className="flex items-center justify-start gap-4">
                <SidebarTrigger className="text-neutral-300 transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" />
                <DynamicBreadcrumb />
            </div>

            <div className="flex flex-col space-y-1">
                <h1 className="text-xl font-extrabold">Laporan Penjualan</h1>
                <p className="text-xs text-neutral-400">Ringkasan transaksi selesai pada periode terpilih</p>
            </div>

            <ReportFilter key={`${result.range.from}|${result.range.to}`} applied={result.range} />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Total Penjualan" value={formatRupiah(totalSales)} />
                <Stat label="Jumlah Transaksi" value={String(orderCount)} />
                <Stat label="Rata-rata per Transaksi" value={formatRupiah(average)} />
                <Stat label="Dibatalkan" value={String(cancelledCount)} />
            </div>

            {orderCount === 0 ? (
                <EmptyState icon={NoData} label="Belum ada penjualan" message="Tidak ada transaksi selesai pada periode ini" />
            ) : (
                <MethodChart byMethod={byMethod} totalSales={totalSales} />
            )}
        </div>
    )
}