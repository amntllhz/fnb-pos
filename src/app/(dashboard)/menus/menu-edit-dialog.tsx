'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { ImageDropzone } from "@/components/image-dropzone"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { CategoryCombobox } from "@/components/category-combobox"
import { NumericFormat } from "react-number-format"
import { useMenuEditForm } from "./use-menu-edit-form"

type Menu = { id: string; name: string; price: number; imageUrl: string | null; category: string[] }

export function MenuEditDialog({
    menu, open, onOpenChange,
}: { menu: Menu; open: boolean; onOpenChange: (open: boolean) => void }) {
    const {
        handleSubmit, fieldErrors, isPending, state,
        price, setPrice, selectedCategories, setSelectedCategories
    } = useMenuEditForm(menu, onOpenChange, open)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl space-y-2">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <svg className="text-prim size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21.1213 2.70705C19.7069 1.29263 17.4337 1.29263 16.0192 2.70705L2.70711 16.019C2.32658 16.3996 2.07381 16.886 1.98215 17.4135L1.00586 23.0062C0.943072 23.3607 1.05373 23.7238 1.30192 23.972C1.55011 24.2202 1.91325 24.3309 2.26775 24.2681L7.86044 23.2918C8.38794 23.2002 8.87433 22.9474 9.25487 22.5668L22.5669 9.25477C23.9813 7.84035 23.9813 5.56713 22.5669 4.15271L21.1213 2.70705ZM17.4335 4.12126C18.2144 3.34021 19.4262 3.34021 20.2071 4.12126L21.6527 5.56692C22.4336 6.34797 22.4336 7.55951 21.6527 8.34056L20.2071 9.78621L16.9878 6.56691L17.4335 4.12126ZM15.5735 7.98104L18.7928 11.2003L8.83064 21.1625C8.69899 21.2941 8.53024 21.3832 8.34664 21.4168L3.84007 22.2036L4.62689 17.697C4.66052 17.5134 4.74964 17.3446 4.88129 17.213L15.5735 7.98104Z" fill="currentColor" />
                        </svg>
                        <DialogTitle>Edit Menu</DialogTitle>
                    </div>
                </DialogHeader>
                {open && (
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }}
                        noValidate
                        className="space-y-4">
                        <input type="hidden" name="id" value={menu.id} />
                        <div className="grid grid-flow-col grid-cols-5 grid-rows-3 gap-4">
                            <Field className="col-span-3">
                                <FieldLabel className="text-xs text-neutral-400" htmlFor="edit-name">Nama Menu</FieldLabel>
                                <Input id="edit-name" name="name" defaultValue={menu.name} aria-invalid={!!fieldErrors.name} />
                                {fieldErrors.name && <FieldError className="text-[10px]">{fieldErrors.name}</FieldError>}
                            </Field>
                            <Field className="col-span-3">
                                <FieldLabel className="text-xs text-neutral-400">Kategori</FieldLabel>
                                <CategoryCombobox value={selectedCategories} onChange={setSelectedCategories} />
                                {fieldErrors.category && <FieldError className="text-[10px]">{fieldErrors.category}</FieldError>}
                            </Field>
                            <Field className="col-span-3">
                                <FieldLabel className="text-xs text-neutral-400" htmlFor="edit-price">Harga</FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon><InputGroupText className="text-neutral-400">Rp</InputGroupText></InputGroupAddon>
                                    <NumericFormat
                                        customInput={InputGroupInput}
                                        id="edit-price"
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        allowNegative={false}
                                        value={price}
                                        onValueChange={(values) => setPrice(values.floatValue)}
                                        placeholder="0"
                                        aria-invalid={!!fieldErrors.price}
                                    />
                                    <InputGroupAddon align="inline-end"><InputGroupText className="text-neutral-400">IDR</InputGroupText></InputGroupAddon>
                                </InputGroup>
                                {fieldErrors.price && <FieldError className="text-[10px]">{fieldErrors.price}</FieldError>}
                            </Field>
                            <Field className="row-span-3 col-span-2">
                                <FieldLabel className="text-xs text-neutral-400" htmlFor="edit-image">Gambar</FieldLabel>
                                <ImageDropzone name="image" defaultPreview={menu?.imageUrl} allowRemove={false} />
                            </Field>
                        </div>
                        {state.error && <p className="text-destructive text-sm">{state.error}</p>}
                        <Button type="submit" className="w-full bg-prim mt-2 hover:bg-prim-dark" disabled={isPending}>
                            {isPending ? "Menyimpan..." : "Update"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}