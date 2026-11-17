import { z } from "zod"
import { parseYmd } from "./business-date"
import { ORDER_STATUSES, PAYMENT_METHODS } from "./order-schema"

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
export const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0]

const ymd = z.string().refine((value) => parseYmd(value) !== null)

// .catch() = nilai tidak valid jatuh ke default, bukan melempar error.
// URL bisa diketik siapa saja, jadi semuanya diperlakukan sebagai input tak tepercaya.
export const historyParamsSchema = z.object({
    from: ymd.optional().catch(undefined),
    to: ymd.optional().catch(undefined),
    method: z.enum(PAYMENT_METHODS).optional().catch(undefined),
    status: z.enum(ORDER_STATUSES).optional().catch(undefined),
    q: z.string().trim().max(20).optional().catch(undefined),
    page: z.coerce.number().int().min(1).catch(1),
    size: z.coerce
        .number()
        .refine((n) => (PAGE_SIZE_OPTIONS as readonly number[]).includes(n))
        .catch(DEFAULT_PAGE_SIZE),
})

export type HistoryParams = z.infer<typeof historyParamsSchema>

export function parseHistoryParams(
    raw: Record<string, string | string[] | undefined>
): HistoryParams {
    // ?page=1&page=2 menghasilkan array, ambil yang pertama
    const flat = Object.fromEntries(
        Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
    )
    return historyParamsSchema.parse(flat)
}