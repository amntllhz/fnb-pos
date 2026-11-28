'use client'

import { useActionState, useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { createCashier } from "@/lib/actions/cashier"

type User = { id: string; name: string; email: string; role: string; createdAt: string }

const ROLE_LABELS: Record<string, string> = { OWNER: "Owner", KASIR: "Kasir" }

function CreateCashierDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [state, formAction, pending] = useActionState(createCashier, { error: null as string | null, success: false })

    useEffect(() => {
        if (state.success) {
            toast.success("Kasir ditambahkan")
            onOpenChange(false)
        }
    }, [state, onOpenChange])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-sm">Tambah Kasir</DialogTitle>
                    <DialogDescription className="text-xs">Akun baru otomatis berperan sebagai kasir.</DialogDescription>
                </DialogHeader>

                <form action={formAction} className="space-y-3">
                    <div className="space-y-1.5">
                        <label htmlFor="cashier-name" className="text-xs text-neutral-500">Nama</label>
                        <Input id="cashier-name" name="name" placeholder="Kasir 2" required maxLength={50} className="text-xs" />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="cashier-email" className="text-xs text-neutral-500">Email (untuk login)</label>
                        <Input id="cashier-email" name="email" type="email" placeholder="kasir2@email.com" required className="text-xs" />
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="cashier-password" className="text-xs text-neutral-500">Password (minimal 8 karakter)</label>
                        <Input id="cashier-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="text-xs" />
                    </div>

                    {state.error && <p className="text-xs text-destructive">{state.error}</p>}

                    <Button type="submit" className="w-full bg-prim text-xs hover:bg-prim-dark" disabled={pending}>
                        {pending ? "Menyimpan..." : "Simpan"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function CashierList({ users }: { users: User[] }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex min-h-svh min-w-0 flex-col gap-4 px-6 py-4">
            <div className="flex items-center justify-start gap-4">
                <SidebarTrigger className="text-neutral-300 transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" />
                <DynamicBreadcrumb />
            </div>

            <div className="flex items-end justify-between gap-3">
                <div className="flex flex-col space-y-1">
                    <h1 className="text-xl font-extrabold">Kelola Kasir</h1>
                    <p className="text-xs text-neutral-400">Tambah akun untuk karyawan yang memproses transaksi</p>
                </div>
                <Button className="flex shrink-0 items-center gap-1.5 bg-prim pr-4 hover:bg-prim-dark" onClick={() => setOpen(true)}>
                    <Plus className="size-4" />
                    Tambah Kasir
                </Button>
            </div>

            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {users.map((u) => (
                    <li key={u.id} className="rounded-xl border bg-card p-4">
                        <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-xs font-semibold">{u.name}</p>
                            <span className="shrink-0 rounded-full border text-prim border-prim/30 bg-prim/10 px-2 py-0.5 text-[10px]">
                                {ROLE_LABELS[u.role] ?? u.role}
                            </span>
                        </div>
                        <p className="mt-1 truncate text-[11px] text-neutral-400">{u.email}</p>
                        <p className="mt-3 text-[10px] text-neutral-400">
                            Dibuat {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </li>
                ))}
            </ul>

            <CreateCashierDialog key={open ? "open" : "closed"} open={open} onOpenChange={setOpen} />
        </div>
    )
}