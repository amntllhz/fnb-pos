import { useTransition } from "react"
import { toast } from "sonner"
import { deleteMenu } from "@/lib/actions/menu"

export function useDeleteMenu() {
    const [isDeleting, startTransition] = useTransition()

    function handleDelete(menu: { id: string; name: string }) {
        startTransition(async () => {
            try {
                await deleteMenu(menu.id)
                toast.success(`${menu.name} berhasil dihapus`, {
                    description: "Menu berhasil dihapus dari daftar",
                })
            } catch {
                toast.error(`Gagal menghapus "${menu.name}". Coba lagi.`)
            }
        })
    }

    return { handleDelete, isDeleting }
}