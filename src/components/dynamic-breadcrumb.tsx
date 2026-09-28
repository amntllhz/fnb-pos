"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment } from "react"

export function DynamicBreadcrumb() {
    const pathname = usePathname()

    // Memecah pathname menjadi array segmen (contoh: /dashboard/users/1 -> ["dashboard", "users", "1"])
    const segments = pathname.split("/").filter((segment) => segment !== "")

    // Jika berada di halaman utama (root), kita bisa menyembunyikan breadcrumb atau menampilkannya saja
    if (segments.length === 0) {
        return null
    }

    return (
        <div className="bg-neutral-50 ring ring-inset ring-neutral-200 px-3 py-1 rounded-md">
            <Breadcrumb>
                <BreadcrumbList>
                    {/* Home Link (Opsional) */}
                    <BreadcrumbItem className="text-xs text-neutral-400">
                        <BreadcrumbLink render={<Link href="/dashboard" />}>
                            Dashboard
                        </BreadcrumbLink>
                    </BreadcrumbItem >

                    {segments.length > 0 && <BreadcrumbSeparator />}

                    {
                        segments.map((segment, index) => {
                            // Membuat URL untuk setiap segmen
                            const href = `/${segments.slice(0, index + 1).join("/")}`
                            const isLast = index === segments.length - 1

                            // Mempercantik teks segmen (mengubah dash/hyphen menjadi spasi dan kapitalisasi)
                            const formattedSegment = segment
                                .replace(/-/g, " ")
                                .replace(/^\w/, (c) => c.toUpperCase())

                            return (
                                <Fragment key={href}>
                                    <BreadcrumbItem className="text-xs">
                                        {isLast ? (
                                            // Segmen terakhir bersifat aktif/current page (tidak bisa diklik)
                                            <BreadcrumbPage>{formattedSegment}</BreadcrumbPage>
                                        ) : (
                                            // Segmen sebelumnya berupa link
                                            <BreadcrumbLink>
                                                <Link href={href}>{formattedSegment}</Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator />}
                                </Fragment>
                            )
                        })
                    }
                </BreadcrumbList >
            </Breadcrumb >
        </div>
    )
}