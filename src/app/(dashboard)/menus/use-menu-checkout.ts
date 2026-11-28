'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createOrder } from '@/lib/actions/order'
import { formatRupiah } from '@/lib/format'
import type { PaymentMethod } from '@/lib/order-schema'
import type { ReceiptData } from '@/lib/receipt'
import type { CartItem } from './use-menu-cart'

type Options = { items: CartItem[]; totalPrice: number; onSuccess: () => void; defaultCashierId: string }

export function useMenuCheckout({ items, totalPrice, onSuccess, defaultCashierId }: Options) {
    const [isSubmitting, startTransition] = useTransition()
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
    const [amountPaid, setAmountPaid] = useState<number | undefined>(undefined)
    const [fieldError, setFieldError] = useState<string | null>(null)
    const [receipt, setReceipt] = useState<ReceiptData | null>(null)
    const [customerName, setCustomerName] = useState('')
    const [customerError, setCustomerError] = useState<string | null>(null)
    const [cashierId, setCashierId] = useState(defaultCashierId)

    function reset() {
        setPaymentMethod('CASH')
        setAmountPaid(undefined)
        setFieldError(null)
        setReceipt(null)
        setCustomerName('')
        setCustomerError(null)
        setCashierId(defaultCashierId)
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

    function changeCustomerName(value: string) {
        setCustomerName(value)
        setCustomerError(null)
    }

    function changeCashierId(value: string) {
        setCashierId(value)
    }

    function handleSubmit() {
        const name = customerName.trim()
        let invalid = false
        if (!name) {
            setCustomerError('Nama customer wajib diisi')
            invalid = true
        }
        if (paymentMethod === 'CASH' && (!amountPaid || amountPaid < totalPrice)) {
            setFieldError(`Uang diterima minimal ${formatRupiah(totalPrice)}`)
            invalid = true
        }
        if (invalid) return

        startTransition(async () => {
            try {
                const res = await createOrder({
                    items: items.map((i) => ({ menuId: i.id, quantity: i.qty })),
                    paymentMethod,
                    amountPaid: paymentMethod === 'CASH' ? amountPaid : undefined,
                    customerName: name,
                    cashierId,
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
        fieldError, receipt, handleSubmit, reset, customerName, customerError, changeCustomerName, cashierId, changeCashierId,
    }
}