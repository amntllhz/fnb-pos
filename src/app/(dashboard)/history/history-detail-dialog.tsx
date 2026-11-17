'use client'

import Image from "next/image"
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useReactToPrint } from 'react-to-print'
import { Ban, Printer } from 'lucide-react'
import { toast } from 'sonner'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { formatOrderNumber } from '@/lib/format'
import type { ReceiptData } from '@/lib/receipt'
import { MenuReceipt } from '../menus/menu-receipt'
import { getReceipt, voidOrder } from '@/lib/actions/order'
import { HistoryStatusBadge } from './history-status-badge'
import type { HistoryRow } from './types'
import Delete from "@/assets/delete.svg"

type Props = { row: HistoryRow | null; isOwner: boolean; onClose: () => void }

export function HistoryDetailDialog({ row, isOwner, onClose }: Props) {
    return (
        <Dialog open={row !== null} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-sm">
                {/* key = state dibuang tiap ganti transaksi */}
                {row && <DetailBody key={row.id} row={row} isOwner={isOwner} onClose={onClose} />}
            </DialogContent>
        </Dialog>
    )
}

function DetailBody({ row, isOwner, onClose }: { row: HistoryRow; isOwner: boolean; onClose: () => void }) {
    const router = useRouter()
    const [receipt, setReceipt] = useState<ReceiptData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isVoiding, setIsVoiding] = useState(false)
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

    async function handleVoid() {
        setIsVoiding(true)
        try {
            const res = await voidOrder(row.id)
            if (res.success) {
                toast.success(`Transaksi ${formatOrderNumber(row.orderNumber)} dibatalkan`)
                onClose()
                router.refresh() // tabel ikut menampilkan status baru
                return
            }
            toast.error(res.error)
        } catch {
            toast.error('Gagal membatalkan transaksi')
        }
        setIsVoiding(false)
    }

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

            {/* Order yang dibatalkan tidak bisa dicetak ulang maupun di-void lagi */}
            {row.status === 'COMPLETED' && (
                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1 text-xs" disabled={!receipt} onClick={() => handlePrint()}>
                        <Printer className="mr-1.5 size-3.5" />
                        Cetak Ulang
                    </Button>

                    {isOwner && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button type="button" variant="destructive" className="flex-1 text-xs" disabled={isVoiding}>
                                    <Ban className="mr-1.5 size-3.5" />
                                    {isVoiding ? 'Memproses...' : 'Void'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="flex w-full flex-col items-center justify-center">
                                <div className="space-y-1 py-1.5">
                                    <Image src={Delete} alt="Logout" className="w-full h-28" />
                                    <AlertDialogTitle className="px-5 text-center text-xs font-semibold text-gray-800">
                                        Yakin ingin membatalkan {formatOrderNumber(row.orderNumber)}?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="max-w-60 text-center text-[11px] text-gray-400">
                                        Transaksi akan ditandai dibatalkan dan tidak bisa dikembalikan.
                                    </AlertDialogDescription>
                                </div>
                                <div className="mt-2 flex w-full items-center justify-center gap-3">
                                    <AlertDialogCancel className="flex-1 text-xs">Batal</AlertDialogCancel>
                                    <AlertDialogAction className="flex-1 bg-prim! text-xs hover:bg-prim-dark!" onClick={handleVoid}>
                                        Void
                                    </AlertDialogAction>
                                </div>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            )}
        </>
    )
}