'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { hashPassword } from 'better-auth/crypto'
import { auth } from '@/lib/auth'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/prisma'

const cashierSchema = z.object({
    name: z.string().trim().min(1, 'Nama wajib diisi').max(50, 'Nama maksimal 50 karakter'),
    email: z.string().trim().toLowerCase().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter').max(128),
})

export async function createCashier(prevState: unknown, formData: FormData) {
    // 1. Hanya owner yang boleh menambah akun
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return { error: 'Belum login', success: false }
    if (session.user.role !== 'OWNER') return { error: 'Hanya owner yang bisa menambah kasir', success: false }

    // 2. Validasi input
    const parsed = cashierSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    })
    if (!parsed.success) return { error: parsed.error.issues[0].message, success: false }
    const { name, email, password } = parsed.data

    // 3. User dan akun login dibuat bersamaan, supaya tidak ada user tanpa akun.
    //    Role selalu KASIR, tidak bisa diisi dari form.
    const passwordHash = await hashPassword(password)
    try {
        await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({ data: { name, email, role: 'KASIR', emailVerified: true } })
            await tx.account.create({
                data: {
                    id: crypto.randomUUID(),
                    accountId: user.id,
                    providerId: 'credential',
                    userId: user.id,
                    password: passwordHash,
                },
            })
        })
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            return { error: 'Email sudah dipakai', success: false }
        }
        console.error('createCashier gagal:', e)
        return { error: 'Gagal menambah kasir. Coba lagi.', success: false }
    }

    revalidatePath('/cashiers')
    return { error: null, success: true }
}