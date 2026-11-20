import { dateToYmd, getBusinessDate } from "@/lib/business-date"

const hourFormat = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
})

/** Tanggal dan jam bisnis saat ini (WIB), untuk menentukan apakah suatu periode sudah selesai. */
export function getBusinessNow() {
    return { todayYmd: dateToYmd(getBusinessDate()), hour: Number(hourFormat.format(new Date())) }
}