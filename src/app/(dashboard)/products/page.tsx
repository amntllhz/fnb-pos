import { prisma } from '@/lib/prisma'
import { ProductForm } from './product-form'
import { ProductItem } from './product-item'

export default async function ProductsPage() {
    const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })

    return (
        <div>
            <ProductForm />
            <ul>
                {products.map((p) => (
                    <ul>
                        {products.map((p) => (
                            <ProductItem key={p.id} product={p} />
                        ))}
                    </ul>
                ))}
            </ul>
        </div>
    )
}