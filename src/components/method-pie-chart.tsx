'use client'

import { EChartsPieChart } from "@/components/evilcharts/charts/echarts-pie-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart"
import { paymentMethodLabels } from "@/lib/constants"
import { formatRupiah } from "@/lib/format"
import type { ReportResult } from "@/lib/queries/report"
import { InView } from "./in-view"

// Kunci config = nilai PaymentMethod, supaya cocok dengan nameKey di data
const config = {
    CASH: { label: paymentMethodLabels.CASH, colors: { light: ["#16a34a"], dark: ["#4ade80"] } },
    EWALLET: { label: paymentMethodLabels.EWALLET, colors: { light: ["#2563eb"], dark: ["#60a5fa"] } },
    BANK_TRANSFER: { label: paymentMethodLabels.BANK_TRANSFER, colors: { light: ["#f59e0b"], dark: ["#fbbf24"] } },
    QRIS: { label: paymentMethodLabels.QRIS, colors: { light: ["#8b5cf6"], dark: ["#a78bfa"] } },
} satisfies ChartConfig

/** Kartu komposisi metode pembayaran: pie evilcharts + daftar nominal, persen, dan jumlah transaksi. */
export function MethodPieChart({ byMethod, totalSales }: { byMethod: ReportResult["byMethod"]; totalSales: number }) {
    // Data berubah = chart dibuat ulang supaya animasinya main lagi
    const dataKey = byMethod.map((m) => `${m.method}:${m.total}`).join("|")
    return (
        <div className="rounded-xl border bg-card p-4 lg:col-span-2">
            <p className="text-xs font-semibold">Metode Pembayaran</p>
            <div className="mt-4 flex flex-wrap items-center gap-8">
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
                <ul className="space-y-2 text-xs">
                    {byMethod.map((m) => (
                        <li key={m.method} className="flex items-center gap-2">
                            <span className="size-2 rounded-[3px]" style={{ background: config[m.method].colors.light[0] }} />
                            <span className="w-18">{config[m.method].label}</span>
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