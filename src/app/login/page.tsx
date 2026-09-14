'use client'

import { useLogin } from './use-login'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useState } from 'react'
import Image from 'next/image'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card"
import {
    Field,
    FieldLabel,
    FieldDescription
} from "@/components/ui/field"
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const { handleLogin, fieldErrors, isPending, logoMark, email, setEmail, password, setPassword } = useLogin()
    const [showPassword, setShowPassword] = useState(false)

    return (
        <>
            <div className='bg-gray-50 flex h-screen items-center justify-center'>
                <Card className='max-w-sm w-full space-y-2'>
                    <CardHeader>
                        <Image src={logoMark} alt="" className='w-30 h-auto mx-auto py-1' loading='eager' />
                        <CardDescription className='text-xs text-foreground/40 text-center'>Masukkan kredensial anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleLogin} className='space-y-3'>
                            <Field>
                                <FieldLabel className='text-xs' htmlFor="email">Email <span className="text-destructive">*</span></FieldLabel>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-2 size-4 text-input" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="example@gmail.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        aria-invalid={!!fieldErrors.email}
                                        className='text-foreground text-[10px] pl-9 placeholder:text-foreground/40 placeholder:text-xs'
                                    />
                                    {fieldErrors.email && (
                                        <FieldDescription className="text-destructive text-[10px]">{fieldErrors.email}</FieldDescription>
                                    )}
                                </div>
                            </Field>
                            <Field>
                                <FieldLabel className='text-xs' htmlFor="password">Password <span className="text-destructive">*</span></FieldLabel>
                                <div className='relative'>
                                    <Lock className="absolute left-3 top-1/2 -translate-y-2 size-4 text-input" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Masukkan password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        aria-invalid={!!fieldErrors.password}
                                        className='text-foreground text-[10px] pl-9 placeholder:text-foreground/40 placeholder:text-xs'
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    >
                                        {showPassword ? <EyeOff className="size-4 text-input" /> : <Eye className="size-4 text-input" />}
                                    </button>
                                    {fieldErrors.password && (
                                        <FieldDescription className="text-destructive text-[10px]">{fieldErrors.password}</FieldDescription>
                                    )}
                                </div>
                            </Field>
                            <Button size='lg' type='submit' className='w-full mt-4 bg-prim cursor-pointer hover:bg-prim-dark' disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Spinner className='mr-1.5' />
                                        Mengautentikasi...
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div >
        </>
    )
}