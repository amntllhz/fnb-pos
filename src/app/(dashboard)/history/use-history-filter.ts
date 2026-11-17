'use client'

import { useState, useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"
import type { DateRange } from "react-day-picker"
import { businessYmd, localDateToYmd, ymdToLocalDate } from "@/lib/business-date"
import type { HistoryParams } from "@/lib/history-schema"
import { toHistoryQuery } from "@/lib/history-url"
import type { OrderStatus, PaymentMethod } from "@/lib/order-schema"

// Select tidak boleh punya value kosong, jadi "semua" diwakili sentinel ini
export const ALL = "all"

type Options = {
    applied: { from: string; to: string } & Pick<HistoryParams, "method" | "status" | "q">
    pageSize: number
}

export function useHistoryFilter({ applied, pageSize }: Options) {
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()

    // Draft: pilihan user yang baru berlaku setelah Terapkan
    const [range, setRange] = useState<DateRange | undefined>({
        from: ymdToLocalDate(applied.from),
        to: ymdToLocalDate(applied.to),
    })
    const [method, setMethod] = useState<string>(applied.method ?? ALL)
    const [status, setStatus] = useState<string>(applied.status ?? ALL)
    const [q, setQ] = useState(applied.q ?? "")

    function navigate(query: Partial<HistoryParams>) {
        startTransition(() => {
            router.push(`${pathname}${toHistoryQuery(query)}`)
        })
    }

    function apply() {
        const from = range?.from
        const to = range?.to ?? from // satu klik saja = rentang satu hari
        navigate({
            from: from ? localDateToYmd(from) : undefined,
            to: to ? localDateToYmd(to) : undefined,
            method: method === ALL ? undefined : (method as PaymentMethod),
            status: status === ALL ? undefined : (status as OrderStatus),
            q: q.trim() || undefined,
            size: pageSize, // jumlah baris pilihan user tidak ikut ter-reset
        })
    }

    function reset() {
        // Draft ikut direset secara lokal. Kalau URL-nya sudah default, router.push tidak mengubah apa-apa
        // dan key di HistoryList tidak berganti, sehingga draft yang kotor akan tertinggal.
        const today = ymdToLocalDate(businessYmd())
        setRange({ from: today, to: today })
        setMethod(ALL)
        setStatus(ALL)
        setQ("")
        navigate({ size: pageSize })
    }

    return { range, setRange, method, setMethod, status, setStatus, q, setQ, apply, reset, isPending }
}