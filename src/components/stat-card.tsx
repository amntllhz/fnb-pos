import { cn } from "@/lib/utils"

export function Stat({
    label,
    value,
    delta,
    children,
}: {
    label: string
    value: string
    delta?: { value: number | null; label: string }
    children?: React.ReactNode
}) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <p className="text-[11px] text-neutral-400">{label}</p>
            <div className="mt-1 flex flex-wrap items-center justify-start gap-x-2">
                <p className="text-[16px] font-bold tracking-tight tabular-nums">{value}</p>
                {delta && delta.value !== null && (
                    <span className={cn("shrink-0 text-[9px] px-1 py-0.5 font-medium rounded-sm",
                        delta.value >= 0 ?
                            "text-green-600 bg-green-50 ring ring-green-300/30" :
                            "text-red-600 bg-red-50 ring ring-red-300/30")}>
                        {delta.value >= 0 ? "▲" : "▼"} {Math.abs(delta.value)}%
                    </span>
                )}
            </div>
            {delta ? (
                <p className="mt-0.5 text-[10px] text-neutral-400">
                    {delta.value === null ? "Belum ada pembanding" : `vs ${delta.label}`}
                </p>
            ) : (
                children
            )}
        </div>
    )
}