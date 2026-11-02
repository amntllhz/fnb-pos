'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { NumericFormat } from 'react-number-format'
import { formatRupiah, formatOrderNumber } from '@/lib/format'
import { useMenuCheckout, type PaymentMethod } from './use-menu-checkout'
import type { CartItem } from './use-menu-cart'
import { CircleCheckIcon, Banknote, Wallet, Building2, QrCode } from 'lucide-react'
import { cn } from 'cn'

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { value: 'CASH', label: 'Tunai', icon: <Banknote className="size-4" /> },
    { value: 'EWALLET', label: 'E-Wallet', icon: <Wallet className="size-4" /> },
    { value: 'BANK_TRANSFER', label: 'Transfer', icon: <Building2 className="size-4" /> },
    { value: 'QRIS', label: 'QRIS', icon: <QrCode className="size-4" /> },
]

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    items: CartItem[]
    totalPrice: number
    onSuccess: () => void
}

export function MenuCheckoutDialog({ open, onOpenChange, items, totalPrice, onSuccess }: Props) {
    const {
        isSubmitting,
        paymentMethod,
        setPaymentMethod,
        amountPaid,
        setAmountPaid,
        fieldError,
        result,
        handleSubmit,
        reset,
    } = useMenuCheckout(onSuccess)

    function handleOpenChange(val: boolean) {
        if (!val) reset()
        onOpenChange(val)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-sm space-y-1">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <svg className='size-4.5 text-prim' width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 10H2M11 14H6M2 8.2L2 15.8C2 16.9201 2 17.4802 2.21799 17.908C2.40973 18.2843 2.71569 18.5903 3.09202 18.782C3.51984 19 4.07989 19 5.2 19L18.8 19C19.9201 19 20.4802 19 20.908 18.782C21.2843 18.5903 21.5903 18.2843 21.782 17.908C22 17.4802 22 16.9201 22 15.8V8.2C22 7.0799 22 6.51984 21.782 6.09202C21.5903 5.7157 21.2843 5.40974 20.908 5.21799C20.4802 5 19.9201 5 18.8 5L5.2 5C4.0799 5 3.51984 5 3.09202 5.21799C2.7157 5.40973 2.40973 5.71569 2.21799 6.09202C2 6.51984 2 7.07989 2 8.2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <DialogTitle>Proses Pembayaran</DialogTitle>
                    </div>
                </DialogHeader>

                {open && (
                    <>
                        {/* Order Summary */}
                        <div className="rounded-lg bg-muted/50 space-y-2">
                            <p className="text-xs font-medium text-neutral-400">Ringkasan Pesanan</p>
                            <div className="space-y-1 max-h-36 overflow-y-auto pr-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-xs">
                                        <span className="text-foreground truncate max-w-[60%]">
                                            {item.name}
                                            <span className="text-muted-foreground ml-1">×{item.qty}</span>
                                        </span>
                                        <span className="font-medium tabular-nums shrink-0">
                                            {formatRupiah(item.price * item.qty)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between bg-neutral-50 ring ring-neutral-200 ring-inset rounded-md py-1.5 px-2">
                                <span className="text-xs text-muted-foreground">Total</span>
                                <span className="text-sm text-prim font-bold">{formatRupiah(totalPrice)}</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <Field>
                            <FieldLabel className="text-xs text-neutral-400">Metode Pembayaran</FieldLabel>
                            <div className="grid grid-cols-4 gap-1.5">
                                {PAYMENT_METHODS.map((m) => (
                                    <button
                                        key={m.value}
                                        type="button"
                                        onClick={() => setPaymentMethod(m.value)}
                                        aria-pressed={paymentMethod === m.value}
                                        className={cn(
                                            'flex flex-col items-center gap-1 rounded-lg border p-2.5 text-[10px] font-medium transition-all duration-150',
                                            paymentMethod === m.value
                                                ? 'border-prim bg-prim/5 text-prim'
                                                : 'border-border text-muted-foreground hover:border-prim/40 hover:text-foreground'
                                        )}
                                    >
                                        {m.icon}
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        {/* Cash Amount Input — only for CASH */}
                        {paymentMethod === 'CASH' && (
                            <Field>
                                <FieldLabel className="text-xs text-neutral-400" htmlFor="amount-paid">
                                    Uang Diterima
                                </FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon>
                                        <InputGroupText className="text-neutral-400">Rp</InputGroupText>
                                    </InputGroupAddon>
                                    <NumericFormat
                                        customInput={InputGroupInput}
                                        id="amount-paid"
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        allowNegative={false}
                                        value={amountPaid}
                                        onValueChange={(values) => setAmountPaid(values.floatValue)}
                                        placeholder="0"
                                        aria-invalid={!!fieldError}
                                        className="text-xs"
                                    />
                                </InputGroup>
                                {fieldError && (
                                    <FieldError className="text-[10px]">{fieldError}</FieldError>
                                )}
                                {/* Kembalian preview */}
                                {amountPaid !== undefined && amountPaid >= totalPrice && (
                                    <p className="text-[10px] text-muted-foreground">
                                        Kembalian:{' '}
                                        <span className="font-semibold text-green-600">
                                            {formatRupiah(amountPaid - totalPrice)}
                                        </span>
                                    </p>
                                )}
                            </Field>
                        )}

                        <DialogFooter className="-mx-4 -mb-4 mt-2">
                            <Button
                                type="button"
                                className="flex-1 bg-prim hover:bg-prim-dark text-white text-xs font-semibold"
                                disabled={isSubmitting}
                                onClick={() => handleSubmit(items)}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner className="mr-1.5 size-3.5" />
                                        Memproses...
                                    </>
                                ) : (
                                    `Bayar ${formatRupiah(totalPrice)}`
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
