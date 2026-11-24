'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { ArrowDown, ArrowUp } from "lucide-react"
import NoData from "@/assets/no-data.svg"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { EmptyState } from "@/components/empty-state"
import { Stat } from "@/components/stat-card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatRupiah } from "@/lib/format"
import type { DashboardResult } from "@/lib/queries/dashboard"
import { cn } from "@/lib/utils"
import { RevenueBarChart } from "@/components/revenue-bar-chart"
import { MethodPieChart } from "@/components/method-pie-chart"
import { Button } from "@/components/ui/button"


const PRESET_LABELS = { today: "Hari Ini", yesterday: "Kemarin", "7d": "7 Hari" } as const
// Hanya type yang diimpor dari lib/queries/dashboard, supaya Prisma tidak ikut masuk bundle client
const PRESETS = Object.keys(PRESET_LABELS) as (keyof typeof PRESET_LABELS)[]

// Gaya sama dengan tabs di menu-list.tsx
const TRIGGER_CLASS = "text-neutral-400 data-active:font-medium data-active:text-prim px-3 font-normal text-xs transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground"
const cardClass = "rounded-xl border bg-card p-4"

const hh = (hour: number) => String(hour).padStart(2, "0")

// ponytail: batang dari div biasa, tanpa library chart
function HourlyChart({ data }: { data: DashboardResult["byHour"] }) {
    const peak = data.reduce((a, b) => (b.total > a.total ? b : a))

    return (
        <div className={cardClass}>
            <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold">Penjualan per Jam</p>
                <p className="text-[11px] text-neutral-400">
                    Angka di bawah batang adalah jam mulai ( 10 berarti 10.00-10.59 )
                </p>
            </div>

            <div className="mt-4">
                <RevenueBarChart bars={data.map((d) => ({
                    key: String(d.hour),
                    label: `${hh(d.hour)}.00-${hh(d.hour)}.59`,
                    tick: hh(d.hour),
                    value: d.total,
                }))} />
            </div>

            {/* Nilai terbaca tanpa hover, penting untuk layar sentuh */}
            <p className="mt-3 text-[10px] text-neutral-400">
                Jam tersibuk:{" "}
                <span className="font-medium text-foreground">
                    {hh(peak.hour)}.00-{hh(peak.hour)}.59
                </span>
                {" · "}
                {formatRupiah(peak.total)} dari {peak.count} transaksi
            </p>
        </div>
    )
}

function MenuRanking({ items }: { items: DashboardResult["menuRanking"] }) {
    const [bestFirst, setBestFirst] = useState(true)

    // ponytail: semua menu sudah ada di props, jadi urutan cukup dihitung di client
    const sorted = [...items].sort(
        (a, b) => (bestFirst ? b.qty - a.qty : a.qty - b.qty) || a.name.localeCompare(b.name)
    )

    return (
        <div className={cardClass}>
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-semibold">{bestFirst ? "Menu Terlaris" : "Menu Kurang Laku"}</p>
                    {items.length > 5 && (
                        <p className="text-[11px] text-neutral-400">Gulir untuk melihat rank menu</p>
                    )}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setBestFirst((v) => !v)}
                    aria-label={bestFirst ? "Urutkan dari yang kurang laku" : "Urutkan dari yang terlaris"}
                    title={bestFirst ? "Terlaris" : "Kurang laku"}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-3.5"
                    >
                        {/* Arrow atas (aktif saat bestFirst === false) */}
                        <path
                            d="M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={!bestFirst ? "text-prim" : "text-muted-foreground/40"}
                        />
                        {/* Arrow bawah (default aktif saat bestFirst === true) */}
                        <path
                            d="M7 15L12 20L17 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={bestFirst ? "text-prim" : "text-muted-foreground/40"}
                        />
                    </svg>
                </Button>
            </div>

            {sorted.length === 0 ? (
                <p className="mt-3 text-[11px] text-neutral-400">Belum ada menu</p>
            ) : (
                // Tinggi pas 5 baris (5 x h-8 = max-h-40), sisanya bisa digulir
                <ol className="mt-3 max-h-42 overflow-y-auto pr-1">
                    {sorted.map((m, i) => (
                        <li key={m.id} className="flex space-y-3 items-center gap-2 text-xs">
                            <span className="w-4 tabular-nums text-neutral-400">{i + 1}</span>
                            <span className="min-w-0 flex-1 truncate">{m.name}</span>
                            <span className="font-medium tabular-nums">{m.qty} pcs</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    )
}

function Body({ result }: { result: DashboardResult }) {
    const { summary, change, compareLabel } = result

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Omzet" value={formatRupiah(summary.totalSales)} delta={{ value: change.sales, label: compareLabel }} />
                <Stat label="Transaksi" value={String(summary.orderCount)} delta={{ value: change.orders, label: compareLabel }} />
                <Stat label="Rata-rata per Transaksi" value={formatRupiah(summary.average)} delta={{ value: change.average, label: compareLabel }} />
                <Stat label="Dibatalkan" value={String(summary.cancelledCount)} />
                <Link href="/menus/manage" className="transition-colors hover:bg-neutral-50 rounded-xl">
                    <Stat label="Menu Habis" value={String(result.unavailableCount)}>
                        <p className="mt-0.5 text-[10px] text-neutral-400">Lihat ketersediaan</p>
                    </Stat>
                </Link>
            </div>

            {summary.orderCount === 0 ? (
                <EmptyState icon={NoData} label="Belum ada penjualan" message="Belum ada transaksi selesai pada periode ini" />
            ) : (
                <>
                    <HourlyChart data={result.byHour} />
                    <div className="grid gap-4 lg:grid-cols-3">
                        <MenuRanking items={result.menuRanking} />
                        <MethodPieChart legendColumn="grid-cols-2" flexCont="flex-wrap" colSpan="lg:col-span-2" byMethod={result.byMethod} totalSales={summary.totalSales} />
                    </div>
                </>
            )
            }
        </div >
    )
}

export function DashboardView({ result, isOwner }: { result: DashboardResult; isOwner: boolean }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    function handlePresetChange(value: string) {
        startTransition(() => {
            router.push(value === "today" ? pathname : `${pathname}?range=${value}`)
        })
    }

    return (
        <div className="flex min-h-svh min-w-0 flex-col gap-4 px-6 py-4">
            <div className="flex items-center justify-start gap-4">
                <SidebarTrigger className="text-neutral-300 transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" />
                <DynamicBreadcrumb />
            </div>

            <div className="flex flex-col space-y-1">
                <h1 className="text-xl font-extrabold">Dashboard</h1>
                <p className="text-xs text-neutral-400">
                    {isOwner ? "Ringkasan dan statistik penjualan harian" : "Ringkasan penjualan toko hari ini"}
                </p>
            </div>

            {isOwner ? (
                <Tabs value={result.preset} onValueChange={handlePresetChange} className="space-y-3">
                    <TabsList className="w-fit">
                        {PRESETS.map((p) => (
                            <TabsTrigger key={p} value={p} className={TRIGGER_CLASS}>
                                {PRESET_LABELS[p]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value={result.preset} className={cn("transition-opacity", isPending && "opacity-60")}>
                        <Body result={result} />
                    </TabsContent>
                </Tabs>
            ) : (
                <Body result={result} />
            )}
        </div>
    )
}