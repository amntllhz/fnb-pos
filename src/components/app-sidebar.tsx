"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import SidebarLogo from "@/components/sidebar-logo"
import {
    Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupContent,
    SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, AlertDialogFooter } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

const menuItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: (
            <svg className="size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 17H16M11.0177 2.764L4.23539 8.03912C3.78202 8.39175 3.55534 8.56806 3.39203 8.78886C3.24737 8.98444 3.1396 9.20478 3.07403 9.43905C3 9.70352 3 9.9907 3 10.5651V17.8C3 18.9201 3 19.4801 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4801 21 18.9201 21 17.8V10.5651C21 9.9907 21 9.70352 20.926 9.43905C20.8604 9.20478 20.7526 8.98444 20.608 8.78886C20.4447 8.56806 20.218 8.39175 19.7646 8.03913L12.9823 2.764C12.631 2.49075 12.4553 2.35412 12.2613 2.3016C12.0902 2.25526 11.9098 2.25526 11.7387 2.3016C11.5447 2.35412 11.369 2.49075 11.0177 2.764Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        ),
        roles: ["OWNER", "KASIR"]
    },
    {
        title: "Produk",
        url: "/products",
        icon: (
            <svg className="size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.9996 8C15.9996 9.06087 15.5782 10.0783 14.828 10.8284C14.0779 11.5786 13.0605 12 11.9996 12C10.9387 12 9.92131 11.5786 9.17116 10.8284C8.42102 10.0783 7.99959 9.06087 7.99959 8M3.63281 7.40138L2.93281 15.8014C2.78243 17.6059 2.70724 18.5082 3.01227 19.2042C3.28027 19.8157 3.74462 20.3204 4.33177 20.6382C5.00006 21 5.90545 21 7.71623 21H16.283C18.0937 21 18.9991 21 19.6674 20.6382C20.2546 20.3204 20.7189 19.8157 20.9869 19.2042C21.2919 18.5082 21.2167 17.6059 21.0664 15.8014L20.3664 7.40138C20.237 5.84875 20.1723 5.07243 19.8285 4.48486C19.5257 3.96744 19.0748 3.5526 18.5341 3.29385C17.92 3 17.141 3 15.583 3L8.41623 3C6.85821 3 6.07921 3 5.4651 3.29384C4.92433 3.5526 4.47349 3.96744 4.17071 4.48486C3.82689 5.07243 3.76219 5.84875 3.63281 7.40138Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        ),
        roles: ["OWNER", "KASIR"]
    },
    {
        title: "Kelola Produk",
        url: "/products/manage", icon: (
            <svg className="size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8L15 8M15 8C15 9.65686 16.3431 11 18 11C19.6569 11 21 9.65685 21 8C21 6.34315 19.6569 5 18 5C16.3431 5 15 6.34315 15 8ZM9 16L21 16M9 16C9 17.6569 7.65685 19 6 19C4.34315 19 3 17.6569 3 16C3 14.3431 4.34315 13 6 13C7.65685 13 9 14.3431 9 16Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        ),
        roles: ["OWNER"]
    },
    {
        title: "Riwayat Transaksi",
        url: "/history",
        icon: (
            <svg className="size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.7 13.5L20.7005 11.5L18.7 13.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3019 3 18.1885 4.77814 19.7545 7.42909M12 7V12L15 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        ),
        roles: ["OWNER", "KASIR"]
    },
    {
        title: "Laporan",
        url: "/report",
        icon: (
            <svg className="size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 15V17M12 11V17M16 7V17M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        ),
        roles: ["OWNER"]
    },
    {
        title: "Setting",
        url: "/settings",
        icon: (
            <svg className="size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.0005 15C13.6573 15 15.0005 13.6569 15.0005 12C15.0005 10.3431 13.6573 9 12.0005 9C10.3436 9 9.00049 10.3431 9.00049 12C9.00049 13.6569 10.3436 15 12.0005 15Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9.28957 19.3711L9.87402 20.6856C10.0478 21.0768 10.3313 21.4093 10.6902 21.6426C11.0492 21.8759 11.4681 22.0001 11.8962 22C12.3244 22.0001 12.7433 21.8759 13.1022 21.6426C13.4612 21.4093 13.7447 21.0768 13.9185 20.6856L14.5029 19.3711C14.711 18.9047 15.0609 18.5159 15.5029 18.26C15.9477 18.0034 16.4622 17.8941 16.9729 17.9478L18.4029 18.1C18.8286 18.145 19.2582 18.0656 19.6396 17.8713C20.021 17.6771 20.3379 17.3763 20.5518 17.0056C20.766 16.635 20.868 16.2103 20.8455 15.7829C20.823 15.3555 20.677 14.9438 20.4251 14.5978L19.5785 13.4344C19.277 13.0171 19.1159 12.5148 19.1185 12C19.1184 11.4866 19.281 10.9864 19.5829 10.5711L20.4296 9.40778C20.6814 9.06175 20.8275 8.65007 20.85 8.22267C20.8725 7.79528 20.7704 7.37054 20.5562 7C20.3423 6.62923 20.0255 6.32849 19.644 6.13423C19.2626 5.93997 18.833 5.86053 18.4074 5.90556L16.9774 6.05778C16.4667 6.11141 15.9521 6.00212 15.5074 5.74556C15.0645 5.48825 14.7144 5.09736 14.5074 4.62889L13.9185 3.31444C13.7447 2.92317 13.4612 2.59072 13.1022 2.3574C12.7433 2.12408 12.3244 1.99993 11.8962 2C11.4681 1.99993 11.0492 2.12408 10.6902 2.3574C10.3313 2.59072 10.0478 2.92317 9.87402 3.31444L9.28957 4.62889C9.0825 5.09736 8.73245 5.48825 8.28957 5.74556C7.84479 6.00212 7.33024 6.11141 6.81957 6.05778L5.38513 5.90556C4.95946 5.86053 4.52987 5.93997 4.14844 6.13423C3.76702 6.32849 3.45014 6.62923 3.23624 7C3.02206 7.37054 2.92002 7.79528 2.94251 8.22267C2.96499 8.65007 3.11103 9.06175 3.36291 9.40778L4.20957 10.5711C4.51151 10.9864 4.67411 11.4866 4.67402 12C4.67411 12.5134 4.51151 13.0137 4.20957 13.4289L3.36291 14.5922C3.11103 14.9382 2.96499 15.3499 2.94251 15.7773C2.92002 16.2047 3.02206 16.6295 3.23624 17C3.45036 17.3706 3.76727 17.6712 4.14864 17.8654C4.53001 18.0596 4.95949 18.1392 5.38513 18.0944L6.81513 17.9422C7.3258 17.8886 7.84034 17.9979 8.28513 18.2544C8.72966 18.511 9.08134 18.902 9.28957 19.3711Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        ),
        roles: ["OWNER"]
    },
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
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <SidebarLogo />
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {visibleItems.map((item) => (
                                    <SidebarMenuItem key={item.url}>
                                        <SidebarMenuButton
                                            render={<Link href={item.url} />}
                                            isActive={pathname === item.url}
                                            className="text-xs text-neutral-400 data-active:bg-prim/5 data-active:text-prim data-active:hover:bg-prim/5 data-active:hover:text-prim"
                                        >
                                            {item.icon}
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
                            <AlertDialog>
                                <AlertDialogTrigger className="w-full">
                                    <SidebarMenuButton className="text-xs text-neutral-400 cursor-pointer">
                                        <svg className="size-4" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span>Log Out</span>
                                    </SidebarMenuButton>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Konfirmasi Log Out</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Apakah Anda yakin ingin keluar dari aplikasi?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleLogout}>
                                            Ya, Log Out
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </>
    )
}