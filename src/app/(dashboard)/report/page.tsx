import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { parseHistoryParams } from "@/lib/history-schema"
import { getReport } from "@/lib/queries/report"
import { ReportView } from "./report-view"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Laporan Penjualan" }
export default async function ReportPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")
    // Layout hanya cek login, jadi kasir yang mengetik /report langsung harus ditolak di sini
    if (session.user.role !== "OWNER") redirect("/dashboard")

    // ponytail: pakai ulang parser History, field selain from/to diabaikan
    const result = await getReport(parseHistoryParams(await searchParams))

    return <ReportView result={result} />
}