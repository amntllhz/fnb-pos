'use client'

import { useState } from "react"
import { toast } from "sonner"
import NoData from "@/assets/no-data.svg"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { EmptyState } from "@/components/empty-state"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { setMenuAvailability } from "@/lib/actions/menu"
import { formatRupiah } from "@/lib/format"

type Item = { id: string; name: string; price: number; isAvailable: boolean }

function MenuRow({ menu }: { menu: Item }) {
    const [available, setAvailable] = useState(menu.isAvailable)
    const [pending, setPending] = useState(false)

    async function toggle(next: boolean) {
        setAvailable(next) // optimistis, dikembalikan kalau gagal
        setPending(true)
        try {
            const res = await setMenuAvailability(menu.id, next)
            if (!res.success) {
                toast.error(res.error)
                setAvailable(!next)
            }
        } catch {
            toast.error("Gagal memperbarui menu")
            setAvailable(!next)
        } finally {
            setPending(false)
        }
    }

    return (
        <li className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
                <p className="truncate text-xs font-medium">{menu.name}</p>
                <p className="text-[11px] tabular-nums text-neutral-400">{formatRupiah(menu.price)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-[11px] text-neutral-500">
                <span>{available ? "Ready" : "Habis"}</span>
                <Switch
                    checked={available}
                    onCheckedChange={toggle}
                    disabled={pending}
                    aria-label={`Ketersediaan ${menu.name}`}
                />
            </div>
        </li>
    )
}

export function MenuAvailabilityList({ menus }: { menus: Item[] }) {
    return (
        <div className="flex min-h-svh min-w-0 flex-col gap-4 px-6 py-4">
            <div className="flex items-center justify-start gap-4">
                <SidebarTrigger className="text-neutral-300 transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" />
                <DynamicBreadcrumb />
            </div>

            <div className="flex flex-col space-y-1">
                <h1 className="text-xl font-extrabold">Ketersediaan Menu</h1>
                <p className="text-xs text-neutral-400">Tandai menu yang habis supaya tidak bisa dipesan kasir</p>
            </div>

            {menus.length === 0 ? (
                <EmptyState icon={NoData} label="Belum ada menu" message="Tambahkan menu di halaman Menu" />
            ) : (
                <ul className="divide-y rounded-xl border bg-card">
                    {menus.map((menu) => (
                        // key memuat status dari server, supaya baris ikut menyesuaikan setelah data dimuat ulang
                        <MenuRow key={`${menu.id}-${menu.isAvailable}`} menu={menu} />
                    ))}
                </ul>
            )}
        </div>
    )
}