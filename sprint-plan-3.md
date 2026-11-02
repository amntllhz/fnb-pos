# Sprint Planning & Status Update

## 📋 1. SPRINT GOAL
Menggabungkan halaman kasir ke dalam modul menu, mengimplementasikan sistem pembayaran tunai dengan pencatatan nominal, menerapkan penomoran transaksi harian yang reset setiap hari, serta menyediakan fitur pembatalan transaksi (void) khusus owner.

---

## 📅 2. DAFTAR TASK (BACKLOG ITEMS)

### 🎨 UI/UX & Frontend
- [ ] **Task 1.1:** Integrasikan layout Kasir (pilih menu + keranjang panel kanan) ke dalam route `/menus`.
- [ ] **Task 1.2:** Implementasikan komponen tombol eksplisit `[ + Tambah ]` (tinggi 36–40px) sejajar harga pada card menu.
- [ ] **Task 1.3:** Buat fungsi utilitas frontend untuk memformat tampilan nomor transaksi:
  ```ts
  export const formatOrderNumber = (n: number) => `INV-${String(n).padStart(4, "0")}`
  ```

### 🗄️ Database & Schema (Prisma)
- [ ] **Task 2.1:** Tambahkan enum `OrderStatus` (`COMPLETED`, `CANCELLED`) di `schema.prisma`.
- [ ] **Task 2.2:** Perbarui model `Order` dengan menambahkan 4 kolom baru:
  - `orderDate` (`DateTime @db.Date`) -> untuk handle kelompok reset harian.
  - `orderNumber` (`Int`) -> nomor urut transaksi.
  - `amountPaid` (`Int?`) -> nominal uang tunai yang diterima.
  - `status` (`OrderStatus @default(COMPLETED)`) & `cancelledAt` (`DateTime?`) -> untuk fitur void.
- [ ] **Task 2.3:** Pasang constraint unik gabungan `@@unique([orderDate, orderNumber])` dan indeks `@@index([createdAt])`.
- [ ] **Task 2.4:** Jalankan perintah migrasi database (`npx prisma migrate dev`).

### ⚙️ Logika Bisnis & Backend
- [ ] **Task 3.1:** Buat fungsi pencarian nomor urut terakhir pada hari yang sama untuk otomatisasi *auto-increment* `orderNumber` yang mereset ke angka `1` setiap pergantian hari (`orderDate`).
- [ ] **Task 3.2:** Implementasikan API endpoint/mutasi untuk Void transaksi (Khusus level **Owner**):
  - Ubah status menjadi `CANCELLED` dan isi `cancelledAt`.
  - Pastikan seluruh query laporan keuangan menyaring dan mengabaikan transaksi berstatus `CANCELLED`.

---

## 🔄 3. KONDISI UPDATE & MATRIKS KEPUTUSAN

| Fitur / Komponen | Keputusan Akhir | Dampak Data / Kolom Baru | Status |
| :--- | :--- | :--- | :--- |
| **Lokasi Halaman** | Digabung ke `/menus` | Tidak ada | 🔄 Ready to Develop |
| **Aksi Tambah** | Tombol eksplisit `[ + Tambah ]` sejajar harga | Tidak ada | 🔄 Ready to Develop |
| **Pencatatan Tunai** | **Pilihan A:** Nominal disimpan ke DB | `amountPaid` (Int?) | 🔄 Ready to Develop |
| **Nomor Transaksi** | **Gabungan A & B:** Format `INV-0001`, reset ke 1 setiap hari | `orderDate` (Date), `orderNumber` (Int) | 🔄 Ready to Develop |
| **Fitur Void** | **Pilihan A:** Ada, khusus Owner. Mengubah status tanpa hapus data | `status` (Enum), `cancelledAt` (DateTime) | 🔄 Ready to Develop |

---

## 📝 4. SKEMA PRISMA DISEPAKATI

```prisma
enum OrderStatus {
  COMPLETED
  CANCELLED
}

model Order {
  id            String        @id @default(uuid())
  orderDate     DateTime      @db.Date
  orderNumber   Int
  cashier       User          @relation(fields: [cashierId], references: [id])
  cashierId     String
  total         Int
  paymentMethod PaymentMethod
  amountPaid    Int?
  status        OrderStatus   @default(COMPLETED)
  cancelledAt   DateTime?
  items         OrderItem[]
  createdAt     DateTime      @default(now())

  @@unique([orderDate, orderNumber])
  @@index([createdAt])
}
```