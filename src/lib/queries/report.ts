import { prisma } from "@/lib/prisma"
import { dateToYmd } from "@/lib/business-date"
import type { HistoryParams } from "@/lib/history-schema"
import { resolveRange } from "@/lib/queries/history"

/** Laporan khusus owner: hanya filter tanggal. Angka penjualan hanya menghitung transaksi COMPLETED. */
export async function getReport(params: HistoryParams) {
    const range = resolveRange(params, true)
    const where = { orderDate: { gte: range.from, lte: range.to } }

    const [sales, byMethod, cancelledCount] = await Promise.all([
        prisma.order.aggregate({
            where: { ...where, status: "COMPLETED" },
            _sum: { total: true },
            _count: { _all: true },
        }),
        prisma.order.groupBy({
            by: ["paymentMethod"],
            where: { ...where, status: "COMPLETED" },
            _sum: { total: true },
            _count: { _all: true },
            orderBy: { _sum: { total: "desc" } },
        }),
        prisma.order.count({ where: { ...where, status: "CANCELLED" } }),
    ])

    const totalSales = sales._sum.total ?? 0
    const orderCount = sales._count._all

    return {
        range: { from: dateToYmd(range.from), to: dateToYmd(range.to) },
        totalSales,
        orderCount,
        average: orderCount ? Math.round(totalSales / orderCount) : 0,
        cancelledCount,
        byMethod: byMethod.map((m) => ({
            method: m.paymentMethod,
            total: m._sum.total ?? 0,
            count: m._count._all,
        })),
    }
}

export type ReportResult = Awaited<ReturnType<typeof getReport>>