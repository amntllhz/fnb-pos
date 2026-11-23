'use client'

import { useState } from "react"
import { Search, X } from "lucide-react"
import { toast } from "sonner"
import NoData from "@/assets/no-data.svg"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { EmptyState } from "@/components/empty-state"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { setMenuAvailability } from "@/lib/actions/menu"
import { formatRupiah } from "@/lib/format"

type Item = { id: string; name: string; price: number; isAvailable: boolean }
type Filter = "all" | "ready" | "habis"

const FILTERS: { value: Filter; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "ready", label: "Ready" },
    { value: "habis", label: "Habis" },
]

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
                <span className={available ? "" : "font-medium text-prim"}>{available ? "Ready" : "Habis"}</span>
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
    const [q, setQ] = useState("")
    const [filter, setFilter] = useState<Filter>("all")

    const isSearching = q.trim().length > 0

    // ponytail: semua menu sudah dimuat di halaman ini, jadi cari dan filter cukup di client
    const counts = {
        all: menus.length,
        ready: menus.filter((m) => m.isAvailable).length,
        habis: menus.filter((m) => !m.isAvailable).length,
    }
    const keyword = q.trim().toLowerCase()
    const visible = menus.filter(
        (m) =>
            // filter "ready" cocok dengan isAvailable true, filter "habis" dengan false
            (filter === "all" || (filter === "ready") === m.isAvailable) &&
            m.name.toLowerCase().includes(keyword)
    )

    // Perilaku sama dengan /menus: mencari pindah ke "Semua", ganti tab menghapus pencarian
    function handleSearchChange(value: string) {
        setQ(value)
        if (value.trim().length > 0) setFilter("all")
    }

    function handleFilterChange(value: string) {
        setFilter(value as Filter)
        setQ("")
    }

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

            <Tabs value={filter} onValueChange={handleFilterChange} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <TabsList className="shrink-0">
                        {FILTERS.map((f) => (
                            <TabsTrigger key={f.value} value={f.value} className="text-neutral-400 data-active:font-medium data-active:text-prim px-3 font-normal text-xs transition-all duration-300 ease-in-out hover:text-sidebar-accent-foreground">
                                {f.label}
                                <span className="ml-1 tabular-nums">{counts[f.value]}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="flex flex-1 items-center justify-end gap-2">
                        <InputGroup className="h-8 max-w-56">
                            <InputGroupAddon align="inline-start">
                                <Search className="size-3.5 text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                                placeholder="Cari menu..."
                                value={q}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="text-xs placeholder:text-xs"
                            />
                            {isSearching && (
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton size="icon-xs" onClick={() => handleSearchChange("")} aria-label="Hapus pencarian">
                                        <X className="size-3" />
                                    </InputGroupButton>
                                </InputGroupAddon>
                            )}
                        </InputGroup>
                    </div>
                </div>

                {/* Satu panel untuk semua tab: isinya mengikuti filter yang aktif */}
                <TabsContent value={filter}>
                    {visible.length === 0 ? (
                        <EmptyState
                            icon={NoData}
                            label={isSearching ? `Tidak ada hasil untuk "${q}"` : filter === "habis" ? "Tidak ada menu yang habis" : "Tidak ada menu"}
                            message={isSearching ? "Coba gunakan kata kunci yang berbeda" : filter === "habis" ? "Semua menu sedang ready" : "Tambahkan menu di halaman Menu"}
                        />
                    ) : (
                        <ul className="divide-y rounded-xl border bg-card">
                            {visible.map((menu) => (
                                // key memuat status dari server, supaya baris ikut menyesuaikan setelah data dimuat ulang
                                <MenuRow key={`${menu.id}-${menu.isAvailable}`} menu={menu} />
                            ))}
                        </ul>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}