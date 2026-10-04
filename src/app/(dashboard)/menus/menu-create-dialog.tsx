'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { ImageDropzone } from "@/components/image-dropzone"
import { useMenuCreateForm } from "./use-menu-create-form"
import { NumericFormat } from "react-number-format"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { CategoryCombobox } from "@/components/category-combobox"

export function MenuCreateDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const {
        handleSubmit, fieldErrors, isPending, state,
        price, setPrice, selectedCategories, setSelectedCategories
    } = useMenuCreateForm(onOpenChange)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl space-y-2">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <svg className="text-prim size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <DialogTitle>Tambah Menu</DialogTitle>
                    </div>
                </DialogHeader>
                {open && (
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSubmit(new FormData(e.currentTarget)) }}
                        noValidate
                        className="space-y-4">
                        <div className="grid grid-flow-col grid-cols-5 grid-rows-3 gap-4">
                            <Field className="col-span-3">
                                <FieldLabel className="text-xs text-neutral-400" htmlFor="name">Nama Menu</FieldLabel>
                                <Input id="name" name="name" aria-invalid={!!fieldErrors.name} />
                                {fieldErrors.name && <FieldError className="text-[10px]">{fieldErrors.name}</FieldError>}
                            </Field>
                            <Field className="col-span-3">
                                <FieldLabel className="text-xs text-neutral-400">Kategori</FieldLabel>
                                <CategoryCombobox value={selectedCategories} onChange={setSelectedCategories} />
                                {fieldErrors.category && <FieldError className="text-[10px]">{fieldErrors.category}</FieldError>}
                            </Field>
                            <Field className="col-span-3">
                                <FieldLabel className="text-xs text-neutral-400" htmlFor="price">Harga</FieldLabel>
                                <InputGroup>
                                    <InputGroupAddon><InputGroupText className="text-neutral-400">Rp</InputGroupText></InputGroupAddon>
                                    <NumericFormat
                                        customInput={InputGroupInput}
                                        id="price"
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
                                <FieldLabel className="text-xs text-neutral-400" htmlFor="image">Gambar</FieldLabel>
                                <ImageDropzone name="image" />
                            </Field>
                        </div>
                        {state.error && <p className="text-destructive text-sm">{state.error}</p>}
                        <Button type="submit" className="w-full bg-prim mt-2 hover:bg-prim-dark" disabled={isPending}>
                            {isPending ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}