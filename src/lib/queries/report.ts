import { prisma } from "@/lib/prisma"
import { dateToYmd, getBusinessDate } from "@/lib/business-date"
import type { HistoryParams } from "@/lib/history-schema"
import { resolveRange } from "@/lib/queries/history"
import { DAY, getSalesSummary, percentChange, previousRange } from "@/lib/queries/summary"
import { getBusinessNow } from "@/lib/business-now"
import { getExportOptions } from "@/lib/export-period"

/** Satu-satunya tempat rentang Laporan ditentukan, juga dipakai export. Tanpa rentang di URL, default 7 hari terakhir. */
export function resolveReportRange(params: HistoryParams) {
    const today = getBusinessDate()
    return params.from ? resolveRange(params, true) : { from: new Date(today.getTime() - 6 * DAY), to: today }
}

/** Laporan khusus owner. Semua angka penjualan hanya menghitung transaksi COMPLETED. */
export async function getReport(params: HistoryParams) {
    const range = resolveReportRange(params)

    const where = { orderDate: { gte: range.from, lte: range.to } }
    const completed = { ...where, status: "COMPLETED" as const }
    const cancelled = { ...where, status: "CANCELLED" as const }

    const [current, previous, perDay, byMethod, perMenuPrice, perCashier, cancelledByCashier, menus, users] =
        await Promise.all([
            getSalesSummary(range),
            getSalesSummary(previousRange(range)),
            prisma.order.groupBy({
                by: ["orderDate"],
                where: completed,
                _sum: { total: true },
                _count: { _all: true },
            }),
            prisma.order.groupBy({
                by: ["paymentMethod"],
                where: completed,
                _sum: { total: true },
                _count: { _all: true },
                orderBy: { _sum: { total: "desc" } },
            }),
            // Dikelompokkan per (menu, harga) supaya omzet = harga snapshot x jumlah, tanpa SQL mentah
            prisma.orderItem.groupBy({
                by: ["menuId", "price"],
                where: { order: completed },
                _sum: { quantity: true },
            }),
            prisma.order.groupBy({
                by: ["cashierId"],
                where: completed,
                _sum: { total: true },
                _count: { _all: true },
            }),
            prisma.order.groupBy({ by: ["cashierId"], where: cancelled, _count: { _all: true } }),
            prisma.menu.findMany({ select: { id: true, name: true } }),
            prisma.user.findMany({ select: { id: true, name: true } }),
        ])

    // Tren harian: hari tanpa penjualan tetap muncul sebagai 0
    const byDate = new Map(perDay.map((d) => [dateToYmd(d.orderDate), d]))
    const daily: { date: string; total: number; count: number }[] = []
    for (let t = range.from.getTime(); t <= range.to.getTime(); t += DAY) {
        const date = dateToYmd(new Date(t))
        const d = byDate.get(date)
        daily.push({ date, total: d?._sum.total ?? 0, count: d?._count._all ?? 0 })
    }

    // Rincian per menu, diurutkan dari omzet terbesar
    const menuName = new Map(menus.map((m) => [m.id, m.name]))
    const menuAgg = new Map<string, { qty: number; revenue: number }>()
    for (const row of perMenuPrice) {
        const qty = row._sum.quantity ?? 0
        const acc = menuAgg.get(row.menuId) ?? { qty: 0, revenue: 0 }
        acc.qty += qty
        acc.revenue += qty * row.price
        menuAgg.set(row.menuId, acc)
    }
    const byMenu = [...menuAgg]
        .map(([id, v]) => ({ id, name: menuName.get(id) ?? "-", ...v }))
        .sort((a, b) => b.revenue - a.revenue)

    // Kinerja kasir, termasuk yang hanya punya transaksi dibatalkan (penting untuk audit)
    const userName = new Map(users.map((u) => [u.id, u.name]))
    const sales = new Map(
        perCashier.map((c) => [c.cashierId, { count: c._count._all, total: c._sum.total ?? 0 }])
    )
    const voids = new Map(cancelledByCashier.map((c) => [c.cashierId, c._count._all]))
    const byCashier = [...new Set([...sales.keys(), ...voids.keys()])]
        .map((id) => {
            const s = sales.get(id) ?? { count: 0, total: 0 }
            return {
                id,
                name: userName.get(id) ?? "-",
                ...s,
                average: s.count ? Math.round(s.total / s.count) : 0,
                cancelled: voids.get(id) ?? 0,
            }
        })
        .sort((a, b) => b.total - a.total)

    return {
        range: { from: dateToYmd(range.from), to: dateToYmd(range.to) },
        summary: current,
        change: {
            sales: percentChange(current.totalSales, previous.totalSales),
            orders: percentChange(current.orderCount, previous.orderCount),
            average: percentChange(current.average, previous.average),
        },
        daily,
        byMethod: byMethod.map((m) => ({
            method: m.paymentMethod,
            total: m._sum.total ?? 0,
            count: m._count._all,
        })),
        byMenu,
        byCashier,
        exportOptions: getExportOptions(getBusinessNow()),
    }
}

export type ReportResult = Awaited<ReturnType<typeof getReport>>