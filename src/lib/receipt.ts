import type { PaymentMethod } from "./order-schema"

export type ReceiptData = {
    orderNumber: number
    createdAt: string // ISO 8601
    cashierName: string
    paymentMethod: PaymentMethod
    items: { name: string; quantity: number; price: number }[]
    total: number
    amountPaid: number | null
    change: number | null
    store: { name: string; address: string | null; phone: string | null }
}