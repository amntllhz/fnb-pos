import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { paymentMethodLabels } from "@/lib/constants"
import { formatDateTime, formatOrderNumber, formatRupiah } from "@/lib/format"
import { HistoryStatusBadge } from "./history-status-badge"
import type { HistoryRow } from "./types"

const headClass = "h-9 text-xs font-medium text-neutral-400 text-center"

export function HistoryTable({ rows, onSelect }: { rows: HistoryRow[]; onSelect: (row: HistoryRow) => void }) {
    return (
        <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className={headClass}>No. Transaksi</TableHead>
                        <TableHead className={headClass}>Waktu</TableHead>
                        <TableHead className={headClass}>Kasir</TableHead>
                        <TableHead className={headClass}>Metode</TableHead>
                        <TableHead className={headClass}>Item</TableHead>
                        <TableHead className={headClass}>Total</TableHead>
                        <TableHead className={headClass}>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.id}
                            className="cursor-pointer"
                            tabIndex={0}
                            onClick={() => onSelect(row)}
                            onKeyDown={(e) => e.key === "Enter" && onSelect(row)}
                        >
                            <TableCell className="text-xs text-center font-medium">{formatOrderNumber(row.orderNumber)}</TableCell>
                            <TableCell className="text-xs text-center text-neutral-500">{formatDateTime(row.createdAt)}</TableCell>
                            <TableCell className="text-xs text-center">{row.cashierName}</TableCell>
                            <TableCell className="text-xs text-center">{paymentMethodLabels[row.paymentMethod]}</TableCell>
                            <TableCell className="text-xs text-center tabular-nums">{row.itemCount}</TableCell>
                            <TableCell className="text-xs text-center font-semibold tabular-nums">{formatRupiah(row.total)}</TableCell>
                            <TableCell className="text-center"><HistoryStatusBadge status={row.status} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div >
    )
}