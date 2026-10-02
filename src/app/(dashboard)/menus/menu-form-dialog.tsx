'use client'

import { useActionState, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { createMenu } from "@/lib/actions/menu"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageDropzone } from "@/components/image-dropzone"
import { categories } from "@/lib/constants"
import { CurrencyInput } from "@/components/currency-input"

export function MenuFormDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, formAction, isPending] = useActionState(createMenu, { error: null, success: false })
    const [price, setPrice] = useState(0)

    useEffect(() => {
        if (state.success) onOpenChange(false)
    }, [state.success, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Produk</DialogTitle>
                </DialogHeader>
                {open && (
                    <form action={formAction} className="space-y-3">
                        <Field>
                            <FieldLabel className="text-xs" htmlFor="name">Nama Produk</FieldLabel>
                            <Input id="name" name="name" required />
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs">Kategori</FieldLabel>
                            <div className="flex flex-wrap gap-3">
                                {categories.map((cat) => (
                                    <label key={cat.value} className="flex items-center gap-2 text-sm">
                                        <Checkbox name="category" className="data-[state=checked]:bg-prim data-[state=checked]:border-prim data-[state=checked]:text-white" value={cat.value} />
                                        {cat.label}
                                    </label>
                                ))}
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs" htmlFor="image">Gambar</FieldLabel>
                            <ImageDropzone name="image" />
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs" htmlFor="price">Harga</FieldLabel>
                            <CurrencyInput name="price" value={price} onValueChange={setPrice} />
                        </Field>
                        {state.error && <p className="text-destructive text-sm">{state.error}</p>}
                        <Button type="submit" className="w-full bg-prim hover:bg-prim-dark" disabled={isPending}>
                            {isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}