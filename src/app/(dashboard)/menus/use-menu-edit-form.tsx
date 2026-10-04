import { startTransition, useActionState, useEffect, useState } from "react"
import { updateMenu } from "@/lib/actions/menu"

type FieldErrors = { name?: string; price?: string; category?: string }

export function useMenuEditForm(
    menu: { id: string; name: string; price: number; category: string[] },
    onOpenChange: (open: boolean) => void,
    open: boolean
) {
    const [state, formAction, isPending] = useActionState(updateMenu, { error: null, success: false })
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [price, setPrice] = useState<number | undefined>(menu.price)
    const [selectedCategories, setSelectedCategories] = useState<string[]>(menu.category)

    // Reset to current menu values when dialog reopens
    useEffect(() => {
        if (open) {
            setPrice(menu.price)
            setSelectedCategories(menu.category)
            setFieldErrors({})
        }
    }, [open, menu])

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
