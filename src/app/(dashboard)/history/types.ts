import type { getHistory } from "@/lib/queries/history"

// Diturunkan dari query, jadi tidak ada tipe kedua yang harus dijaga sinkron
export type HistoryResult = Awaited<ReturnType<typeof getHistory>>
export type HistoryRow = HistoryResult["rows"][number]