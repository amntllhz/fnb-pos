'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma/client'
import { orderSchema } from '@/lib/order-schema'
import { DEFAULT_STORE_NAME } from '@/lib/constants'
import type { ReceiptData } from '@/lib/receipt'

// Tanggal bisnis dihitung di zona WIB, bukan jam server (Vercel = UTC)
function getBusinessDate() {
    const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
    return new Date(`${ymd}T00:00:00.000Z`)
}

export async function createOrder(input: unknown) {
    // 1. Harus login (kasir dan owner sama-sama boleh bikin transaksi)
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { success: false as const, error: 'Belum login' }

    // 2. Validasi bentuk data
    const parsed = orderSchema.safeParse(input)
    if (!parsed.success) return { success: false as const, error: 'Data pesanan tidak valid' }
    const { items, paymentMethod, amountPaid } = parsed.data

    // 3. Gabungkan baris menu yang kembar (jaga-jaga kalau request dipalsukan)
    const qtyByMenu = new Map<string, number>()
    for (const item of items) {
        qtyByMenu.set(item.menuId, (qtyByMenu.get(item.menuId) ?? 0) + item.quantity)
    }
    const menuIds = [...qtyByMenu.keys()]

    // 4. Ambil harga ASLI dari database
    const menus = await prisma.menu.findMany({
        where: { id: { in: menuIds }, isActive: true },
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
                    cashierId: session.user.id,
                    total,
                    paymentMethod,
                    amountPaid: paid,
                    items: { create: lines },
                },
                select: {
                    orderNumber: true,
                    createdAt: true,
                    total: true,
                    paymentMethod: true,
                    amountPaid: true,
                    cashier: { select: { name: true } },
                    items: { select: { quantity: true, price: true, menu: { select: { name: true } } } },
                },
            })
        })

        const receipt: ReceiptData = {
            orderNumber: order.orderNumber,
            createdAt: order.createdAt.toISOString(),
            cashierName: order.cashier.name,
            paymentMethod: order.paymentMethod,
            items: order.items.map((i) => ({ name: i.menu.name, quantity: i.quantity, price: i.price })),
            total: order.total,
            amountPaid: order.amountPaid,
            change: order.amountPaid !== null ? order.amountPaid - order.total : null,
            store: await getStoreInfo(),
        }

        return { success: true as const, error: null, receipt }

    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return { success: false as const, error: 'Nomor transaksi bentrok. Tekan Bayar sekali lagi.' }
        }
        console.error('createOrder gagal:', e)
        return { success: false as const, error: 'Gagal menyimpan transaksi. Coba lagi.' }
    }
}

async function getStoreInfo() {
    try {
        const store = await prisma.storeSetting.findFirst({
            select: { name: true, address: true, phone: true },
        })
        if (store) return store
    } catch (e) {
        console.error('Gagal membaca StoreSetting:', e)
    }
    return { name: DEFAULT_STORE_NAME, address: null, phone: null }
}