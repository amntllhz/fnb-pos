import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from "sonner"
import { authClient } from '@/lib/auth-client'
import logoMark from '@/assets/logo-duotone.svg'


export function useLogin() {
    const router = useRouter()
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
    const [isPending, startTransition] = useTransition()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    function handleLogin(formData: FormData) {
        const emailValue = formData.get('email') as string
        const passwordValue = formData.get('password') as string
        setEmail(emailValue)
        setPassword(passwordValue)

        // 1. Validasi kosong dulu, di client, sebelum nembak ke server
        const errors: typeof fieldErrors = {}
        if (!emailValue) errors.email = 'Email is required'
        if (!passwordValue) errors.password = 'Password is required'
        setFieldErrors(errors)
        if (errors.email || errors.password) return // stop di sini, gak usah lanjut

        startTransition(async () => {
            const { error } = await authClient.signIn.email({ email: emailValue, password: passwordValue })
            if (error) {
                toast.error('Login Failed', {
                    description: 'Your email or password is Invalid'
                })
                setPassword('')
                return
            }
            router.push('/products')
            router.refresh()
        })
    }

    return { handleLogin, fieldErrors, isPending, logoMark, email, setEmail, password, setPassword }
}