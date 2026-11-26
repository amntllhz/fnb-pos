'use client'

import { EChartsBarChart } from "@/components/evilcharts/charts/echarts-bar-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart"
import { InView } from "./in-view"

// ponytail: satu seri saja (omzet). Warna memakai token prim dari tema; kalau tidak tampil, ganti dengan hex.
const config = {
    value: {
        label: "Omzet (Rp)",
        colors: { light: ["var(--color-prim)"], dark: ["var(--color-prim)"] },
    },
} satisfies ChartConfig

export type Bar = { key: string; label: string; tick?: string; value: number }

export function compactRupiah(n: number) {
    if (n >= 1_000_000) return ` ${(n / 1_000_000).toFixed(1).replace(".", ",").replace(/,0$/, "")} jt`
    if (n >= 1_000) return ` ${Math.round(n / 1_000)} rb`
    return ` ${n}`
}

/** Grafik batang omzet. labelEvery = tampilkan label sumbu X tiap sekian batang. */
export function RevenueBarChart({ bars }: { bars: Bar[] }) {
    const dataKey = bars.map((b) => `${b.key}:${b.value}`).join("|")
    // Sumbu X memakai teks pendek (tick), tooltip tetap memakai label lengkap
    const ticks = new Map(bars.map((b) => [b.label, b.tick ?? b.label]))

    return (
        <InView key={dataKey} className="h-44 w-full">
            <EChartsBarChart data={bars} config={config} className="h-44 w-full">
                <EChartsBarChart.Grid />
                <EChartsBarChart.XAxis dataKey="label" tickFormatter={(value) => ticks.get(value) ?? value} />
                <EChartsBarChart.YAxis tickFormatter={(value) => compactRupiah(Number(value))} />
                <EChartsBarChart.Tooltip variant="frosted-glass" />
                <EChartsBarChart.Bar dataKey="value" />
                <EChartsBarChart.Legend variant="rounded-square" isClickable />
            </EChartsBarChart>
        </InView>
    )
}