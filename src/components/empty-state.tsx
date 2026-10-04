import React from 'react'
import Image from 'next/image'
import { StaticImageData } from 'next/image'

interface EmptyStateProps {
    label: string
    message: string
    icon: StaticImageData
}

export function EmptyState({ label, message, icon }: EmptyStateProps) {
    return (
        <div className='flex flex-col items-center justify-center mt-4 py-8 space-y-2'>
            <div className="w-fit">
                <Image src={icon} alt={label} className='w-full h-24' />
            </div>
            <div className='flex flex-col space-y-0.5'>
                <p className="px-5 font-semibold text-center text-xs text-gray-800">{label}</p>
                <p className='text-[11px] text-gray-400 text-center'>{message}</p>
            </div>
        </div>
    )
}