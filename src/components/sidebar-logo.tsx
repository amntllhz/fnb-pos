'use client'

import { useSidebar } from "@/components/ui/sidebar"
import Image from "next/image"
import logoFull from '@/assets/logo-red.svg'
import logoShape from '@/assets/logo-shape.svg'

function SidebarLogo() {
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"

    return (
        <div className="relative flex items-center h-10 w-full px-1.5 py-2 overflow-hidden">
            {/* Logo Shape (Tampil saat Collapsed) */}
            <div
                className={`absolute left-1.5 transition-all duration-200 ease-in-out ${isCollapsed
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-75 pointer-events-none"
                    }`}
            >
                <Image
                    src={logoShape}
                    alt="Logo Shape"
                    className="w-5 h-auto shrink-0"
                    loading="eager"
                />
            </div>

            {/* Logo Full (Tampil saat Expanded) */}
            <div
                className={`transition-all duration-200 ease-in-out ${isCollapsed
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                    }`}
            >
                <Image
                    src={logoFull}
                    alt="Logo Full"
                    className="w-28 h-auto shrink-0"
                    loading="eager"
                />
            </div>
        </div>
    )
}

export default SidebarLogo