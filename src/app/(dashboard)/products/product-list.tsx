'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ProductCard } from "./product-card"
import { ProductFormDialog } from "./product-form-dialog"
import { SidebarTrigger } from "@/components/ui/sidebar"

type Product = { id: string; name: string; price: number; imageUrl: string | null }

export function ProductList({ products, role }: { products: Product[]; role?: string }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-start gap-2">
                    <SidebarTrigger />
                </div>
                {role === "OWNER" && (
                    <Button className="flex items-center gap-2 pr-4 bg-prim hover:bg-prim-dark" onClick={() => setOpen(true)}>
                        <Plus className="size-4" />
                        Tambah Menu
                    </Button>
                )}
            </div>

            <h1 className="text-xl font-semibold">Daftar Produk</h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} role={role} />
                ))}
            </div>

            {role === "OWNER" && <ProductFormDialog open={open} onOpenChange={setOpen} />}
        </div>
    )
}