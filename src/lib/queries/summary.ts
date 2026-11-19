import { prisma } from "@/lib/prisma"

export const DAY = 86_400_000

type Scope = { from: Date; to: Date; cashierId?: string }

/**
 * Satu-satunya tempat angka ringkasan penjualan dihitung, dipakai Dashboard dan Laporan
 * supaya angkanya tidak bisa berbeda. Hanya order COMPLETED yang masuk omzet.
 */
export async function getSalesSummary({ from, to, cashierId }: Scope) {
    const where = { orderDate: { gte: from, lte: to }, ...(cashierId ? { cashierId } : {}) }

    const [sales, cancelledCount] = await Promise.all([
        prisma.order.aggregate({
            where: { ...where, status: "COMPLETED" },
            _sum: { total: true },
            _count: { _all: true },
        }),
        prisma.order.count({ where: { ...where, status: "CANCELLED" } }),
    ])

    const totalSales = sales._sum.total ?? 0
    const orderCount = sales._count._all

    return {
        totalSales,
        orderCount,
        average: orderCount ? Math.round(totalSales / orderCount) : 0,
        cancelledCount,
    }
}

/** Periode pembanding: rentang sama panjang tepat sebelum periode ini. */
export function previousRange({ from, to }: { from: Date; to: Date }) {
    const days = Math.round((to.getTime() - from.getTime()) / DAY) + 1
    return { from: new Date(from.getTime() - days * DAY), to: new Date(from.getTime() - DAY) }
}

/** Selisih persen terhadap periode sebelumnya. null kalau pembandingnya 0 (tidak ada dasar). */
export const percentChange = (current: number, previous: number) =>
    previous > 0 ? Math.round(((current - previous) / previous) * 100) : null