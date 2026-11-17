import { DEFAULT_PAGE_SIZE, type HistoryParams } from "./history-schema"

/** Satu-satunya tempat query string History disusun. Nilai default tidak ditulis supaya URL tetap pendek. */
export function toHistoryQuery(filters: Partial<HistoryParams>) {
    const params = new URLSearchParams()
    if (filters.from) params.set("from", filters.from)
    if (filters.to) params.set("to", filters.to)
    if (filters.method) params.set("method", filters.method)
    if (filters.status) params.set("status", filters.status)
    if (filters.q) params.set("q", filters.q)
    if (filters.page && filters.page > 1) params.set("page", String(filters.page))
    if (filters.size && filters.size !== DEFAULT_PAGE_SIZE) params.set("size", String(filters.size))

    const query = params.toString()
    return query ? `?${query}` : ""
}