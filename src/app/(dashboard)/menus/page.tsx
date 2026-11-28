import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MenuList } from "./menu-list"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Kelola Menu" }
export default async function MenusPage() {
    const session = await auth.api.getSession({ headers: await headers() })

    const [rows, cashiers] = await Promise.all([
        prisma.menu.findMany({
            where: { isActive: true },
            orderBy: [{ isAvailable: "desc" }, { createdAt: "desc" }], // pakai orderBy milikmu yang sekarang
            include: { _count: { select: { items: true } } },
        }),
        prisma.user.findMany({
            select: { id: true, name: true },
            orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        }),
    ])

    const menus = rows.map(({ _count, ...menu }) => ({ ...menu, orderCount: _count.items }))

    return <MenuList menus={menus} role={session?.user.role} cashiers={cashiers} currentUserId={session?.user.id ?? ""} />
}