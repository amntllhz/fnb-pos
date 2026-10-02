'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'
import { Button } from './ui/button';

export function ImageDropzone({
    name, defaultPreview, allowRemove = true
}: { name: string; defaultPreview?: string | null, allowRemove?: boolean }) {
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
            onClick={() => { if (!preview) inputRef.current?.click() }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border-[1.5px] border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-input'
                } ${!preview ? 'cursor-pointer' : ''}`}
        >
            <input ref={inputRef} type="file" name={name} accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && assignFile(e.target.files[0])} />

            {preview ? (
                <>
                    <Image key={preview} src={preview} alt="Preview" fill className="object-cover animate-in fade-in duration-300" />
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                        className="absolute flex cursor-pointer justify-center items-center gap-2 bottom-2 right-2 rounded-lg bg-black/20 hover:bg-black/10 backdrop-blur-sm border-0 px-3 py-1.5"
                    >
                        <svg className='size-3.5 text-white' width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 20H21M3.00003 20H4.67457C5.16376 20 5.40835 20 5.63852 19.9447C5.84259 19.8957 6.03768 19.8149 6.21663 19.7053C6.41846 19.5816 6.59141 19.4086 6.93732 19.0627L19.5001 6.49998C20.3285 5.67156 20.3285 4.32841 19.5001 3.49998C18.6716 2.67156 17.3285 2.67156 16.5001 3.49998L3.93729 16.0627C3.59139 16.4086 3.41843 16.5816 3.29475 16.7834C3.18509 16.9624 3.10428 17.1574 3.05529 17.3615C3.00003 17.5917 3.00003 17.8363 3.00003 18.3255V20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-xs text-white">Ubah Gambar</p>
                    </Button>
                    {allowRemove && (
                        <button type="button" onClick={handleRemove} className="absolute top-2 right-2 rounded-sm backdrop-blur-sm bg-black/20 hover:bg-black/10 transition-colors duration-200 ease-in-out p-1">
                            <X className="size-3 text-white" />
                        </button>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <ImagePlus className="size-8 text-neutral-400" />
                    <span className='text-neutral-400 text-xs'>Klik atau seret gambar ke sini</span>
                </div>
            )}
        </div>
    )
}