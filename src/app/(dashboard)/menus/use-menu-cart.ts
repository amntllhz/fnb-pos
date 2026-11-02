'use client'

import { useState, useCallback } from 'react'
import { MAX_ITEM_QTY } from '@/lib/order-schema'

export type CartItem = {
    id: string
    name: string
    price: number
    imageUrl: string | null
    qty: number
}

export function useMenuCart() {
    const [items, setItems] = useState<CartItem[]>([])

    const addItem = useCallback((menu: Omit<CartItem, 'qty'>) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === menu.id)
            if (existing) {
                return prev.map((i) =>
                    i.id === menu.id ? { ...i, qty: i.qty + 1 } : i
                )
            }
            return [...prev, { ...menu, qty: 1 }]
        })
    }, [])

    const removeItem = useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }, [])

    const incrementQty = useCallback((id: string) => {
        setItems((prev) =>
            prev.map((i) =>
                i.id === id ? { ...i, qty: Math.min(i.qty + 1, MAX_ITEM_QTY) } : i
            )
        )
    }, [])

    const decrementQty = useCallback((id: string) => {
        setItems((prev) => {
            const item = prev.find((i) => i.id === id)
            if (!item) return prev
            if (item.qty <= 1) return prev.filter((i) => i.id !== id)
            return prev.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        })
    }, [])

    const clearCart = useCallback(() => setItems([]), [])

    const totalItems = items.reduce((sum, i) => sum + i.qty, 0)
    const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const isOpen = items.length > 0

    return {
        items,
        addItem,
        removeItem,
        incrementQty,
        decrementQty,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
    }
}
