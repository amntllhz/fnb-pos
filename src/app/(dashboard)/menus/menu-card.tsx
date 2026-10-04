import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Package, Pencil, Trash2 } from "lucide-react"
import { MenuEditDialog } from "./menu-edit-dialog"
import { deleteMenu } from "@/lib/actions/menu"
import { categories } from "@/lib/constants"
import { Fragment } from "react"
import { toast } from "sonner"


type Menu = { id: string; name: string; price: number; imageUrl: string | null; category: string[] }

export function MenuCard({ menu, role }: { menu: Menu, role?: string }) {
    const [editOpen, setEditOpen] = useState(false)
    const [isDeleting, startDeleteTransition] = useTransition()
    const isOwner = role === "OWNER"

    function handleDelete() {
        startDeleteTransition(async () => {
            try {
                await deleteMenu(menu.id)
                toast.success(`${menu.name} berhasil dihapus`, {
                    description: "Menu berhasil dihapus dari daftar menu",
                })
            } catch {
                toast.error(`Gagal menghapus "${menu.name}". Coba lagi.`)
            }
        })
    }

    return (
        <Card className="overflow-hidden p-1 rounded-xl gap-0">
            <div className="relative w-full bg-neutral-100 ring ring-inset ring-neutral-200 rounded-lg">
                {menu.imageUrl ? (
                    <div className="rounded-lg ring ring-neutral-200 overflow-hidden">
                        <Image src={menu.imageUrl} alt={menu.name} width={440} height={0} className="object-cover w-full h-40" />
                    </div>
                ) : (
                    <div className="flex h-40 w-full items-center justify-center">
                        <Package className="size-8 text-neutral-100" />
                    </div>
                )}
                <div className="absolute top-2 left-2.5 flex-col space-y-1">
                    <p className="font-medium text-xs truncate">{menu.name}</p>
                    <div className="flex items-center justify-start gap-2">
                        {menu.category.map((cat, index) => (
                            <Fragment key={cat}>
                                {/* Tampilkan Separator hanya jika bukan elemen pertama (index > 0) */}
                                {index > 0 && (
                                    <span className=" h-2.5 border-l border-neutral-300" aria-hidden="true" />
                                )}
                                <p className="text-[10px] leading-none text-neutral-400">{categories.find((c) => c.value === cat)?.label ?? cat}</p>
                            </Fragment>
                        ))}
                    </div>
                </div>
                {isOwner && (
                    <div className="absolute top-1 right-1 flex gap-1">
                        <Button size="icon-sm" variant="secondary" className="bg-black/20 hover:bg-black/10 backdrop-blur-sm" onClick={() => setEditOpen(true)}>
                            <Pencil className="size-3.5 text-white" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="icon-sm" variant="destructive">
                                    <Trash2 className="size-3.5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus {menu.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Tindakan ini gak bisa dibatalin. Produk bakal hilang permanen dari katalog.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                                        {isDeleting ? "Menghapus..." : "Hapus"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                    </div>
                )}
            </div>
            <CardContent className="items-center pt-1.5 pb-1 px-2">
                <p className="text-xs font-semibold text-foreground">Rp {menu.price.toLocaleString("id-ID")}</p>
            </CardContent>
            {
                isOwner && (
                    <MenuEditDialog key={editOpen ? "open" : "closed"} menu={menu} open={editOpen} onOpenChange={setEditOpen} />
                )
            }
        </Card >
    )
}