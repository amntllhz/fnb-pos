import { startTransition, useActionState, useEffect, useState } from "react"
import { createMenu } from "@/lib/actions/menu"

type FieldErrors = { name?: string; price?: string; category?: string }

export function useMenuCreateForm(onOpenChange: (open: boolean) => void) {
    const [state, formAction, isPending] = useActionState(createMenu, { error: null, success: false })
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [price, setPrice] = useState<number | undefined>(undefined)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    useEffect(() => {
        if (state.success) onOpenChange(false)
    }, [state.success, onOpenChange])

    function handleSubmit(formData: FormData) {
        const name = formData.get('name') as string

        const errors: FieldErrors = {}
        if (!name) errors.name = 'Nama produk wajib diisi'
        if (!price) errors.price = 'Harga wajib diisi'
        if (selectedCategories.length === 0) errors.category = 'Pilih minimal 1 kategori'
        setFieldErrors(errors)
        if (Object.keys(errors).length > 0) return

        startTransition(() => {
            formData.set('price', String(price))
            selectedCategories.forEach(c => formData.append('category', c))
            formAction(formData)
        })
    }

    return {
        handleSubmit, fieldErrors, isPending, state,
        price, setPrice, selectedCategories, setSelectedCategories
    }
}
