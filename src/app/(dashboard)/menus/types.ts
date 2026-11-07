export type MenuListItem = {
    id: string
    name: string
    price: number
    imageUrl: string | null
    category: string[]
    orderCount: number // berapa baris transaksi yang menunjuk ke menu ini
}