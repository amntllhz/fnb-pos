// Jam buka usaha: 10.00 sampai 20.00 (WIB). Dipakai grafik per jam di Dashboard dan aturan export.
export const OPEN_HOUR = 10
export const CLOSE_HOUR = 20

const hourFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta" })

/** Jam sekarang menurut WIB (0-23), aman dipakai di server maupun di browser. */
export const currentBusinessHour = (now = new Date()) => Number(hourFormat.format(now))

/** Buka 10.00 sampai sebelum 20.00. */
export const isOpenHour = (hour: number) => hour >= OPEN_HOUR && hour < CLOSE_HOUR