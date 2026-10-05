'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { MenuCard } from "@/app/(dashboard)/menus/menu-card"
import { MenuCreateDialog } from "./menu-create-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { categories } from "@/lib/constants"
import { EmptyState } from "@/components/empty-state"
import NoData from "@/assets/no-data.svg"

type Product = { id: string; name: string; price: number; imageUrl: string | null; category: string[] }

export function MenuList({ menus, role }: { menus: Product[]; role?: string }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="space-y-4">

            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start gap-4">
                    <SidebarTrigger className="text-neutral-300 transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" />
                    <DynamicBreadcrumb />
                </div>
            </div>

            <div className="flex flex-col space-y-1">
                <h1 className="text-xl font-extrabold">Daftar Menu</h1>
                <p className="text-xs text-neutral-400">Lakukan pengelolaan pesanan dan melalui halaman ini</p>
            </div>

            <Tabs defaultValue="all" className="space-y-2 mt-6">

                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger className="text-neutral-400 data-active:font-medium data-active:text-prim px-3 font-normal text-xs transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" value="all">Semua</TabsTrigger>
                        {categories.map((cat) => (
                            <TabsTrigger className="text-neutral-400 data-active:font-medium data-active:text-prim px-2.5 font-normal text-xs transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" key={cat.value} value={cat.value}>
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {role === "OWNER" && (
                        <Button className="flex items-center gap-2 pr-4 bg-prim hover:bg-prim-dark" onClick={() => setOpen(true)}>
                            <Plus className="size-4" />
                            Tambah Menu
                        </Button>
                    )}
                </div>

                <TabsContent value="all">
                    {menus.length === 0 ? (
                        <EmptyState
                            icon={NoData}
                            label="Menu belum tersedia"
                            message="Tambahkan menu pertama melalui tombol tambah menu"
                        />
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {menus.map((menu) => (
                                <MenuCard key={menu.id} menu={menu} role={role} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {categories.map((cat) => {
                    const filtered = menus.filter((menu) => menu.category.includes(cat.value))
                    return (
                        <TabsContent key={cat.value} value={cat.value}>
                            {filtered.length === 0 ? (
                                <EmptyState
                                    icon={NoData}
                                    label={`Menu ${cat.label} belum tersedia`}
                                    message={`Menu dengan kategori ${cat.label} belum tersedia`}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ">
                                    {filtered.map((menu) => (
                                        <MenuCard key={menu.id} menu={menu} role={role} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    )
                })}
            </Tabs>

            {role === "OWNER" && <MenuCreateDialog key={open ? "open" : "closed"} open={open} onOpenChange={setOpen} />}
        </div>
    )
}