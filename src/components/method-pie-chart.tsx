'use client'

import { EChartsPieChart } from "@/components/evilcharts/charts/echarts-pie-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart"
import { paymentMethodLabels } from "@/lib/constants"
import { formatRupiah } from "@/lib/format"
import type { ReportResult } from "@/lib/queries/report"
import { InView } from "./in-view"
import { cn } from "@/lib/utils"

// Kunci config = nilai PaymentMethod, supaya cocok dengan nameKey di data
const config = {
    CASH: { label: paymentMethodLabels.CASH, colors: { light: ["#16a34a"], dark: ["#4ade80"] } },
    EWALLET: { label: paymentMethodLabels.EWALLET, colors: { light: ["#2563eb"], dark: ["#60a5fa"] } },
    BANK_TRANSFER: { label: paymentMethodLabels.BANK_TRANSFER, colors: { light: ["#f59e0b"], dark: ["#fbbf24"] } },
    QRIS: { label: paymentMethodLabels.QRIS, colors: { light: ["#8b5cf6"], dark: ["#a78bfa"] } },
} satisfies ChartConfig

/** Kartu komposisi metode pembayaran: pie evilcharts + daftar nominal, persen, dan jumlah transaksi. */
export function MethodPieChart({
    byMethod,
    totalSales,
    colSpan,
    flexCont,
    legendColumn }
    : {
        byMethod: ReportResult["byMethod"];
        totalSales: number;
        colSpan: string;
        flexCont: string;
        legendColumn: string
    }) {
    // Data berubah = chart dibuat ulang supaya animasinya main lagi
    const dataKey = byMethod.map((m) => `${m.method}:${m.total}`).join("|")
    // Keempat metode selalu tampil dengan urutan tetap; yang tidak ada transaksinya bernilai 0
    const rows = (Object.keys(config) as (keyof typeof config)[]).map((method) => {
        const found = byMethod.find((m) => m.method === method)
        const total = found?.total ?? 0
        return {
            method,
            total,
            count: found?.count ?? 0,
            percent: totalSales > 0 ? Math.round((total / totalSales) * 100) : 0,
        }
    })

    return (
        <div className={`rounded-xl border bg-card p-4 ${colSpan}`}>
            <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold">Metode Pembayaran</p>
                <p className="text-[11px] text-neutral-400">
                    Diagram ini menunjukkan komposisi metode pembayaran
                </p>
            </div>
            <div className={`mt-4 flex items-center gap-8 ${flexCont}`}>
                <InView key={dataKey} className="aspect-square size-40">
                    <EChartsPieChart
                        data={byMethod.map((m) => ({ method: m.method, total: m.total }))}
                        dataKey="total"
                        nameKey="method"
                        config={config}
                        className="aspect-square size-40"
                    >
                        <EChartsPieChart.Tooltip variant="frosted-glass" />
                        <EChartsPieChart.Pie innerRadius={28} paddingAngle={6} cornerRadius={8} />
                    </EChartsPieChart>
                </InView>

                {/* Nominal dan persen ditulis sendiri, supaya terbaca tanpa hover di layar sentuh */}
                <div className={`grid w-full flex-1 gap-2 ${legendColumn}`}>
                    {rows.map((r) => (
                        <div key={r.method} className={cn("rounded-lg border p-3", r.total === 0 && "opacity-60")}>
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                                <span className="size-2 rounded-xs" style={{ background: config[r.method].colors.light[0] }} />
                                {config[r.method].label}
                            </div>
                            <p className="mt-1 text-sm font-bold tabular-nums">{r.percent}%</p>
                            <p className="text-[10px] tabular-nums text-neutral-400">
                                {formatRupiah(r.total)} · {r.count} transaksi
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}