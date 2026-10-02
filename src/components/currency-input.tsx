'use client'

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"

export function CurrencyInput({
    name, value, onValueChange,
}: { name: string; value: number; onValueChange: (v: number) => void }) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const digits = e.target.value.replace(/\D/g, '') // buang semua selain angka
        onValueChange(digits ? Number(digits) : 0)
    }

    const formatted = value ? value.toLocaleString('id-ID') : ''

    return (
        <>
            <input type="hidden" name={name} value={value} />
            <InputGroup>
                <InputGroupAddon><InputGroupText>Rp</InputGroupText></InputGroupAddon>
                <InputGroupInput value={formatted} onChange={handleChange} placeholder="0" />
                <InputGroupAddon align="inline-end"><InputGroupText>IDR</InputGroupText></InputGroupAddon>
            </InputGroup>
        </>
    )
}