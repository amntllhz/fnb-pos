const TIME_ZONE = "Asia/Jakarta"

/** Tanggal kalender WIB untuk sebuah waktu, format "YYYY-MM-DD" */
export const businessYmd = (instant: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(instant)

/** Date dari kolom @db.Date (UTC tengah malam) menjadi "YYYY-MM-DD" tanpa pergeseran zona */
export const dateToYmd = (date: Date) => date.toISOString().slice(0, 10)

/** "YYYY-MM-DD" menjadi Date UTC tengah malam, null kalau bukan tanggal yang valid */
export function parseYmd(ymd: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null
  const date = new Date(`${ymd}T00:00:00.000Z`)
  // round-trip menolak tanggal mustahil seperti 2026-02-31
  return Number.isNaN(date.getTime()) || dateToYmd(date) !== ymd ? null : date
}

export const getBusinessDate = (instant: Date = new Date()) =>
  parseYmd(businessYmd(instant)) as Date

export const localDateToYmd = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-")

/** "YYYY-MM-DD" menjadi Date lokal tengah malam, untuk DayPicker */
export const ymdToLocalDate = (ymd: string) => {
  const [year, month, day] = ymd.split("-").map(Number)
  return new Date(year, month - 1, day)
}