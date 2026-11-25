'use client'

import {
    AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CLOSE_HOUR, OPEN_HOUR } from "@/lib/business-hours"

export function StoreClosedDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="flex w-full flex-col items-center justify-center">
                <div className="space-y-1 py-1.5">
                    <AlertDialogTitle className="px-5 text-center text-xs font-semibold text-gray-800">
                        Di luar jam operasional
                    </AlertDialogTitle>
                    <AlertDialogDescription className="max-w-60 text-center text-[11px] text-gray-400">
                        Transaksi hanya bisa diproses pukul {OPEN_HOUR}.00-{CLOSE_HOUR}.00 WIB. Keranjang tetap tersimpan.
                    </AlertDialogDescription>
                </div>
                <AlertDialogAction className="w-full bg-prim! text-xs hover:bg-prim-dark!">Mengerti</AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>
    )
}