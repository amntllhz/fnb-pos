import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MenuList } from "./menu-list"

export default async function MenusPage() {
    const session = await auth.api.getSession({ headers: await headers() })

    const rows = await prisma.menu.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true } } },
    })

    const menus = rows.map(({ _count, ...menu }) => ({ ...menu, orderCount: _count.items }))

    return <MenuList menus={menus} role={session?.user.role} />
}