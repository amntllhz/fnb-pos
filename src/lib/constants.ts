import type { PaymentMethod } from "./order-schema"

export const categories = [
    { value: 'PEDAS', label: 'Pedas' },
    { value: 'GURIH', label: 'Gurih' },
    { value: 'MANIS', label: 'Manis' },
    { value: 'SEGAR', label: 'Segar' },
] as const

export const paymentMethodLabels: Record<PaymentMethod, string> = {
    CASH: "Tunai",
    EWALLET: "E-Wallet",
    BANK_TRANSFER: "Transfer",
    QRIS: "QRIS",
}

export type Category = (typeof categories)[number]
export const DEFAULT_STORE_NAME = "FnB POS"