import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { MenuList } from "./menu-list"

export default async function MenusPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    const menus = await prisma.menu.findMany({ orderBy: { createdAt: "desc" } })

    return <MenuList menus={menus as any} role={session?.user.role} />
}