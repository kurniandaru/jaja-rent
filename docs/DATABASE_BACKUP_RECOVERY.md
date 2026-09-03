# Jaja Rent — Database Backup & Recovery Procedure

Dokumen ini mendefinisikan strategi pencadangan (_backup_), siklus retensi, dan panduan pemulihan data (_disaster recovery_) untuk sistem basis data operasional **Jaja Rent**.

---

## 1. Spesifikasi RTO & RPO

| Metrik                               | Target Enterprise Jaja Rent | Keterangan                                                                       |
| ------------------------------------ | --------------------------- | -------------------------------------------------------------------------------- |
| **RPO** (_Recovery Point Objective_) | **\(\le 15\) Menit**        | Maksimal kehilangan data transaksi rental/pembayaran jika terjadi insiden total. |
| **RTO** (_Recovery Time Objective_)  | **\(< 1\) Jam**             | Waktu maksimal yang dibutuhkan untuk mengembalikan sistem beroperasi penuh.      |

---

## 2. Strategi Pencadangan (Backup Policy)

### A. Point-in-Time Recovery (PITR)

- **Continuous WAL Archiving**: Seluruh _Write-Ahead Logs_ (WAL) dari PostgreSQL diarsipkan secara kontinu ke penyimpanan terisolasi yang terenkripsi (AES-256).
- Memungkinkan _rollback_ ke detik persis sebelum insiden/kesalahan manusia (_accidental deletion_).

### B. Snapshot Otomatis & Jadwal Cadangan

1. **Daily Backup**: Snapshot lengkap harian dieksekusi otomatis setiap pukul **02:00 WIB** saat jam henti transaksi minimum.
2. **Weekly Full Dump**: Ekspor data komprehensif (`pg_dump` format kustom terkompresi) setiap hari Minggu.
3. **Monthly Cold Archive**: Salinan cadangan bulanan yang disimpan pada _cold storage_ lintas-wilayah (_multi-region redundancy_).

### C. Retensi Cadangan

- **Snapshot Harian**: Disimpan selama **30 Hari**.
- **Snapshot Mingguan**: Disimpan selama **3 Bulan**.
- **Snapshot Bulanan**: Disimpan selama **1 Tahun** untuk keperluan audit kepatuhan finansial & pajak.

---

## 3. Prosedur Pemulihan Data (Recovery Runbook)

### Skenario 1: Kerusakan Logis / Kesalahan Operasi Operator (Point-in-Time)

Jika terjadi mutasi tidak disengaja (misal: kesalahan skrip bulk update status rental):

1. **Identifikasi Waktu Kejadian Tepat**:
   Buka menu **Audit Logs** di `/admin/audit-logs` untuk mencari `created_at` persis dari mutasi yang salah.
2. **Inisiasi PITR via Supabase Dashboard / CLI**:
   ```bash
   # Melakukan restore point ke 1 menit sebelum mutasi salah
   supabase db restore --target-time "2026-09-03 08:45:00+07"
   ```
3. **Verifikasi Integritas Data**:
   Jalankan query validasi pada tabel `reservations`, `rentals`, dan `vehicle_allocations`.
4. **Alihkan Kembali Lalu Lintas Produksi**.

### Skenario 2: Pemulihan Penuh Bencana (Full Disaster Recovery)

Jika terjadi gangguan infrastruktur data center utama:

1. **Siapkan Instance Database Pengganti**:
   Inisialisasi cluster PostgreSQL / Supabase pada region alternatif.
2. **Unduh Snapshot Terakhir**:
   Ambil dump snapshot harian terenkripsi dari cold storage:
   ```bash
   aws s3 cp s3://jaja-rent-backups/daily/jaja_rent_prod_latest.dump .
   ```
3. **Restorasi Database Menggunakan `pg_restore`**:
   ```bash
   pg_restore --clean --if-exists --no-owner --no-privileges \
     -h <NEW_DB_HOST> -p 5432 -U postgres -d postgres jaja_rent_prod_latest.dump
   ```
4. **Terapkan Migrasi Terbaru**:
   ```bash
   # Jalankan migrasi urut dari 001 sampai 022
   supabase db push
   ```
5. **Jalankan Verifikasi Health Check**:
   ```bash
   curl -I https://rent.jaja.id/api/health
   # Ekspektasi: HTTP 200 { "status": "healthy" }
   ```

---

## 4. Pengujian Rutin (Drill Recovery)

- Tim Engineering & Operasional Jaja Rent melaksanakan uji coba pemulihan data (_recovery drill_) secara terjadwal **setiap 3 bulan sekali** di lingkungan pementasan (_staging_) untuk memvalidasi keabsahan berkas cadangan dan memastikan waktu pemulihan tetap di bawah 60 menit.
