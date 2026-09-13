'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const productSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().int().positive(),
})

export async function createProduct(prevState: unknown, formData: FormData) {
    // 1. Cek login — ini yang bikin action aman, gak asal siapa aja bisa nembak endpoint ini
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) {
        return { error: 'Belum login' }
    }

    // 2. Validasi input — jangan percaya data dari client mentah-mentah
    const parsed = productSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
    })
    if (!parsed.success) {
        return { error: 'Nama atau harga gak valid' }
    }

    // 3. Simpan
    await prisma.product.create({ data: parsed.data })

    // 4. Kasih tau Next.js: data di halaman /products udah berubah, refresh cache-nya
    revalidatePath('/products')

    return { error: null }
}

export async function updateProduct(prevState: unknown, formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: 'Belum login' }

    const id = formData.get('id') as string
    const parsed = productSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
    })
    if (!parsed.success) return { error: 'Nama atau harga gak valid' }

    await prisma.product.update({
        where: { id },
        data: parsed.data,
    })

    revalidatePath('/products')
    return { error: null }
}

export async function deleteProduct(id: string) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) throw new Error('Belum login')

    await prisma.product.delete({ where: { id } })
    revalidatePath('/products')
}