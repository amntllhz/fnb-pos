import { cn } from "@/lib/utils"

export function Delta({ value, label }: { value: number | null; label: string }) {
    if (value === null) return <p className="mt-0.5 text-[10px] text-neutral-300">Belum ada pembanding</p>
    const up = value >= 0
    return (
        <p className={cn("mt-0.5 text-[10px]", up ? "text-green-600" : "text-red-600")}>
            {up ? "▲" : "▼"} {Math.abs(value)}% <span className="text-neutral-400">vs {label}</span>
        </p>
    )
}

export function Stat({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <p className="text-[11px] text-neutral-400">{label}</p>
            <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
            {children}
        </div>
    )
}