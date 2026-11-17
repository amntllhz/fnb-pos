/** Nomor halaman + ellipsis: 1 … 4 5 6 … 20. Sampai 7 halaman ditampilkan semua. */
export function getPageItems(page: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    const start = Math.max(2, page - 1)
    const end = Math.min(total - 1, page + 1)
    const items: (number | "…")[] = [1]
    if (start > 2) items.push("…")
    for (let i = start; i <= end; i++) items.push(i)
    if (end < total - 1) items.push("…")
    items.push(total)
    return items
}