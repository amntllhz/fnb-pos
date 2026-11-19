// Jalankan: npx tsx src/lib/csv.check.ts  (diam = lolos, error = gagal)
import assert from "node:assert/strict"
import { toCsv } from "./csv"

const out = toCsv([
    ["Nama", "Total"],
    ["Es Teh; Manis", 5000],
    ['Kopi "Susu"', 12000],
    ["=HYPERLINK(1)", null],
])
assert.equal(out.charCodeAt(0), 0xfeff) // BOM untuk Excel
assert.equal(
    out.slice(1),
    'Nama;Total\r\n"Es Teh; Manis";5000\r\n"Kopi ""Susu""";12000\r\n\'=HYPERLINK(1);\r\n'
)
console.log("ok")