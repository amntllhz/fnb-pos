'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { orderSchema } from '@/lib/order-schema'
import { DEFAULT_STORE_NAME } from '@/lib/constants'
import type { ReceiptData } from '@/lib/receipt'
import { getBusinessDate } from '@/lib/business-date'
import { receiptSelect, toReceipt } from '@/lib/queries/receipt'
import { OPEN_HOUR, CLOSE_HOUR, isOpenHour } from '@/lib/business-hours'
import { getBusinessNow } from '@/lib/business-now'
import { isFinalDay } from '@/lib/export-period'

export async function createOrder(input: unknown) {
    // 1. Harus login (kasir dan owner sama-sama boleh bikin transaksi)
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false as const, error: 'Belum login' }

    if (!isOpenHour(getBusinessNow().hour)) {
        return {
            success: false as const,
            error: `Di luar jam operasional (${OPEN_HOUR}.00-${CLOSE_HOUR}.00). Transaksi tidak bisa diproses.`,
        }
    }

    // 2. Validasi bentuk data
    const parsed = orderSchema.safeParse(input)
    if (!parsed.success) return { success: false as const, error: 'Data pesanan tidak valid' }
    const { items, paymentMethod, amountPaid, customerName, cashierId } = parsed.data

    const cashier = await prisma.user.findUnique({ where: { id: cashierId }, select: { id: true } })
    if (!cashier) return { success: false as const, error: 'Kasir tidak ditemukan' }

    // 3. Gabungkan baris menu yang kembar (jaga-jaga kalau request dipalsukan)
    const qtyByMenu = new Map<string, number>()
    for (const item of items) {
        qtyByMenu.set(item.menuId, (qtyByMenu.get(item.menuId) ?? 0) + item.quantity)
    }
    const menuIds = [...qtyByMenu.keys()]

    // 4. Ambil harga ASLI dari database
    const menus = await prisma.menu.findMany({
        where: { id: { in: menuIds }, isActive: true, isAvailable: true },
        select: { id: true, price: true },
    })
    if (menus.length !== menuIds.length) {
        return { success: false as const, error: 'Ada menu yang sudah tidak tersedia. Muat ulang halaman.' }
    }

    const lines = menus.map((m) => ({
        menuId: m.id,
        quantity: qtyByMenu.get(m.id)!,
        price: m.price, // snapshot harga saat transaksi
    }))
    const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)

    // 5. Aturan tunai: uang diterima wajib ada dan tidak boleh kurang dari total
    let paid: number | null = null
    if (paymentMethod === 'CASH') {
        if (amountPaid === undefined || amountPaid < total) {
            return { success: false as const, error: 'Uang yang diterima kurang dari total' }
        }
        paid = amountPaid
    }

    // 6. Simpan order + item sekaligus, nomor = nomor terbesar hari ini + 1
    const orderDate = getBusinessDate()
    try {
        const order = await prisma.$transaction(async (tx) => {
            const last = await tx.order.aggregate({
                where: { orderDate },
                _max: { orderNumber: true },
            })
            return tx.order.create({
                data: {
                    orderDate,
                    orderNumber: (last._max.orderNumber ?? 0) + 1,
                    cashierId,
                    customerName,
                    total,
                    paymentMethod,
                    amountPaid: paid,
                    items: { create: lines },
                },
                select: receiptSelect,
            })
        })

        return { success: true as const, error: null, receipt: await toReceipt(order) }

    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return { success: false as const, error: 'Nomor transaksi bentrok. Tekan Bayar sekali lagi.' }
        }
        console.error('createOrder gagal:', e)
        return { success: false as const, error: 'Gagal menyimpan transaksi. Coba lagi.' }
    }
}


export async function getReceipt(orderId: unknown) {
    // 1. Harus login
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false as const, error: 'Belum login' }

    if (typeof orderId !== 'string') {
        return { success: false as const, error: 'Transaksi tidak ditemukan' }
    }

    // 2. Akses dicek di query, aturannya sama dengan getHistory:
    //    owner boleh semua, kasir hanya transaksinya sendiri hari ini
    const isOwner = session.user.role === 'OWNER'
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            ...(isOwner ? {} : { orderDate: getBusinessDate() }),
        },
        select: receiptSelect,
    })

    // Sengaja satu pesan untuk "tidak ada" dan "bukan hakmu", supaya id order tidak bisa ditebak
    if (!order) return { success: false as const, error: 'Transaksi tidak ditemukan' }

    return { success: true as const, error: null, receipt: await toReceipt(order) }
}

export async function voidOrder(orderId: unknown) {
    // 1. Harus login dan harus owner (dicek di server, bukan cuma disembunyikan di UI)
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false as const, error: 'Belum login' }
    if (session.user.role !== 'OWNER') {
        return { success: false as const, error: 'Hanya owner yang bisa membatalkan transaksi' }
    }
    if (typeof orderId !== 'string') {
        return { success: false as const, error: 'Transaksi tidak ditemukan' }
    }

    const now = getBusinessNow()
    if (isFinalDay(now.todayYmd, now)) {
        return { success: false as const, error: `Penjualan sudah ditutup setelah jam ${CLOSE_HOUR}.00, transaksi tidak bisa dibatalkan` }
    }

    // 2. Satu update atomik: hanya order COMPLETED yang bisa di-void, jadi tidak bisa dua kali
    const { count } = await prisma.order.updateMany({
        where: { id: orderId, status: 'COMPLETED', orderDate: getBusinessDate() },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
    })
    if (count === 0) {
        return { success: false as const, error: 'Transaksi tidak ditemukan, sudah dibatalkan, atau bukan transaksi hari ini' }
    }

    return { success: true as const, error: null }
}
