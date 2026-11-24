'use client'

import { useState } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { EmptyState } from "@/components/empty-state"
import NoData from "@/assets/no-data.svg"
import { HistoryTable } from "./history-table"
import type { HistoryResult, HistoryRow } from "./types"
import { HistoryFilter } from "./history-filter"
import { HistoryPagination } from "./history-pagination"
import { HistoryDetailDialog } from "./history-detail-dialog"


export function HistoryList({ result, role }: { result: HistoryResult; role?: string }) {
    const isOwner = role === "OWNER"
    const [selected, setSelected] = useState<HistoryRow | null>(null)
    const filterKey = [
        result.range.from,
        result.range.to,
        result.filters.method,
        result.filters.status,
        result.filters.q,
    ].join("|")

    return (
        <div className="flex min-h-svh min-w-0 flex-col gap-4 px-6 py-4">

            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start gap-4">
                    <SidebarTrigger className="text-neutral-300 transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" />
                    <DynamicBreadcrumb />
                </div>
            </div>

            <div className="flex flex-col space-y-1">
                <h1 className="text-xl font-extrabold">Riwayat Transaksi</h1>
                <p className="text-xs text-neutral-400">
                    {isOwner ? "Telusuri catatan transaksi masuk dengan informasi detail" : "Daftar transaksi Anda hari ini"}
                </p>
            </div>

            <HistoryFilter key={filterKey} result={result} isOwner={isOwner} />

            {result.rows.length === 0 ? (
                <EmptyState icon={NoData} label="Belum ada transaksi" message="Tidak ada transaksi pada periode ini" />
            ) : (
                <>
                    <HistoryTable rows={result.rows} onSelect={setSelected} />
                    <HistoryPagination result={result} />
                </>
            )}

            <HistoryDetailDialog row={selected} isOwner={isOwner} onClose={() => setSelected(null)} />
        </div>
    )
}