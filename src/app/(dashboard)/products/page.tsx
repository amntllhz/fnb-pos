import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProductList } from "./product-list"

export default async function ProductsPage() {
    const session = await auth.api.getSession({ headers: await headers() })
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } })

    return <ProductList products={products as any} role={session?.user.role} />
}