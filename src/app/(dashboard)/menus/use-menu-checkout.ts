'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createOrder } from '@/lib/actions/order'
import { formatRupiah } from '@/lib/format'
import type { PaymentMethod } from '@/lib/order-schema'
import type { ReceiptData } from '@/lib/receipt'
import type { CartItem } from './use-menu-cart'

type Options = { items: CartItem[]; totalPrice: number; onSuccess: () => void }

export function useMenuCheckout({ items, totalPrice, onSuccess }: Options) {
    const [isSubmitting, startTransition] = useTransition()
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
    const [amountPaid, setAmountPaid] = useState<number | undefined>(undefined)
    const [fieldError, setFieldError] = useState<string | null>(null)
    const [receipt, setReceipt] = useState<ReceiptData | null>(null)

    function reset() {
        setPaymentMethod('CASH')
        setAmountPaid(undefined)
        setFieldError(null)
        setReceipt(null)
    }

    // wrapper: perubahan input membersihkan pesan error lama
    function selectPaymentMethod(method: PaymentMethod) {
        setPaymentMethod(method)
        setFieldError(null)
    }

    function changeAmountPaid(value: number | undefined) {
        setAmountPaid(value)
        setFieldError(null)
    }

    function handleSubmit() {
        if (paymentMethod === 'CASH' && (!amountPaid || amountPaid < totalPrice)) {
            setFieldError(`Uang diterima minimal ${formatRupiah(totalPrice)}`)
            return
        }

        startTransition(async () => {
            try {
                const res = await createOrder({
                    items: items.map((i) => ({ menuId: i.id, quantity: i.qty })),
                    paymentMethod,
                    amountPaid: paymentMethod === 'CASH' ? amountPaid : undefined,
                })

                if (!res.success) {
                    toast.error(res.error)
                    return
                }

                setReceipt(res.receipt) // data yang benar-benar tersimpan di database
                onSuccess()             // kosongkan keranjang
            } catch {
                toast.error('Gagal terhubung ke server. Periksa koneksi lalu coba lagi.')
            }
        })
    }

    return {
        isSubmitting, paymentMethod, selectPaymentMethod, amountPaid, changeAmountPaid,
        fieldError, receipt, handleSubmit, reset,
    }
}