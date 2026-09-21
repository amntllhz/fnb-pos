import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Package, Pencil, Trash2 } from "lucide-react"
import { ProductEditDialog } from "./product-edit-dialog"
import { deleteProduct } from "@/lib/actions/product"


type Product = { id: string; name: string; price: number; imageUrl: string | null }

export function ProductCard({ product, role }: { product: Product, role?: string }) {
    const [editOpen, setEditOpen] = useState(false)
    const isOwner = role === "OWNER"

    return (
        <Card className="overflow-hidden p-1 rounded-xl gap-0">
            <div className="relative w-full bg-neutral-100 ring ring-inset ring-neutral-200 rounded-lg">
                {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                ) : (
                    <div className="flex h-40 w-full items-center justify-center">
                        <Package className="size-8 text-neutral-100" />
                    </div>
                )}
                <div className="absolute top-2 left-2.5 flex gap-1">
                    <p className="font-medium text-[10px] truncate">{product.name}</p>
                </div>
                {isOwner && (
                    <div className="absolute top-1 right-1 flex gap-1">
                        <Button size="icon-sm" variant="secondary" onClick={() => setEditOpen(true)}>
                            <Pencil className="size-3.5" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger render={<Button size="icon-sm" variant="destructive" />}>
                                <Trash2 className="size-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus {product.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini gak bisa dibatalin. Produk bakal hilang permanen dari katalog.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>
            <CardContent className="items-center pt-1.5 pb-1 px-2">
                <p className="text-xs font-semibold text-foreground">Rp {product.price.toLocaleString("id-ID")}</p>
            </CardContent>
            {
                isOwner && (
                    <ProductEditDialog product={product} open={editOpen} onOpenChange={setEditOpen} />
                )
            }
        </Card >
    )
}