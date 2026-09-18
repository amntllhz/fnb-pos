import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) redirect("/login") // belum login, tendang balik

    return (
        <SidebarProvider>
            <AppSidebar role={session.user.role} />
            <div className="p-4">
                <SidebarTrigger />
            </div>
            <SidebarInset>
                <main className="p-6">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}