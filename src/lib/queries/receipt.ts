import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"
import { DEFAULT_STORE_NAME } from "@/lib/constants"
import type { ReceiptData } from "@/lib/receipt"

export const receiptSelect = {
    orderNumber: true,
    createdAt: true,
    total: true,
    paymentMethod: true,
    amountPaid: true,
    cashier: { select: { name: true } },
    items: { select: { quantity: true, price: true, menu: { select: { name: true } } } },
} satisfies Prisma.OrderSelect

type ReceiptOrder = Prisma.OrderGetPayload<{ select: typeof receiptSelect }>

async function getStoreInfo() {
    try {
        const store = await prisma.storeSetting.findFirst({
            select: { name: true, address: true, phone: true },
        })
        if (store) return store
    } catch (e) {
        console.error("Gagal membaca StoreSetting:", e)
    }
    return { name: DEFAULT_STORE_NAME, address: null, phone: null }
}

export async function toReceipt(order: ReceiptOrder): Promise<ReceiptData> {
    return {
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
}