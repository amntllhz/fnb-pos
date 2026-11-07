'use client'

import { useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
import { CircleCheckIcon, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatOrderNumber } from '@/lib/format'
import type { ReceiptData } from '@/lib/receipt'
import { MenuReceipt } from './menu-receipt'

export function MenuCheckoutSuccess({ receipt, onDone }: { receipt: ReceiptData; onDone: () => void }) {
    const receiptRef = useRef<HTMLDivElement>(null)

    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: `Struk-${formatOrderNumber(receipt.orderNumber)}`,
        pageStyle: '@page { margin: 0 }',
    })

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center gap-1 text-center py-3">
                <CircleCheckIcon className="size-6 text-green-600" />
                <div className='flex flex-col gap-0.5'>
                    <p className="text-xs font-semibold">Pembayaran berhasil</p>
                    <p className="text-[11px] text-muted-foreground">
                        Transaksi {formatOrderNumber(receipt.orderNumber)} tersimpan
                    </p>
                </div>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border">
                <div ref={receiptRef}>
                    <MenuReceipt receipt={receipt} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" className="text-xs" onClick={() => handlePrint()}>
                    <Printer className="mr-1.5 size-3.5" />
                    Cetak Struk
                </Button>
                <Button type="button" className="bg-prim text-xs hover:bg-prim-dark" onClick={onDone}>
                    Selesai
                </Button>
            </div>
        </div>
    )
}