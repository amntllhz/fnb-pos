export const formatOrderNumber = (n: number) => `INV-${String(n).padStart(4, "0")}`
export const formatRupiah = (n: number) => `Rp ${n.toLocaleString("id-ID")}`
export const formatDateTime = (iso: string) =>
    new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Jakarta",
    }).format(new Date(iso))