import { auth } from "@/lib/auth"
import { parseYmd, dateToYmd } from "@/lib/business-date"
import { orderStatusLabels, paymentMethodLabels } from "@/lib/constants"
import { toCsv } from "@/lib/csv"
import { formatOrderNumber } from "@/lib/format"
import { prisma } from "@/lib/prisma"
import { getBusinessNow } from "@/lib/business-now"
import { resolveExport } from "@/lib/export-period"

// Waktu ditulis menurut WIB, sama dengan yang dilihat di aplikasi
const TIME_ZONE = "Asia/Jakarta"
const timeFormat = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
})
const dateTimeFormat = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
})

export async function GET(request: Request) {
    // Dijaga di server, bukan cuma tombolnya yang disembunyikan
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) return new Response("Belum login", { status: 401 })
    if (session.user.role !== "OWNER") return new Response("Hanya owner yang bisa mengekspor data", { status: 403 })

    // Rentang diselesaikan oleh fungsi yang sama dengan halaman Laporan, jadi isi file = yang tampil di layar
    const search = new URL(request.url).searchParams
    const period = resolveExport(
        { date: search.get("date") ?? undefined, month: search.get("month") ?? undefined },
        getBusinessNow()
    )
    if (!period.ok) return new Response(period.error, { status: 400 })
    const from = parseYmd(period.from)!
    const to = parseYmd(period.to)!

    // Semua transaksi, termasuk yang dibatalkan, supaya file bisa dipakai untuk audit
    const orders = await prisma.order.findMany({
        where: { orderDate: { gte: from, lte: to } },
        orderBy: [{ orderDate: "asc" }, { orderNumber: "asc" }],
        select: {
            orderDate: true,
            customerName: true,
            orderNumber: true,
            createdAt: true,
            total: true,
            paymentMethod: true,
            amountPaid: true,
            status: true,
            cancelledAt: true,
            cashier: { select: { name: true } },
            items: { select: { quantity: true } },
        },
    })

    const csv = toCsv([
        ["No. Transaksi", "Tanggal", "Waktu", "Pelanggan", "Kasir", "Metode", "Total Porsi", "Total", "Uang Diterima", "Kembalian", "Status", "Dibatalkan Pada"],
        ...orders.map((o) => [
            formatOrderNumber(o.orderNumber),
            dateToYmd(o.orderDate),
            timeFormat.format(o.createdAt),
            o.customerName,
            o.cashier.name,
            paymentMethodLabels[o.paymentMethod],
            o.items.reduce((sum, i) => sum + i.quantity, 0),
            o.total,
            o.amountPaid,
            o.amountPaid !== null ? o.amountPaid - o.total : null,
            orderStatusLabels[o.status],
            o.cancelledAt ? dateTimeFormat.format(o.cancelledAt) : null,
        ]),
    ])

    const filename = `penjualan_${period.name}.csv`
    return new Response(csv, {
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    })
}