'use client'

import { useActionState, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { updateMenu } from "@/lib/actions/menu"
import { ImageDropzone } from "@/components/image-dropzone"
import { Checkbox } from "@/components/ui/checkbox"
import { categories } from "@/lib/constants"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"

type Menu = { id: string; name: string; price: number; imageUrl: string | null; category: string[] }

export function MenuEditDialog({
    menu, open, onOpenChange,
}: { menu: Menu; open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, formAction, isPending] = useActionState(updateMenu, { error: null, success: false })
    const [name, setName] = useState(menu.name)
    const [price, setPrice] = useState(menu.price)
    const [selectedCategories, setSelectedCategories] = useState<string[]>(menu.category)

    useEffect(() => {
        if (open) {
            setName(menu.name)
            setPrice(menu.price)
            setSelectedCategories(menu.category)
        }
    }, [open, menu])

    useEffect(() => {
        if (state.success) onOpenChange(false)
    }, [state.success, onOpenChange])

    function toggleCategory(value: string, checked: boolean) {
        setSelectedCategories((prev) =>
            checked ? [...prev, value] : prev.filter((c) => c !== value)
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Produk</DialogTitle>
                </DialogHeader>
                {open && (
                    <form action={formAction} className="space-y-3">
                        <input type="hidden" name="id" value={menu.id} />
                        <Field>
                            <FieldLabel htmlFor="name">Nama Produk</FieldLabel>
                            <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs">Kategori</FieldLabel>
                            <div className="flex flex-wrap gap-3">
                                {categories.map((cat) => (
                                    <label key={cat.value} className="flex items-center gap-2 text-sm">
                                        <Checkbox
                                            name="category"
                                            value={cat.value}
                                            checked={selectedCategories.includes(cat.value)}
                                            onCheckedChange={(checked: boolean | 'indeterminate') => toggleCategory(cat.value, checked === true)}
                                        />
                                        {cat.label}
                                    </label>
                                ))}
                            </div>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="image">Gambar</FieldLabel>
                            <ImageDropzone name="image" defaultPreview={menu?.imageUrl} allowRemove={false} />
                        </Field>
                        <Field>
                            <FieldLabel className="text-xs" htmlFor="price">Harga</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>Rp</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput id="price" name="price" value={price}
                                    onChange={(e) => setPrice(Number(e.target.value))} required placeholder="0.00" />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupText>IDR</InputGroupText>
                                </InputGroupAddon>
                            </InputGroup>
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