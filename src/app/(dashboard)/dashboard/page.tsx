import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getDashboard, parsePreset } from "@/lib/queries/dashboard"
import { DashboardView } from "./dashboard-view"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }
export default async function DashboardPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login")

    const range = (await searchParams).range
    const result = await getDashboard(parsePreset(Array.isArray(range) ? range[0] : range), {
        role: session.user.role,
    })

    return <DashboardView result={result} isOwner={session.user.role === "OWNER"} />
}