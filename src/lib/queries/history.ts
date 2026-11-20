import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { dateToYmd, getBusinessDate, parseYmd } from "@/lib/business-date"
import type { HistoryParams } from "@/lib/history-schema"
import { getBusinessNow } from "../business-now"
import { isFinalDay } from "../export-period"

type Viewer = { id: string; role?: string | null }

/** Rentang tanggal efektif. Kasir selalu dikunci ke hari ini, apa pun isi URL-nya. */
export function resolveRange(params: HistoryParams, isOwner: boolean) {
    const today = getBusinessDate()
    if (!isOwner) return { from: today, to: today }

    let from = (params.from && parseYmd(params.from)) || today
    let to = (params.to && parseYmd(params.to)) || from
    if (from.getTime() > to.getTime()) [from, to] = [to, from]
    return { from, to }
}

export async function getHistory(params: HistoryParams, viewer: Viewer) {
    const isOwner = viewer.role === "OWNER"
    const range = resolveRange(params, isOwner)

    // Nomor transaksi maksimal 6 digit. Lebih dari itu pasti tidak ada (0 tidak pernah terpakai),
    // sekaligus mencegah angka melebihi batas Int database.
    const digits = params.q?.replace(/\D/g, "")
    const orderNumber = digits ? (digits.length <= 6 ? Number(digits) : 0) : undefined

    const where: Prisma.OrderWhereInput = {
        orderDate: { gte: range.from, lte: range.to },
        ...(params.method ? { paymentMethod: params.method } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(orderNumber !== undefined ? { orderNumber } : {}),
    }

    const pageSize = params.size
    const total = await prisma.order.count({ where })
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const page = Math.min(params.page, totalPages) // ?page=999 jatuh ke halaman terakhir

    const rows = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
            id: true,
            orderDate: true,
            orderNumber: true,
            createdAt: true,
            total: true,
            paymentMethod: true,
            status: true,
            cashier: { select: { name: true } },
            _count: { select: { items: true } },
        },
    })

    const now = getBusinessNow()

    return {
        rows: rows.map((o) => ({
            id: o.id,
            canVoid: o.status === "COMPLETED" && dateToYmd(o.orderDate) === now.todayYmd && !isFinalDay(now.todayYmd, now),
            orderNumber: o.orderNumber,
            createdAt: o.createdAt.toISOString(),
            cashierName: o.cashier.name,
            paymentMethod: o.paymentMethod,
            status: o.status,
            total: o.total,
            itemCount: o._count.items,
        })),
        total,
        page,
        pageSize,
        totalPages,
        range: { from: dateToYmd(range.from), to: dateToYmd(range.to) },
        filters: { method: params.method, status: params.status, q: params.q },
    }
}