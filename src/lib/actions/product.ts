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
    if (!session) return { error: 'Belum login', success: false }
    if (session.user.role !== 'OWNER') return { error: 'Anda tidak memiliki hak akses untuk menambah produk', success: false }

    // 2. Validasi input — jangan percaya data dari client mentah-mentah
    const parsed = productSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
    })
    if (!parsed.success) return { error: 'Nama atau harga gak valid', success: false }

    // 3. Simpan
    await prisma.product.create({ data: parsed.data })

    // 4. Kasih tau Next.js: data di halaman /products udah berubah, refresh cache-nya
    revalidatePath('/products')

    return { error: null, success: true }
}

export async function updateProduct(prevState: unknown, formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: 'Belum login', success: false }
    if (session.user.role !== 'OWNER') return { error: 'Anda tidak memiliki hak akses untuk mengedit produk', success: false }

    const id = formData.get('id') as string
    const parsed = productSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
    })
    if (!parsed.success) return { error: 'Nama atau harga gak valid', success: false }

    await prisma.product.update({
        where: { id },
        data: parsed.data,
    })

    revalidatePath('/products')
    return { error: null, success: true }
}

export async function deleteProduct(id: string) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) throw new Error('Belum login')
    if (session.user.role !== 'OWNER') throw new Error('Cuma owner yang bisa hapus produk')

    await prisma.product.delete({ where: { id } })
    revalidatePath('/products')
}