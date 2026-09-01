# Jaja-Rent — Fleet Operations Platform

Internal Fleet Operations & Asset Management Platform untuk **Jaja-Rent**, mengelola operasional kendaraan untuk dua model bisnis:
1. **B2C Rental (Retail)**: Customer perorangan, sewa harian/mingguan, kendaraan milik Jaja (*Jaja-owned*), opsi dengan atau tanpa driver.
2. **B2B Rent-to-Rent (Corporate)**: Customer perusahaan, sewa berbasis kontrak bulanan/tahunan, kendaraan milik Jaja maupun mitra vendor (*Vendor-owned*), alokasi armada, SLA quota, dan unit pengganti (*replacement unit*).

---

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & shadcn/ui
- **Icons**: Lucide Icons
- **Interactive Map**: Leaflet / MapCN (OpenStreetMap & Carto Positron Tiles)
- **Database Backend**: PostgreSQL via Supabase (Migrations, Views, RLS, Seed Data)
- **Data Access Layer**: Supabase Client with graceful offline fallback fixtures

---

## 🛠️ Panduan Menghubungkan ke Supabase

### 1. Buat File `.env.local`
Buat file baru bernama `.env.local` di root direktori project (sejajar dengan `package.json`), lalu isi dengan kredensial Supabase Anda:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Service Role Key (hanya untuk server backend jika diperlukan)
SUPABASE_SERVICE_ROLE_KEY=
```

> 💡 **Di mana mendapatkan URL & Anon Key?**
> 1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
> 2. Pilih Project Anda &rarr; Klik menu **Project Settings** (ikon gear di kiri bawah) &rarr; Pilih **API**
> 3. Salin **Project URL** ke `NEXT_PUBLIC_SUPABASE_URL`
> 4. Salin **Project API Keys (`anon public`)** ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 2. Eksekusi Skema Database (Migrations & Views)

Ada 2 cara untuk menerapkan skema database:

#### Cara A: Melalui Supabase SQL Editor (Paling Mudah)
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) &rarr; Masuk ke menu **SQL Editor** di panel kiri.
2. Buka dan jalankan file migrasi yang berada di folder [`supabase/migrations/`](./supabase/migrations/) secara berurutan:
   - `001_extensions.sql` — UUID extensions
   - `002_enums.sql` — PostgreSQL ENUM types
   - `003_vendors.sql` — Tabel mitra vendor
   - `004_customers.sql` — Tabel pelanggan B2C
   - `005_corporate_customers.sql` — Tabel klien korporat B2B
   - `006_drivers.sql` — Tabel daftar driver & SIM
   - `007_vehicles.sql` — Tabel armada kendaraan & constraint bisnis
   - `008_contracts.sql` — Tabel kontrak korporat & quota unit
   - `009_rentals.sql` — Tabel transaksi rental (B2C & B2B)
   - `010_allocations.sql` — Alokasi kendaraan & unit pengganti
   - `011_inspections.sql` — Checklist inspeksi kendaraan
   - `012_maintenance.sql` — Riwayat service & perbaikan bengkel
   - `013_documents.sql` — Dokumen legalitas (STNK, KIR, Asuransi)
   - `014_gps.sql` — Perangkat & telemetri GPS
   - `015_vehicle_history.sql` — Audit trail lifecycle kendaraan
   - `016_indexes.sql` — Database performance indexes
   - `017_views.sql` — Analytical views untuk dashboard
   - `018_rls.sql` — Row Level Security policies

#### Cara B: Menggunakan Supabase CLI
```bash
supabase link --project-ref your-project-id
supabase db push
```

---

### 3. Masukkan Data Awal (Seed Data)
Setelah semua migrasi berhasil dijalankan:
1. Buka file [`supabase/seed.sql`](./supabase/seed.sql)
2. Salin seluruh isinya dan jalankan di **Supabase SQL Editor**
3. Database Anda sekarang telah terisi dengan:
   - 30 kendaraan (20 unit Jaja, 10 unit Vendor)
   - 10 klien korporat & 10 pelanggan B2C
   - 10 driver operasional
   - 5 kontrak aktif, riwayat inspeksi, service bengkel, dokumen, dan data GPS

---

## 📦 Cara Push Project ke GitHub

File `.gitignore` sudah otomatis mengabaikan `.env.local` dan folder `node_modules` sehingga kredensial Supabase Anda tetap aman.

Jalankan perintah berikut di terminal:

```bash
# 1. Tambahkan semua perubahan ke Git
git add .

# 2. Buat commit pertama / update
git commit -m "feat: complete Jaja-Rent Fleet Operations dashboard with Supabase integration, live GPS, and vendor management"

# 3. Ubah nama branch utama ke main (jika belum)
git branch -M main

# 4. Hubungkan repository lokal dengan repository GitHub Anda
# Ganti URL di bawah dengan URL repository GitHub baru Anda
git remote add origin https://github.com/USERNAME/jaja-rent.git

# 5. Push ke GitHub
git push -u origin main
```

*(Jika remote `origin` sudah pernah ditambahkan sebelumnya, cukup jalankan `git push -u origin main`)*

---

## 🧭 Fitur Utama Aplikasi

1. **Fleet Management (`/fleet`)**
   - Konsolidasi seluruh armada (Jaja-owned & Vendor-owned) dalam 1 tabel terpusat.
   - Filter kepemilikan, status unit, model bisnis, dan pencarian cepat.
   - Nomor urut ("No") di setiap baris tabel.

2. **Vendor Management (`/vendors`)**
   - Pantau mitra penyedia kendaraan (asset vendor).
   - Metrik total unit yang disewakan ke Jaja, unit yang aktif disewa klien B2B, dan unit di pool.
   - Modal detail unit armada per vendor.

3. **Live GPS Tracking Map (`/operations/gps`)**
   - Peta interaktif Leaflet / MapCN dengan auto-collapse sidebar.
   - Indikator pin status warna: 🟢 Hijau (Sedang Bergerak), 🔵 Biru (Idle/Standby), 🔴 Merah (Off/Maintenance).
   - Panel kiri dengan filter checkbox dan grouping berdasarkan **Nama Perusahaan (Customer)** atau **Pemilik Kendaraan (Vendor / Jaja)**.
   - Animasi kamera fokus (`flyTo`) dan popup telemetri lengkap.

4. **Rental Operations (B2C & B2B)**
   - `/rental/b2c`: Manajemen sewa retail harian, driver option, dan inspeksi serah-terima.
   - `/rental/b2b`: Manajemen kontrak leasing korporat.
   - `/rental/reservations`: Antrean booking dan penugasan armada.

5. **Corporate & Contract SLA (`/corporate/contracts`)**
   - Monitoring pemenuhan kuota kendaraan per klien korporat.
   - Deteksi otomatis *fleet shortage* akibat unit masuk bengkel & tombol cepat penugasan *replacement unit*.

6. **Operations Monitoring**
   - `/operations/inspection`: Pre/post rental checklists & safety audit.
   - `/operations/maintenance`: Log service berkala, overhauls, dan rincian biaya bengkel.
   - `/operations/documents`: Peringatan jatuh tempo STNK, KIR, dan Asuransi.

---

## 🏃 Menjalankan Aplikasi Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
