import { formatDateTime, formatOrderNumber, formatRupiah } from '@/lib/format'
import { paymentMethodLabels } from '@/lib/constants'
import type { ReceiptData } from '@/lib/receipt'
import Image from 'next/image';
import logoFull from '@/assets/logo-red.svg'

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
    return (
        <div className={bold ? 'flex justify-between gap-2 font-bold' : 'flex justify-between gap-2'}>
            <span>{label}</span>
            <span className="tabular-nums">{value}</span>
        </div>
    )
}

function Divider() {
    return <div aria-hidden="true" className="my-2 border-t border-dashed border-black" />
}

export function MenuReceipt({ receipt }: { receipt: ReceiptData }) {
    const { store, items } = receipt

    return (
        <div className="w-full bg-white px-6 py-2 font-mono text-[10px] leading-snug text-black">
            <div className="flex flex-col text-center justify-center items-center py-2">
                <Image
                    src={logoFull}
                    alt="Logo Full"
                    className="w-28 h-auto shrink-0"
                    loading="eager"
                />
                {store.address && <p>{store.address}</p>}
                {store.phone && <p>{store.phone}</p>}
            </div>

            <Divider />

            <div className="space-y-0.5">
                <Row label="No" value={formatOrderNumber(receipt.orderNumber)} />
                <Row label="Waktu" value={formatDateTime(receipt.createdAt)} />
                <Row label="Kasir" value={receipt.cashierName} />
            </div>

            <Divider />

            <div className="space-y-1">
                {items.map((item, index) => (
                    <div key={`${item.name}-${index}`}>
                        <p>{item.name}</p>
                        <Row
                            label={`${item.quantity} x ${formatRupiah(item.price)}`}
                            value={formatRupiah(item.quantity * item.price)}
                        />
                    </div>
                ))}
            </div>

            <Divider />

            <Row label="Total" value={formatRupiah(receipt.total)} bold />
            <Row label="Metode" value={paymentMethodLabels[receipt.paymentMethod]} />
            {receipt.amountPaid !== null && receipt.change !== null && (
                <>
                    <Row label="Tunai" value={formatRupiah(receipt.amountPaid)} />
                    <Row label="Kembali" value={formatRupiah(receipt.change)} />
                </>
            )}

            <Divider />

            <p className="text-center py-4">Terima kasih & Sampai jumpa kembali</p>
        </div>
    )
}