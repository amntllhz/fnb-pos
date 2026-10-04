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
}: {
    value: string[]
    onChange: (value: string[]) => void
}) {
    const anchor = useComboboxAnchor()

    return (
        <Combobox
            multiple
            autoHighlight
            items={categories}
            value={value}
            onValueChange={onChange}
        >
            <ComboboxChips ref={anchor} className="w-full max-w-xs">
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