'use client'

import { useActionState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { createProduct } from "@/lib/actions/product"

export function ProductFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, formAction, isPending] = useActionState(createProduct, { error: null, success: false })

    useEffect(() => {
        if (state.success) onOpenChange(false)
    }, [state.success, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Produk</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="space-y-3">
                    <Field>
                        <FieldLabel htmlFor="name">Nama Produk</FieldLabel>
                        <Input id="name" name="name" required />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="price">Harga</FieldLabel>
                        <Input id="price" name="price" type="number" required />
                    </Field>
                    {state.error && <p className="text-destructive text-sm">{state.error}</p>}
                    <Button type="submit" className="w-full" disabled={isPending}>
                        {isPending ? "Menyimpan..." : "Simpan"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}