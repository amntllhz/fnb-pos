'use client'

import { useActionState } from 'react'
import { updateProduct, deleteProduct } from '@/lib/actions/product'

export function ProductItem({ product }: { product: { id: string; name: string; price: number } }) {
    const [state, formAction, isPending] = useActionState(updateProduct, { error: null })

    return (
        <li>
            <form action={formAction}>
                <input type="hidden" name="id" value={product.id} />
                <input name="name" defaultValue={product.name} />
                <input name="price" type="number" defaultValue={product.price} />
                <button type="submit" disabled={isPending}>Update</button>
            </form>
            <button onClick={() => deleteProduct(product.id)}>Hapus</button>
            {state.error && <p style={{ color: 'red' }}>{state.error}</p>}
        </li>
    )
}