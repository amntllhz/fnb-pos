import { cn } from "@/lib/utils"

const BAR_AREA = 128 // tinggi area batang, px

export function compactRupiah(n: number) {
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

export type Bar = { key: string; label: string; value: number; tooltip: string }

// ponytail: batang dari div biasa, tanpa library chart. Diganti saat pindah ke evilcharts.
export function SimpleBarChart({
    bars,
    labelEvery = 1,
    ariaLabel,
}: {
    bars: Bar[]
    labelEvery?: number
    ariaLabel: string
}) {
    const top = niceMax(Math.max(...bars.map((b) => b.value), 1))
    const gap = bars.length > 31 ? "gap-px" : "gap-1"

    return (
        <div role="img" aria-label={ariaLabel} className="flex gap-2">
            <div
                className="flex shrink-0 flex-col justify-between text-right text-[9px] tabular-nums text-neutral-400"
                style={{ height: BAR_AREA }}
            >
                <span>{compactRupiah(top)}</span>
                <span>{compactRupiah(top / 2)}</span>
                <span>0</span>
            </div>

            <div className="min-w-0 flex-1">
                <div className={cn("relative flex items-end border-b", gap)} style={{ height: BAR_AREA }}>
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed" />
                    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed" />
                    {bars.map((b) => (
                        <div
                            key={b.key}
                            title={b.tooltip}
                            className="relative flex-1 rounded-t bg-prim/80"
                            style={{ height: b.value > 0 ? Math.max(3, Math.round((b.value / top) * BAR_AREA)) : 0 }}
                        />
                    ))}
                </div>
                <div className={cn("mt-1 flex", gap)}>
                    {bars.map((b, i) => (
                        <span key={b.key} className="relative h-3 min-w-0 flex-1">
                            {i % labelEvery === 0 && (
                                <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tabular-nums text-neutral-400">
                                    {b.label}
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}