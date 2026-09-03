# Jaja Rent — Enterprise Security Audit & Hardening Report

Laporan audit keamanan komprehensif untuk **Jaja Rent Phase 3: Enterprise Control, Notification & Integration**.

---

## 1. Ringkasan Evaluasi Postur Keamanan

| Domain Keamanan                  | Status     | Penilaian & Langkah Hardening yang Diterapkan                                                                                                                                                                                         |
| -------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authentication & RBAC**        | **SECURE** | Pemetaan peran terpusat (`ADMIN`, `OPERATIONS`, `FINANCE`, `WORKSHOP`, `MANAGEMENT`, `SUPER_ADMIN`, `CUSTOMER_SERVICE`, `FLEET_MANAGER`) dengan fungsi `can(user, permission)` & `assertCan()`. Hak akses mutasi diisolasi di server. |
| **Row Level Security (RLS)**     | **SECURE** | Seluruh tabel Phase 1, Phase 2, dan Phase 3 (`019`, `020`, `021`, `022`) mengaktifkan RLS. Kebijakan publik anonim (`USING true`) telah dicabut secara tuntas. Pengguna anonim ditolak dari data internal.                            |
| **Sensitive Data Protection**    | **SECURE** | Penyamaran otomatis (_data masking_) diterapkan pada NIK KTP (`3275********0001`), nomor telepon (`0812****7890`), nomor rekening finansial, dan alamat IP internal bagi peran non-privileged.                                        |
| **File Upload Security**         | **SECURE** | Validasi tipe MIME ketat (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`), batas ukuran maksimal 5 MB, dan sanitasi nama file untuk mencegah _path traversal_ atau _injection_.                                           |
| **Audit Trail Immutability**     | **SECURE** | Seluruh mutasi dicatat dalam tabel `audit_logs` dengan informasi aktor, aksi, `old_data`, `new_data`, `metadata`, `ip_address`, dan `user_agent`. Antarmuka UI bersifat _strictly read-only_ (tanpa kemampuan hapus/edit).            |
| **Integration & Webhook**        | **SECURE** | Verifikasi tanda tangan digital HMAC SHA-256 dan kunci idempotensi (`idempotency_key`) untuk mencegah serangan _replay_ atau eksekusi pembayaran ganda.                                                                               |
| **Rate Protection**              | **SECURE** | Mekanisme proteksi frekuensi permintaan pada aksi sensitif (login, upload dokumen, penerimaan webhook) untuk mencegah _abuse_ atau serangan _brute force_.                                                                            |
| **Secrets & Credential Hygiene** | **SECURE** | Nol kredensial atau rahasia API yang di-commit ke repositori Git. Kredensial dibaca melalui environment variables (`SUPABASE_SERVICE_ROLE_KEY`, dll.).                                                                                |

---

## 2. Rincian Kebijakan Akses Peran (RBAC Matrix)

| Modul Bisnis                     | Admin |       Operations       |          Finance           |        Workshop         |   Management (Audit)   |
| -------------------------------- | :---: | :--------------------: | :------------------------: | :---------------------: | :--------------------: |
| **Customer KYC & Verifikasi**    | Full  |  Kelola & Verifikasi   |         Lihat Saja         |            -            |  Lihat Saja (Masked)   |
| **Persetujuan Reservasi**        | Full  |    Setujui & Tolak     |         Lihat Saja         |            -            |       Lihat Saja       |
| **Alokasi Kendaraan & Handover** | Full  | Alokasi & Serah Terima |             -              |            -            |       Lihat Saja       |
| **Siklus Rental & Kontrak**      | Full  | Aktifkan & Kembalikan  |        Rekonsiliasi        |            -            |       Lihat Saja       |
| **Inspeksi Fisik & Kerusakan**   | Full  |      Buat & Lihat      |    Lihat (Beban Biaya)     | Input Temuan & Perbaiki |       Lihat Saja       |
| **Servis Armada & QC Kelayakan** | Full  |         Pantau         |             -              |  Eksekusi Servis & QC   |       Lihat Saja       |
| **Pembayaran, Tagihan, Deposit** | Full  |         Lihat          | Input, Verifikasi & Refund |            -            | Lihat Laporan Keuangan |
| **Audit Logs & System Trail**    | Full  |     Lihat Sendiri      |      Lihat Finansial       |            -            | Full Audit (Read-Only) |
| **Konfigurasi Ambang Batas**     | Full  |           -            |             -              |            -            |           -            |
