"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LayoutDashboard, Package, Settings2, History, BarChart3, Settings, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import {
    Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "KASIR"] },
    { title: "Produk", url: "/products", icon: Package, roles: ["OWNER", "KASIR"] },
    { title: "Kelola Produk", url: "/products/manage", icon: Settings2, roles: ["OWNER"] },
    { title: "Riwayat Transaksi", url: "/history", icon: History, roles: ["OWNER", "KASIR"] },
    { title: "Laporan", url: "/report", icon: BarChart3, roles: ["OWNER"] },
    { title: "Setting", url: "/settings", icon: Settings, roles: ["OWNER"] },
]

export function AppSidebar({ role }: { role: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const visibleItems = menuItems.filter((item) => item.roles.includes(role))

    async function handleLogout() {
        await authClient.signOut()
        router.push("/login")
    }

    return (
        <Sidebar>
            <SidebarHeader />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton
                                        render={<Link href={item.url} />}
                                        isActive={pathname === item.url}
                                    >
                                        <item.icon />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout}>
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}