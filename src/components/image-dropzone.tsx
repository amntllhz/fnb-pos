'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X } from 'lucide-react'
import { Button } from './ui/button';
import { IMAGE_ACCEPT, IMAGE_MAX_SIZE, validateImage } from '@/lib/image-rules'
import { toast } from "sonner";

export function ImageDropzone({
    name, defaultPreview, allowRemove = true, invalid = false
}: { name: string; defaultPreview?: string | null, allowRemove?: boolean, invalid?: boolean }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(defaultPreview ?? null)
    const [isDragging, setIsDragging] = useState(false)
    const validFile = useRef<File | null>(null)

    function syncInput(file: File | null) {
        if (!inputRef.current) return
        // Trik DataTransfer: satu-satunya cara resmi mengisi input.files secara programatik.
        // DataTransfer kosong = mengosongkan input.
        const dt = new DataTransfer()
        if (file) dt.items.add(file)
        inputRef.current.files = dt.files
    }

    function assignFile(file: File) {
        const error = validateImage(file)
        if (error) {
            toast.error(error, {
                description: "Periksa kembali file gambar yang diunggah",
                icon:
                    <svg className='size-4 text-red-500' width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.5 2.5L21.5 7.5M21.5 2.5L16.5 7.5M12.5 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H17C17.93 21 18.395 21 18.7765 20.8978C19.8117 20.6204 20.6204 19.8117 20.8978 18.7765C21 18.395 21 17.93 21 17M10.5 8.5C10.5 9.60457 9.60457 10.5 8.5 10.5C7.39543 10.5 6.5 9.60457 6.5 8.5C6.5 7.39543 7.39543 6.5 8.5 6.5C9.60457 6.5 10.5 7.39543 10.5 8.5ZM14.99 11.9181L6.53115 19.608C6.05536 20.0406 5.81747 20.2568 5.79643 20.4442C5.77819 20.6066 5.84045 20.7676 5.96319 20.8755C6.10478 21 6.42628 21 7.06929 21H16.456C17.8951 21 18.6147 21 19.1799 20.7582C19.8894 20.4547 20.4547 19.8894 20.7582 19.1799C21 18.6147 21 17.8951 21 16.456C21 15.9717 21 15.7296 20.9471 15.5042C20.8805 15.2208 20.753 14.9554 20.5733 14.7264C20.4303 14.5442 20.2412 14.3929 19.8631 14.0905L17.0658 11.8527C16.6874 11.5499 16.4982 11.3985 16.2898 11.3451C16.1061 11.298 15.9129 11.3041 15.7325 11.3627C15.5279 11.4291 15.3486 11.5921 14.99 11.9181Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
            })
            syncInput(validFile.current) // input dikembalikan ke file valid terakhir (atau kosong)
            return
        }
        validFile.current = file
        syncInput(file)
        setPreview(URL.createObjectURL(file))
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) assignFile(file)
    }

    function handleRemove(e: React.MouseEvent) {
        e.stopPropagation() // cegah nge-trigger buka file picker lagi
        validFile.current = null
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div
            onClick={() => { if (!preview) inputRef.current?.click() }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            aria-invalid={invalid}
            className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-md border-[1.5px] border-dashed transition-colors 
                ${invalid ? 'border-destructive' : isDragging ? 'border-primary bg-primary/5' : 'border-input'
                } ${!preview ? 'cursor-pointer' : ''}`}
        >
            <input ref={inputRef} type="file" name={name} accept={IMAGE_ACCEPT} className="hidden"
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
                <div className="flex flex-col items-center gap-3">
                    <ImagePlus className="size-9 text-neutral-300" />
                    <div className='flex flex-col items-center gap-1'>
                        <p className='text-neutral-400 text-xs font-medium'>Klik atau seret gambar ke sini</p>
                        <p className='text-neutral-400 text-[10px]'>JPG atau PNG, maks. {IMAGE_MAX_SIZE / 1024 / 1024}MB</p>
                    </div>
                </div>
            )}
        </div>
    )
}