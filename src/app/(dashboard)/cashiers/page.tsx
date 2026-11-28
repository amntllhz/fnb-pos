import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CashierList } from "./cashier-list"

export const metadata: Metadata = { title: "Kelola Kasir" }

export default async function CashiersPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")
    // Layout hanya cek login, jadi kasir yang mengetik /cashiers langsung ditolak di sini
    if (session.user.role !== "OWNER") redirect("/dashboard")

    const users = await prisma.user.findMany({
        orderBy: [{ role: "asc" }, { createdAt: "asc" }], // owner dulu, lalu kasir menurut urutan dibuat
        select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    return <CashierList users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))} />
}