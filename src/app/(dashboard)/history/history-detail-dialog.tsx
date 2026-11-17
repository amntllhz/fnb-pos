'use client'

import { useEffect, useRef, useState } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { formatOrderNumber } from '@/lib/format'
import type { ReceiptData } from '@/lib/receipt'
import { MenuReceipt } from '../menus/menu-receipt'
import { getReceipt } from '@/lib/actions/order'
import { HistoryStatusBadge } from './history-status-badge'
import type { HistoryRow } from './types'

export function HistoryDetailDialog({ row, onClose }: { row: HistoryRow | null; onClose: () => void }) {
    return (
        <Dialog open={row !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm">
                {/* key = state dibuang tiap ganti transaksi */}
                {row && <DetailBody key={row.id} row={row} />}
            </DialogContent>
        </Dialog>
    )
}

function DetailBody({ row }: { row: HistoryRow }) {
    const [receipt, setReceipt] = useState<ReceiptData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const receiptRef = useRef<HTMLDivElement>(null)

    // ponytail: logika cetak disalin dari menu-checkout-success, ekstrak kalau ada pemakai ketiga
    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Struk-${formatOrderNumber(row.orderNumber)}`,
        pageStyle: '@page { margin: 0 }',
    })

    useEffect(() => {
        let ignore = false
        getReceipt(row.id)
            .then((res) => {
                if (ignore) return
                if (res.success) setReceipt(res.receipt)
                else setError(res.error)
            })
            .catch(() => !ignore && setError('Gagal memuat transaksi'))
        return () => { ignore = true }
    }, [row.id])

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-sm">
                    {formatOrderNumber(row.orderNumber)}
                    <HistoryStatusBadge status={row.status} />
                </DialogTitle>
                <DialogDescription className="text-xs">Detail transaksi</DialogDescription>
            </DialogHeader>

            {error ? (
                <p className="py-10 text-center text-xs text-destructive">{error}</p>
            ) : !receipt ? (
                <div className="flex justify-center py-10"><Spinner /></div>
            ) : (
                <div className="max-h-96 overflow-y-auto rounded-lg border">
                    <div ref={receiptRef}>
                        <MenuReceipt receipt={receipt} />
                    </div>
                </div>
            )}

            {/* Order yang dibatalkan tidak bisa dicetak ulang */}
            {row.status === 'COMPLETED' && (
                <Button type="button" variant="outline" className="text-xs" disabled={!receipt} onClick={() => handlePrint()}>
                    <Printer className="mr-1.5 size-3.5" />
                    Cetak Ulang
                </Button>
            )}
        </>
    )
}