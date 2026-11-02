'use client'

import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingCart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatRupiah } from '@/lib/format'
import type { CartItem } from './use-menu-cart'

type MenuCartPanelProps = {
    items: CartItem[]
    totalItems: number
    totalPrice: number
    isOpen: boolean
    onIncrement: (id: string) => void
    onDecrement: (id: string) => void
    onRemove: (id: string) => void
    onClear: () => void
    onCheckout: () => void
}

export function MenuCartPanel({
    items,
    totalItems,
    totalPrice,
    isOpen,
    onIncrement,
    onDecrement,
    onRemove,
    onClear,
    onCheckout,
}: MenuCartPanelProps) {
    return (
        <aside
            aria-label="Keranjang"
            inert={!isOpen}
            className={[
                'sticky top-0 h-svh shrink-0 self-start overflow-hidden bg-card transition-[width] duration-300 ease-in-out',
                isOpen ? 'w-64' : 'w-0',
            ].join(' ')}
        >
            {/* Lapisan dalam: lebar selalu tetap (samakan dengan w-64 di atas),
                jadi isi terpotong saat animasi, bukan terperas. */}
            <div className="flex h-full w-64 flex-col border-l">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="size-3 text-prim" />
                        <span className="font-semibold text-xs">Keranjang</span>
                        <span className="inline-flex items-center justify-center size-4 rounded-sm bg-prim/5 ring ring-prim/20 ring-inset text-prim text-[8px] font-bold leading-none">
                            {totalItems}
                        </span>
                    </div>
                    <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={onClear}
                        aria-label="Kosongkan keranjang"
                    >
                        <X className="size-3.5" />
                    </Button>
                </div>

                <Separator />

                {/* Item List: satu-satunya bagian panel yang scroll */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-3 space-y-2">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-2.5 rounded-lg p-2 bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="shrink-0 size-10 rounded-md overflow-hidden bg-neutral-200">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            width={40}
                                            height={40}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-200" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-medium leading-tight truncate">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        {formatRupiah(item.price)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                        size="icon-xs"
                                        variant="outline"
                                        className="size-5"
                                        onClick={() => onDecrement(item.id)}
                                        aria-label={`Kurangi ${item.name}`}
                                    >
                                        <Minus className="size-2.5" />
                                    </Button>
                                    <span className="w-5 text-center text-xs font-semibold tabular-nums">
                                        {item.qty}
                                    </span>
                                    <Button
                                        size="icon-xs"
                                        variant="outline"
                                        className="size-5"
                                        onClick={() => onIncrement(item.id)}
                                        aria-label={`Tambah ${item.name}`}
                                    >
                                        <Plus className="size-2.5" />
                                    </Button>
                                    <Button
                                        size="icon-xs"
                                        variant="ghost"
                                        className="size-5 text-destructive hover:text-destructive hover:bg-destructive/10 ml-0.5"
                                        onClick={() => onRemove(item.id)}
                                        aria-label={`Hapus ${item.name}`}
                                    >
                                        <Trash2 className="size-2.5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                {/* Footer: Total dan Checkout */}
                <div className="p-4 space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <span className="text-sm font-bold text-foreground">
                            {formatRupiah(totalPrice)}
                        </span>
                    </div>
                    <Button
                        className="w-full bg-prim hover:bg-prim-dark text-white text-xs font-semibold h-9"
                        aria-label="Proses pembayaran"
                        onClick={onCheckout}
                    >
                        Proses Pembayaran
                    </Button>
                </div>
            </div>
        </aside>
    )
}
