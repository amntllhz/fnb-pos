type Cell = string | number | null | undefined

function cell(value: Cell) {
    if (value === null || value === undefined) return ""
    if (typeof value === "number") return String(value)
    // Teks yang diawali = + - @ dianggap rumus oleh Excel/Sheets, jadi diberi tanda petik di depan
    const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
    return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const SEPARATOR = ";" // Excel berlokal Indonesia memakai titik koma. Ganti ke "," untuk Excel berlokal en-US.

/** CSV siap dibuka di Excel: pemisah titik koma, BOM UTF-8 supaya karakter terbaca benar. */
export function toCsv(rows: Cell[][]) {
    return "\uFEFF" + rows.map((row) => row.map(cell).join(SEPARATOR)).join("\r\n") + "\r\n"
}