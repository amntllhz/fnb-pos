'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createOrder } from '@/lib/actions/order'
import { formatRupiah, formatOrderNumber } from '@/lib/format'
import type { CartItem } from './use-menu-cart'

export type PaymentMethod = 'CASH' | 'EWALLET' | 'BANK_TRANSFER' | 'QRIS'

type CheckoutResult =
    | { success: true; orderNumber: number; total: number; change: number | null }
    | null

export function useMenuCheckout(onSuccess: () => void) {
    const [isSubmitting, startTransition] = useTransition()
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
    const [amountPaid, setAmountPaid] = useState<number | undefined>(undefined)
    const [fieldError, setFieldError] = useState<string | null>(null)
    const [result, setResult] = useState<CheckoutResult>(null)

    function reset() {
        setPaymentMethod('CASH')
        setAmountPaid(undefined)
        setFieldError(null)
        setResult(null)
    }

    function handleSubmit(items: CartItem[]) {
        // Client-side validation for CASH amountPaid
        if (paymentMethod === 'CASH') {
            const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
            if (!amountPaid || amountPaid < total) {
                setFieldError(`Uang diterima minimal ${formatRupiah(total)}`)
                return
            }
        }
        setFieldError(null)

        startTransition(async () => {
            const payload = {
                items: items.map((i) => ({ menuId: i.id, quantity: i.qty })),
                paymentMethod,
                amountPaid: paymentMethod === 'CASH' ? amountPaid : undefined,
            }

            const res = await createOrder(payload)

            if (!res.success) {
                toast.error(res.error)
                return
            }

            setResult({
                success: true,
                orderNumber: res.order.orderNumber,
                total: res.order.total,
                change: res.order.change,
            })

            toast.success(`Transaksi ${formatOrderNumber(res.order.orderNumber)} berhasil`, {
                description: `Total: ${formatRupiah(res.order.total)}`,
            })

            onSuccess()
        })
    }

    return {
        isSubmitting,
        paymentMethod,
        setPaymentMethod,
        amountPaid,
        setAmountPaid,
        fieldError,
        result,
        handleSubmit,
        reset,
    }
}
