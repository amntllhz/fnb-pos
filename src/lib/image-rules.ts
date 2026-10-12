export const IMAGE_MIME_TO_EXT = {
    "image/jpeg": "jpg", // .jpg dan .jpeg sama-sama image/jpeg
    "image/png": "png",
} as const

export const IMAGE_ACCEPT = Object.keys(IMAGE_MIME_TO_EXT).join(",")
export const IMAGE_MAX_SIZE = 2 * 1024 * 1024 // 2 MB

export function validateImage(file: File): string | null {
    if (!Object.hasOwn(IMAGE_MIME_TO_EXT, file.type)) return "Format file tidak sesuai"
    if (file.size > IMAGE_MAX_SIZE) return "Ukuran gambar maksimal 2 MB"
    return null // null = valid
}