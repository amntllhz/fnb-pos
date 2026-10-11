'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search, X } from "lucide-react"
import { MenuCard } from "@/app/(dashboard)/menus/menu-card"
import { MenuCreateDialog } from "./menu-create-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@/components/ui/input-group"
import { categories } from "@/lib/constants"
import { EmptyState } from "@/components/empty-state"
import NoData from "@/assets/no-data.svg"

type Product = { id: string; name: string; price: number; imageUrl: string | null; category: string[] }

export function MenuList({ menus, role }: { menus: Product[]; role?: string }) {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("all")

    const isSearching = searchQuery.trim().length > 0

    const filteredMenus = isSearching
        ? menus.filter((menu) =>
            menu.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : menus

    function handleSearchChange(value: string) {
        setSearchQuery(value)
        if (value.trim().length > 0) {
            setActiveTab("all")
        }
    }

    function handleTabChange(value: string) {
        setActiveTab(value)
        setSearchQuery("")
    }

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
                <p className="text-xs text-neutral-400">Lakukan pengelolaan pesanan dan menu melalui halaman ini</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-2 mt-6">

                <div className="flex items-center justify-between gap-3">
                    <TabsList className="shrink-0">
                        <TabsTrigger className="text-neutral-400 data-active:font-medium data-active:text-prim px-3 font-normal text-xs transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" value="all">Semua</TabsTrigger>
                        {categories.map((cat) => (
                            <TabsTrigger className="text-neutral-400 data-active:font-medium data-active:text-prim px-2.5 font-normal text-xs transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground" key={cat.value} value={cat.value}>
                                {cat.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <InputGroup className="max-w-56 h-8">
                            <InputGroupAddon align="inline-start">
                                <Search className="size-3.5 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                                placeholder="Cari menu..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="text-xs placeholder:text-xs"
                            />
                            {isSearching && (
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        size="icon-xs"
                                        onClick={() => handleSearchChange("")}
                                        aria-label="Hapus pencarian"
                                    >
                                        <X className="size-3" />
                                    </InputGroupButton>
                                </InputGroupAddon>
                            )}
                        </InputGroup>

                        {role === "OWNER" && (
                            <Button className="flex items-center gap-1.5 pr-4 bg-prim hover:bg-prim-dark shrink-0" onClick={() => setOpen(true)}>
                                <Plus className="size-4" />
                                Tambah Menu
                            </Button>
                        )}
                    </div>
                </div>

                <TabsContent value="all">
                    {filteredMenus.length === 0 ? (
                        <EmptyState
                            icon={NoData}
                            label={isSearching ? `Tidak ada hasil untuk "${searchQuery}"` : "Menu belum tersedia"}
                            message={isSearching ? "Coba gunakan kata kunci yang berbeda" : "Tambahkan menu pertama melalui tombol tambah menu"}
                        />
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {filteredMenus.map((menu) => (
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