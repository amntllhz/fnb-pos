'use client'

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { orderStatusLabels, paymentMethodLabels } from "@/lib/constants"
import { ORDER_STATUSES, PAYMENT_METHODS } from "@/lib/order-schema"
import { HistoryDateRangePicker } from "./history-date-range-picker"
import { ALL, useHistoryFilter } from "./use-history-filter"
import type { HistoryResult } from "./types"

export function HistoryFilter({ result, isOwner }: { result: HistoryResult; isOwner: boolean }) {
    const filter = useHistoryFilter({
        applied: { from: result.range.from, to: result.range.to, ...result.filters },
        pageSize: result.pageSize,
    })

    return (
        <form
            onSubmit={(e) => { e.preventDefault(); filter.apply() }}
            className="flex flex-wrap items-center gap-2"
        >
            {isOwner ? (
                <HistoryDateRangePicker value={filter.range} onChange={filter.setRange} />
            ) : (
                <span className="inline-flex h-8 items-center rounded-md border bg-card px-3 text-xs text-neutral-500">
                    Hari ini
                </span>
            )}

            <Select value={filter.method} onValueChange={filter.setMethod}>
                <SelectTrigger size="sm" className="w-38 text-xs">
                    <SelectValue placeholder="Metode" />
                </SelectTrigger>
                <SelectContent position="popper" className="p-1">
                    <SelectItem value={ALL} className="text-xs">Semua metode</SelectItem>
                    {PAYMENT_METHODS.map((method) => (
                        <SelectItem key={method} value={method} className="text-xs">
                            {paymentMethodLabels[method]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={filter.status} onValueChange={filter.setStatus}>
                <SelectTrigger size="sm" className="w-38 text-xs">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent position="popper" className="p-1">
                    <SelectItem value={ALL} className="text-xs">Semua status</SelectItem>
                    {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">
                            {orderStatusLabels[status]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
                <InputGroup className="h-8 max-w-56">
                    <InputGroupAddon align="inline-start">
                        <Search className="size-3.5 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Cari no. transaksi..."
                        value={filter.q}
                        onChange={(e) => filter.setQ(e.target.value)}
                        className="text-xs placeholder:text-xs"
                    />
                    {filter.q && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                type="button"
                                size="icon-xs"
                                onClick={() => filter.setQ("")}
                                aria-label="Hapus pencarian"
                            >
                                <X className="size-3" />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>

                <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={filter.reset} disabled={filter.isPending}>
                    Reset
                </Button>
                <Button type="submit" size="sm" className="h-8 bg-prim text-xs hover:bg-prim-dark" disabled={filter.isPending}>
                    {filter.isPending ? (
                        <>
                            <Spinner className="mr-1.5" />
                            Memuat...
                        </>
                    ) : (
                        "Terapkan"
                    )}
                </Button>
            </div>
        </form>
    )
}