'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const menuSchema = z.object({
    name: z.string().min(1),
    price: z.coerce.number().int().positive(),
    category: z.array(z.enum(['PEDAS', 'GURIH', 'MANIS', 'SEGAR']))
})

async function saveImage(file: File): Promise<string> {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true }) // bikin folder kalo belum ada
    const filename = `${Date.now()}-${file.name}`
    await writeFile(path.join(uploadDir, filename), buffer)
    return `/uploads/${filename}` // ini yang disimpen ke DB
}

export async function createMenu(prevState: unknown, formData: FormData) {
    // 1. Cek login — ini yang bikin action aman, gak asal siapa aja bisa nembak endpoint ini
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: 'Belum login', success: false }
    if (session.user.role !== 'OWNER') return { error: 'Anda tidak memiliki hak akses untuk menambah produk', success: false }

    // 2. Validasi input — jangan percaya data dari client mentah-mentah
    const parsed = menuSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
        category: formData.getAll('category')
    })
    if (!parsed.success) return { error: 'Nama atau harga gak valid', success: false }

    // 3. Simpan
    const imageFile = formData.get('image') as File

    if (!imageFile || imageFile.size === 0) {
        return { error: 'Gambar menu wajib diunggah!', success: false }
    }

    const imageUrl = await saveImage(imageFile)

    await prisma.menu.create({ data: { ...parsed.data, imageUrl } })

    // 4. Kasih tau Next.js: data di halaman /products udah berubah, refresh cache-nya
    revalidatePath('/menus')

    return { error: null, success: true }
}

export async function updateMenu(prevState: unknown, formData: FormData) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: 'Belum login', success: false }
    if (session.user.role !== 'OWNER') return { error: 'Anda tidak memiliki hak akses untuk mengedit produk', success: false }

    const id = formData.get('id') as string
    const parsed = menuSchema.safeParse({
        name: formData.get('name'),
        price: formData.get('price'),
        category: formData.getAll('category')
    })
    if (!parsed.success) return { error: 'Nama atau harga gak valid', success: false }

    const data: Record<string, unknown> = { ...parsed.data }
    const imageFile = formData.get('image') as File
    if (imageFile && imageFile.size > 0) {
        data.imageUrl = await saveImage(imageFile) // cuma di-update kalo ada file baru dipilih
    }

    await prisma.menu.update({
        where: { id },
        data: data,
    })

    revalidatePath('/menus')
    return { error: null, success: true }
}

export async function deleteMenu(id: string) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) throw new Error('Belum login')
    if (session.user.role !== 'OWNER') throw new Error('Cuma owner yang bisa hapus produk')

    await prisma.menu.delete({ where: { id } })
    revalidatePath('/menus')
}