export const formatOrderNumber = (n: number) => `INV-${String(n).padStart(4, "0")}`
export const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`