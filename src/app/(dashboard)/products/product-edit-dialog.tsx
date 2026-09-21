'use client'

import { useActionState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { updateProduct } from "@/lib/actions/product"

type Product = { id: string; name: string; price: number }

export function ProductEditDialog({
    product, open, onOpenChange,
}: { product: Product; open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, formAction, isPending] = useActionState(updateProduct, { error: null, success: false })

    useEffect(() => {
        if (state.success) onOpenChange(false)
    }, [state.success, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Produk</DialogTitle>
                </DialogHeader>
                {open && (
                    <form action={formAction} className="space-y-3">
                        <input type="hidden" name="id" value={product.id} />
                        <Field>
                            <FieldLabel htmlFor="name">Nama Produk</FieldLabel>
                            <Input id="name" name="name" defaultValue={product.name} required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="price">Harga</FieldLabel>
                            <Input id="price" name="price" type="number" defaultValue={product.price} required />
                        </Field>
                        {state.error && <p className="text-destructive text-sm">{state.error}</p>}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Menyimpan..." : "Update"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}