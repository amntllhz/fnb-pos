"use client"

import * as React from "react"

import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox"

import { categories } from "@/lib/constants"

export function CategoryCombobox({
    value,
    onChange,
    invalid = false
}: {
    value: string[]
    onChange: (value: string[]) => void
    invalid?: boolean
}) {
    const anchor = useComboboxAnchor()

    return (
        <Combobox
            multiple
            autoHighlight
            items={categories}
            value={value}
            onValueChange={onChange}
            aria-invalid={invalid}
        >
            <ComboboxChips ref={anchor} className={`w-full ${invalid ? 'border-destructive ring-3 ring-destructive/20' : ''}`}>
                <ComboboxValue>
                    {(selectedValues: string[]) => (
                        <React.Fragment>
                            {selectedValues.map((val) => {
                                // Cari objek category berdasarkan value yang terpilih ('PEDAS', 'GURIH', dll)
                                const category = categories.find((c) => c.value === val)
                                return (
                                    <ComboboxChip key={val}>
                                        {/* Tampilkan label ('Pedas') bukan value ('PEDAS') */}
                                        {category ? category.label : val}
                                    </ComboboxChip>
                                )
                            })}
                            <ComboboxChipsInput />
                        </React.Fragment>
                    )}
                </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor} className="z-9999 pointer-events-auto">
                <ComboboxEmpty>Kategori tidak ditemukan.</ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
                        <ComboboxItem key={item.value} value={item.value}>
                            {/* Tampilkan label pada daftar pilihan */}
                            {item.label}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}