import { prisma } from "@/lib/prisma"
import { MenuAvailabilityList } from "./menu-availability-list"

// Layout dashboard sudah menjaga login, dan setMenuAvailability menjaga sisi server
export default async function MenuManagePage() {
    const menus = await prisma.menu.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, price: true, isAvailable: true },
    })

    return <MenuAvailabilityList menus={menus} />
}