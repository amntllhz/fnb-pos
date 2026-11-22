import { prisma } from "@/lib/prisma"
import { getBusinessDate } from "@/lib/business-date"
import { DAY, getSalesSummary, percentChange, previousRange } from "@/lib/queries/summary"
import { CLOSE_HOUR, OPEN_HOUR } from "@/lib/business-hours"

export const DASHBOARD_PRESETS = ["today", "yesterday", "7d"] as const
export type DashboardPreset = (typeof DASHBOARD_PRESETS)[number]

/** Nilai tak dikenal jatuh ke "today", sama seperti filosofi parser URL di History. */
export function parsePreset(value: string | undefined): DashboardPreset {
    return DASHBOARD_PRESETS.find((p) => p === value) ?? "today"
}

type Viewer = { role?: string | null }


const COMPARE_LABEL: Record<DashboardPreset, string> = {
    today: "kemarin",
    yesterday: "hari sebelumnya",
    "7d": "7 hari sebelumnya",
}

// Jam penjualan dihitung menurut waktu bisnis (WIB), bukan UTC
const hourFormat = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
})

function presetRange(preset: DashboardPreset) {
    const today = getBusinessDate()
    if (preset === "yesterday") {
        const day = new Date(today.getTime() - DAY)
        return { from: day, to: day }
    }
    if (preset === "7d") return { from: new Date(today.getTime() - 6 * DAY), to: today }
    return { from: today, to: today }
}

export async function getDashboard(presetParam: DashboardPreset, viewer: Viewer) {
    // Data yang dilihat kasir dan owner sama (seluruh toko), bedanya kasir hanya boleh periode hari ini
    const preset = viewer.role === "OWNER" ? presetParam : "today"

    const range = presetRange(preset)
    const completed = {
        orderDate: { gte: range.from, lte: range.to },
        status: "COMPLETED" as const,
    }

    const [current, previous, orders, byMethod, sold, menus] = await Promise.all([
        getSalesSummary(range),
        getSalesSummary(previousRange(range)),
        prisma.order.findMany({ where: completed, select: { createdAt: true, total: true } }),
        prisma.order.groupBy({
            by: ["paymentMethod"],
            where: completed,
            _sum: { total: true },
            _count: { _all: true },
            orderBy: { _sum: { total: "desc" } },
        }),
        prisma.orderItem.groupBy({
            by: ["menuId"],
            where: { order: completed },
            _sum: { quantity: true },
        }),
        prisma.menu.findMany({ select: { id: true, name: true, isActive: true, isAvailable: true } }),
    ])

    // Penjualan per jam. Rentangnya jam buka (10.00-20.00); kalau ada penjualan di luar jam itu
    // rentang melebar supaya total di grafik tetap sama dengan omzet.
    const buckets = Array.from({ length: 24 }, (_, hour) => ({ hour, total: 0, count: 0 }))
    for (const o of orders) {
        const bucket = buckets[Number(hourFormat.format(o.createdAt))]
        bucket.total += o.total
        bucket.count += 1
    }
    const active = buckets.filter((b) => b.count > 0)
    const first = Math.min(OPEN_HOUR, active[0]?.hour ?? OPEN_HOUR)
    const last = Math.max(CLOSE_HOUR - 1, active[active.length - 1]?.hour ?? CLOSE_HOUR - 1)
    const byHour = buckets.slice(first, last + 1)

    // Terlaris: semua menu yang terjual (termasuk yang sudah diarsip).
    // Kurang laku: hanya menu aktif yang ready, karena menu habis wajar tidak terjual.
    const qty = new Map(sold.map((s) => [s.menuId, s._sum.quantity ?? 0]))
    const menuRanking = menus
        .map((m) => ({ id: m.id, name: m.name, qty: qty.get(m.id) ?? 0, eligible: m.isActive && m.isAvailable }))
        .filter((m) => m.qty > 0 || m.eligible)
        .map(({ id, name, qty }) => ({ id, name, qty }))

    return {
        preset,
        compareLabel: COMPARE_LABEL[preset],
        summary: current,
        change: {
            sales: percentChange(current.totalSales, previous.totalSales),
            orders: percentChange(current.orderCount, previous.orderCount),
            average: percentChange(current.average, previous.average),
        },
        byHour,
        byMethod: byMethod.map((m) => ({
            method: m.paymentMethod,
            total: m._sum.total ?? 0,
            count: m._count._all,
        })),
        menuRanking,
        unavailableCount: menus.filter((m) => m.isActive && !m.isAvailable).length,
    }
}

export type DashboardResult = Awaited<ReturnType<typeof getDashboard>>