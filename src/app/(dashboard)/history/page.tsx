import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { parseHistoryParams } from "@/lib/history-schema"
import { getHistory } from "@/lib/queries/history"
import { HistoryList } from "./history-list"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Riwayat Transaksi" }
export default async function HistoryPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const params = parseHistoryParams(await searchParams)
    const result = await getHistory(params, { id: session.user.id, role: session.user.role })

    return <HistoryList result={result} role={session.user.role} />
}