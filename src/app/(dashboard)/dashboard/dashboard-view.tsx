'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"
import NoData from "@/assets/no-data.svg"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { EmptyState } from "@/components/empty-state"
import { Delta, Stat } from "@/components/stat-card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatRupiah } from "@/lib/format"
import type { DashboardResult } from "@/lib/queries/dashboard"
import { cn } from "@/lib/utils"
import { MethodChart } from "../report/report-view"

const PRESET_LABELS = { today: "Hari Ini", yesterday: "Kemarin", "7d": "7 Hari" } as const
// Hanya type yang diimpor dari lib/queries/dashboard, supaya Prisma tidak ikut masuk bundle client
const PRESETS = Object.keys(PRESET_LABELS) as (keyof typeof PRESET_LABELS)[]

// Gaya sama dengan tabs di menu-list.tsx
const TRIGGER_CLASS =
    "text-neutral-400 data-active:font-medium data-active:text-prim px-3 font-normal text-xs transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground"

const cardClass = "rounded-xl border bg-card p-4"

const hh = (hour: number) => String(hour).padStart(2, "0")

function compactRupiah(n: number) {
    if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1).replace(".", ",").replace(/,0$/, "")} jt`
    if (n >= 1_000) return `Rp ${Math.round(n / 1_000)} rb`
    return `Rp ${n}`
}

// Pembulatan ke atas ke angka "bulat" (1, 2, 5 x 10^n) supaya skala sumbu Y rapi
function niceMax(value: number) {
    const pow = 10 ** Math.floor(Math.log10(value))
    const n = value / pow
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

const BAR_AREA = 128 // tinggi area batang, px

// ponytail: batang dari div biasa, tanpa library chart
function HourlyChart({ data }: { data: DashboardResult["byHour"] }) {
    const top = niceMax(Math.max(...data.map((d) => d.total), 1))
    const peak = data.reduce((a, b) => (b.total > a.total ? b : a))

    return (
        <div className={cardClass}>
            <p className="text-xs font-semibold">Penjualan per Jam</p>
            <p className="text-[11px] text-neutral-400">
                Total omzet (Rp) yang masuk tiap jam pada periode ini. Angka di bawah batang adalah jam mulai, 10 berarti 10.00-10.59.
            </p>

            <div role="img" aria-label="Grafik omzet per jam" className="mt-4 flex gap-2">
                <div
                    className="flex shrink-0 flex-col justify-between text-right text-[9px] tabular-nums text-neutral-400"
                    style={{ height: BAR_AREA }}
                >
                    <span>{compactRupiah(top)}</span>
                    <span>{compactRupiah(top / 2)}</span>
                    <span>0</span>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="relative flex items-end gap-1 border-b" style={{ height: BAR_AREA }}>
                        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed" />
                        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed" />
                        {data.map((d) => (
                            <div
                                key={d.hour}
                                title={`${hh(d.hour)}.00-${hh(d.hour)}.59 · ${formatRupiah(d.total)} · ${d.count} transaksi`}
                                className="relative flex-1 rounded-t bg-prim/80"
                                style={{ height: d.total > 0 ? Math.max(3, Math.round((d.total / top) * BAR_AREA)) : 0 }}
                            />
                        ))}
                    </div>
                    <div className="mt-1 flex gap-1">
                        {data.map((d) => (
                            <span key={d.hour} className="flex-1 text-center text-[9px] tabular-nums text-neutral-400">
                                {hh(d.hour)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Nilai terbaca tanpa hover, penting untuk layar sentuh */}
            <p className="mt-3 text-[11px] text-neutral-500">
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

function MenuRank({ title, items, empty }: { title: string; items: DashboardResult["topMenus"]; empty: string }) {
    return (
        <div className={cardClass}>
            <p className="text-xs font-semibold">{title}</p>
            {items.length === 0 ? (
                <p className="mt-3 text-[11px] text-neutral-400">{empty}</p>
            ) : (
                <ol className="mt-3 space-y-2">
                    {items.map((m, i) => (
                        <li key={m.id} className="flex items-center gap-2 text-xs">
                            <span className="w-4 tabular-nums text-neutral-400">{i + 1}</span>
                            <span className="min-w-0 flex-1 truncate">{m.name}</span>
                            <span className="font-medium tabular-nums">{m.qty} porsi</span>
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
                <Stat label="Omzet" value={formatRupiah(summary.totalSales)}>
                    <Delta value={change.sales} label={compareLabel} />
                </Stat>
                <Stat label="Transaksi" value={String(summary.orderCount)}>
                    <Delta value={change.orders} label={compareLabel} />
                </Stat>
                <Stat label="Rata-rata per Transaksi" value={formatRupiah(summary.average)}>
                    <Delta value={change.average} label={compareLabel} />
                </Stat>
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
                    <div className="grid gap-4 lg:grid-cols-2">
                        <MenuRank title="Menu Terlaris" items={result.topMenus} empty="Belum ada menu terjual" />
                        <MenuRank title="Menu Kurang Laku" items={result.lowMenus} empty="Semua menu sedang habis atau belum ada menu" />
                    </div>
                    <MethodChart byMethod={result.byMethod} totalSales={summary.totalSales} />
                </>
            )}
        </div>
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
                    {isOwner ? "Pantau kondisi penjualan dengan cepat" : "Ringkasan penjualan toko hari ini"}
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