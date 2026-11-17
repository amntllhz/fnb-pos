'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/lib/history-schema"
import { toHistoryQuery } from "@/lib/history-url"
import { getPageItems } from "@/lib/page-items"
import { cn } from "@/lib/utils"
import type { HistoryResult } from "./types"

type PageLinkProps = {
    href: string
    label: string
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
}

function PageLink({ href, label, active, disabled, children }: PageLinkProps) {
    const className = cn(
        buttonVariants({ variant: active ? "default" : "ghost", size: "xs" }),
        "h-7 min-w-7 px-2 text-xs",
        active && "bg-prim/10 text-prim hover:bg-prim/20 transition duration-200 ease-in-out ring ring-inset ring-prim/10",
        disabled && "pointer-events-none opacity-40"
    )
    if (disabled) return <span aria-disabled className={className}>{children}</span>
    return (
        <Link href={href} scroll={false} aria-label={label} aria-current={active ? "page" : undefined} className={className}>
            {children}
        </Link>
    )
}

export function HistoryPagination({ result }: { result: HistoryResult }) {
    const router = useRouter()
    const pathname = usePathname()
    const { page, pageSize, total, totalPages } = result

    // ponytail: bar disembunyikan kalau semua data muat di opsi terkecil
    if (total <= PAGE_SIZE_OPTIONS[0]) return null

    // Filter aktif ikut terbawa ke setiap link
    const base = { from: result.range.from, to: result.range.to, ...result.filters, size: pageSize }
    const href = (p: number) => `${pathname}${toHistoryQuery({ ...base, page: p })}`

    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
                <span>Menampilkan {start}–{end} dari {total}</span>
            </div>

            <div className="flex items-center gap-2">
                <Select
                    value={String(pageSize)}
                    // tanpa page di query = kembali ke halaman 1
                    onValueChange={(v) => router.push(`${pathname}${toHistoryQuery({ ...base, size: Number(v) })}`)}
                >
                    <SelectTrigger size="sm" className="w-18 text-xs" aria-label="Baris per halaman">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="p-1">
                        {PAGE_SIZE_OPTIONS.map((n) => (
                            <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span>Baris</span>
            </div>

            <nav aria-label="Halaman" className="flex items-center gap-1">
                <PageLink href={href(page - 1)} label="Sebelumnya" disabled={page <= 1}>
                    <ChevronLeft className="size-4" />
                </PageLink>
                {getPageItems(page, totalPages).map((item, i) =>
                    item === "…" ? (
                        <span key={`gap-${i}`} className="px-1">…</span>
                    ) : (
                        <PageLink key={item} href={href(item)} label={`Halaman ${item}`} active={item === page}>
                            {item}
                        </PageLink>
                    )
                )}
                <PageLink href={href(page + 1)} label="Berikutnya" disabled={page >= totalPages}>
                    <ChevronRight className="size-4" />
                </PageLink>
            </nav>
        </div>
    )
}