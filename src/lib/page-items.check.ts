// Jalankan: npx tsx src/lib/page-items.check.ts  (diam = lolos, error = gagal)
import assert from "node:assert/strict"
import { getPageItems } from "./page-items"

assert.deepEqual(getPageItems(1, 5), [1, 2, 3, 4, 5])
assert.deepEqual(getPageItems(1, 20), [1, 2, "…", 20])
assert.deepEqual(getPageItems(3, 20), [1, 2, 3, 4, "…", 20])
assert.deepEqual(getPageItems(5, 20), [1, "…", 4, 5, 6, "…", 20])
assert.deepEqual(getPageItems(20, 20), [1, "…", 19, 20])
console.log("ok")