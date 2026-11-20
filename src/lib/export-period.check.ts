// Jalankan: npx tsx src/lib/export-period.check.ts  (diam = lolos, error = gagal)
import assert from "node:assert/strict"
import { getExportOptions, resolveExport } from "./export-period"

const at = (todayYmd: string, hour: number) => ({ todayYmd, hour })
const ok = (req: { date?: string; month?: string }, now: ReturnType<typeof at>) => resolveExport(req, now).ok

// Harian: hari ini baru boleh setelah jam tutup, kemarin selalu boleh, besok tidak pernah
assert.equal(ok({ date: "2026-11-19" }, at("2026-11-19", 14)), false)
assert.equal(ok({ date: "2026-11-19" }, at("2026-11-19", 19)), false)
assert.equal(ok({ date: "2026-11-19" }, at("2026-11-19", 20)), true)
assert.equal(ok({ date: "2026-11-18" }, at("2026-11-19", 10)), true)
assert.equal(ok({ date: "2026-11-20" }, at("2026-11-19", 23)), false)

// Bulanan: tengah bulan ditolak, bulan lalu boleh, hari terakhir bulan baru boleh setelah jam tutup
assert.equal(ok({ month: "2026-11" }, at("2026-11-15", 22)), false)
assert.equal(ok({ month: "2026-10" }, at("2026-11-15", 10)), true)
assert.equal(ok({ month: "2026-11" }, at("2026-11-30", 14)), false)
assert.equal(ok({ month: "2026-11" }, at("2026-11-30", 20)), true)

// Input tidak valid
assert.equal(ok({ date: "2026-02-30" }, at("2026-11-19", 10)), false)
assert.equal(ok({ month: "2026-13" }, at("2026-11-19", 10)), false)
assert.equal(ok({}, at("2026-11-19", 10)), false)

// Hasil: rentang dan nama berkas
assert.deepEqual(resolveExport({ month: "2026-02" }, at("2026-11-19", 10)), { ok: true, from: "2026-02-01", to: "2026-02-28", name: "2026-02" })

// Pilihan untuk antarmuka
const mid = getExportOptions(at("2026-11-19", 14))
assert.equal(mid.latestDay, "2026-11-18")
assert.equal(mid.months.length, 12)
assert.equal(mid.months[0].value, "2026-10")
assert.equal(getExportOptions(at("2026-11-19", 21)).latestDay, "2026-11-19")
assert.equal(getExportOptions(at("2026-01-05", 10)).months[0].value, "2025-12") // lintas tahun
console.log("ok", mid.months[0].label)