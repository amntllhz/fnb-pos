'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')

    async function handleLogin(formData: FormData) {
        const { error } = await authClient.signIn.email({
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        })

        if (error) {
            setError(error.message ?? 'Login gagal')
            return
        }

        router.push('/products') // sukses login, lempar ke halaman produk
        router.refresh() // paksa Server Component re-render biar session ke-detect
    }

    return (
        <form action={handleLogin}>
            <input name="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
    )
}