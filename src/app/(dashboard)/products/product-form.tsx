'use client'

import { useActionState } from 'react'
import { createProduct } from '@/lib/actions/product'

export function ProductForm() {
    const [state, formAction, isPending] = useActionState(createProduct, { error: null })

    return (
        <form action={formAction}>
            <input name="name" placeholder="Nama produk" required />
            <input name="price" type="number" placeholder="Harga" required />
            <button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Tambah'}
            </button>
            {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
        </form>
    )
}