'use client'

import { useEffect, useRef, useState } from "react"

/**
 * Menunda render anak sampai area ini terlihat di layar, lalu membiarkannya terpasang.
 * className harus memberi tinggi, supaya tata letak tidak melompat saat anak muncul.
 */
export function InView({ children, className }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [seen, setSeen] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el || seen) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setSeen(true)
            },
            { threshold: 0.25 } // minimal seperempat area terlihat
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [seen])

    return (
        <div ref={ref} className={className}>
            {seen ? children : null}
        </div>
    )
}