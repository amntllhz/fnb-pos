'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MenuCard } from "@/app/(dashboard)/menus/menu-card"
import { MenuFormDialog } from "./menu-form-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

type Product = { id: string; name: string; price: number; imageUrl: string | null; category: string[] }

export function MenuList({ menus, role }: { menus: Product[]; role?: string }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start gap-4">
                    <SidebarTrigger className="text-neutral-300 transition-all duration-300 ease-in-out" />
                    <DynamicBreadcrumb />
                </div>
            </div>

            <div className="flex flex-col space-y-1">
                <h1 className="text-xl font-bold">Daftar Produk</h1>
                <p className="text-xs text-neutral-400">Lakukan penyesuaian pada menu disini</p>
            </div>

            {role === "OWNER" && (
                <Button className="flex items-center gap-2 pr-4 bg-prim hover:bg-prim-dark" onClick={() => setOpen(true)}>
                    <Plus className="size-4" />
                    Tambah Menu
                </Button>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {menus.map((menu) => (
                    <MenuCard key={menu.id} menu={menu} role={role} />
                ))}
            </div>

            {role === "OWNER" && <MenuFormDialog key={open ? "open" : "closed"} open={open} onOpenChange={setOpen} />}
        </div>
    )
}