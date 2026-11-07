import { z } from "zod"

export const MAX_ITEM_QTY = 99
export const PAYMENT_METHODS = ["CASH", "EWALLET", "BANK_TRANSFER", "QRIS"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const orderSchema = z.object({
    items: z
        .array(
            z.object({
                menuId: z.string().min(1),
                quantity: z.number().int().min(1).max(MAX_ITEM_QTY),
            })
        )
        .min(1),
    paymentMethod: z.enum(PAYMENT_METHODS),
    amountPaid: z.number().int().positive().optional(),
})