'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'

export function ImageDropzone({
    name, defaultPreview,
}: { name: string; defaultPreview?: string | null }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(defaultPreview ?? null)
    const [isDragging, setIsDragging] = useState(false)

    function assignFile(file: File) {
        // Trik wajib: File gak bisa langsung ditempel ke input.files,
        // browser cuma ngizinin lewat objek DataTransfer (alasan keamanan)
        const dt = new DataTransfer()
        dt.items.add(file)
        if (inputRef.current) inputRef.current.files = dt.files
        setPreview(URL.createObjectURL(file)) // preview lokal, gak upload beneran
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) assignFile(file)
    }

    function handleRemove(e: React.MouseEvent) {
        e.stopPropagation() // cegah nge-trigger buka file picker lagi
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex h-40 w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-input'
                }`}
        >
            <input
                ref={inputRef}
                type="file"
                name={name}
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && assignFile(e.target.files[0])}
            />
            {preview ? (
                <>
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    <button type="button" onClick={handleRemove} className="absolute top-1 right-1 rounded-full bg-background/80 p-1">
                        <X className="size-4" />
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center gap-1 text-sm text-muted-foreground">
                    <ImagePlus className="size-6" />
                    <span>Klik atau seret gambar ke sini</span>
                </div>
            )}
        </div>
    )
}