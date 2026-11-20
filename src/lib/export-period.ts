import { CLOSE_HOUR } from "./business-hours"

/** Waktu bisnis saat ini: tanggal (YYYY-MM-DD) dan jam (0-23) menurut WIB. */
export type BusinessNow = { todayYmd: string; hour: number }

export type ExportResolution =
    | { ok: true; from: string; to: string; name: string }
    | { ok: false; error: string }

const DAY_MS = 86_400_000
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const pad = (n: number) => String(n).padStart(2, "0")

function isRealDate(ymd: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return false
    const [y, m, d] = ymd.split("-").map(Number)
    const date = new Date(Date.UTC(y, m - 1, d))
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}

function lastDayOfMonth(month: string) {
    const [y, m] = month.split("-").map(Number)
    return `${month}-${pad(new Date(Date.UTC(y, m, 0)).getUTCDate())}`
}

function previousMonth(month: string) {
    const [y, m] = month.split("-").map(Number)
    return m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`
}

/** Satu hari dianggap final kalau sudah lewat, atau hari ini setelah jam tutup. */
export function isFinalDay(ymd: string, { todayYmd, hour }: BusinessNow) {
    return ymd < todayYmd || (ymd === todayYmd && hour >= CLOSE_HOUR)
}

/** Aturan export: hanya per hari (date) atau per bulan (month), dan hanya kalau periodenya sudah final. */
export function resolveExport(
    { date, month }: { date?: string; month?: string },
    now: BusinessNow
): ExportResolution {
    let from: string
    let to: string
    let name: string
    let notFinal: string

    if (date) {
        if (!isRealDate(date)) return { ok: false, error: "Tanggal tidak valid" }
        from = to = name = date
        notFinal = `Data harian baru bisa diekspor setelah hari berakhir (hari ini setelah jam ${CLOSE_HOUR}.00)`
    } else if (month) {
        if (!MONTH.test(month)) return { ok: false, error: "Bulan tidak valid" }
        from = `${month}-01`
        to = lastDayOfMonth(month)
        name = month
        notFinal = "Data bulanan baru bisa diekspor setelah bulan berakhir"
    } else {
        return { ok: false, error: "Pilih tanggal atau bulan" }
    }

    if (!isFinalDay(to, now)) return { ok: false, error: notFinal }
    return { ok: true, from, to, name }
}

const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" })

/** Pilihan yang boleh diekspor, untuk antarmuka: hari terakhir yang final dan 12 bulan final terakhir. */
export function getExportOptions(now: BusinessNow) {
    const [y, m, d] = now.todayYmd.split("-").map(Number)
    const latestDay = isFinalDay(now.todayYmd, now)
        ? now.todayYmd
        : new Date(Date.UTC(y, m - 1, d) - DAY_MS).toISOString().slice(0, 10)

    const months: { value: string; label: string }[] = []
    let month = now.todayYmd.slice(0, 7)
    for (let i = 0; months.length < 12 && i < 14; i++, month = previousMonth(month)) {
        if (!isFinalDay(lastDayOfMonth(month), now)) continue
        const [my, mm] = month.split("-").map(Number)
        months.push({ value: month, label: monthLabel.format(new Date(Date.UTC(my, mm - 1, 1))) })
    }

    return { latestDay, months }
}

export type ExportOptions = ReturnType<typeof getExportOptions>