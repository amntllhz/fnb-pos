import { z } from "zod"

export const MAX_ITEM_QTY = 99

export const orderSchema = z.object({
    items: z
        .array(
            z.object({
                menuId: z.string().min(1),
                quantity: z.number().int().min(1).max(MAX_ITEM_QTY),
            })
        )
        .min(1),
    paymentMethod: z.enum(["CASH", "EWALLET", "BANK_TRANSFER", "QRIS"]),
    amountPaid: z.number().int().positive().optional(),
})