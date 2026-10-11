import { startTransition, useActionState, useEffect, useState } from "react"
import { createMenu } from "@/lib/actions/menu"
import { toast } from "sonner";

type FieldErrors = { name?: string; price?: string; category?: string, image?: string }

export function useMenuCreateForm(onOpenChange: (open: boolean) => void) {
    const [state, formAction, isPending] = useActionState(createMenu, { error: null, success: false })
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [price, setPrice] = useState<number | undefined>(undefined)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])

    useEffect(() => {
        if (state.success) {
            toast.success("Berhasil menambahkan", {
                description: "Menu baru telah ditambahkan ke daftar",
                icon:
                    <svg className="size-4 text-green-500" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.5 12L10.5 15L16.5 9M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
            })
            onOpenChange(false)
        }
    }, [state.success, onOpenChange])

    function handleSubmit(formData: FormData) {
        const name = formData.get('name') as string
        const imageFile = formData.get('image') as File

        const errors: FieldErrors = {}
        if (!name) errors.name = 'Nama produk wajib diisi'
        if (!price) errors.price = 'Harga wajib diisi'
        if (selectedCategories.length === 0) errors.category = 'Pilih minimal 1 kategori'
        if (!imageFile || imageFile.size === 0) errors.image = 'Gambar menu wajib diunggah'
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
