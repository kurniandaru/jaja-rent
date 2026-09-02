import { AgreementVersion } from "../types/agreement";

export const mockAgreementVersions: AgreementVersion[] = [
  // 1. B2C Rental Terms & Conditions v1.3 (Current Active)
  {
    id: "AGR-B2C-V1.3",
    agreementType: "B2C_RENTAL_TERMS",
    title: "Syarat & Ketentuan Sewa Kendaraan Perorangan (B2C)",
    version: "1.3",
    effectiveDate: "2026-09-01",
    summary: "Ketentuan resmi hak dan kewajiban penyewa individual, klausul operasional, asuransi, dan tanggung jawab hukum.",
    isActive: true,
    clauses: [
      {
        id: "CLAUSE-B2C-01",
        key: "general_terms",
        title: "1. Ketentuan Umum & Legalitas Identitas",
        content: "Penyewa wajib memiliki identitas resmi (KTP/Paspor) dan SIM A yang sah dan masih berlaku selama periode sewa.",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2C-02",
        key: "vehicle_usage",
        title: "2. Kebijakan Penggunaan Kendaraan",
        content: "Kendaraan hanya boleh digunakan di wilayah yang disepakati, tidak digunakan untuk aktivitas ilegal, balapan, atau disewakan kembali (sub-rent).",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2C-03",
        key: "maintenance_fuel",
        title: "3. Ketentuan Bahan Bakar & Perawatan Ringan",
        content: "Kendaraan dikembalikan dengan level bahan bakar yang sama seperti saat serah terima. Penyewa menjaga kebersihan kabin kendaraan.",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2C-04",
        key: "overdue_return",
        title: "4. Ketentuan Keterlambatan Pengembalian (Overdue)",
        content: "Keterlambatan pengembalian unit melebihi toleransi 60 menit dikenakan biaya over-time proporsional per jam atau charge 1 hari penuh.",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2C-05",
        key: "damage_liability",
        title: "5. Tanggung Jawab Kerusakan & Asuransi (Own Risk)",
        content: "Apabila terjadi kecelakaan/kerusakan, penyewa bertanggung jawab atas biaya deductible asuransi (Own Risk) sesuai tabel polis asuransi.",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2C-06",
        key: "driver_policy",
        title: "6. Ketentuan Layanan Pengemudi (Driver Policy)",
        content: "Layanan sewa dengan driver memiliki batasan waktu kerja standar maksimal 12 jam/hari. Biaya overtime driver dibayarkan terpisah.",
        isRequired: true,
      },
    ],
  },

  // 2. B2B Master Service Agreement v2.0 (Current Active)
  {
    id: "AGR-B2B-V2.0",
    agreementType: "B2B_MASTER_SERVICE_AGREEMENT",
    title: "Master Fleet Service Agreement Korporasi (B2B)",
    version: "2.0",
    effectiveDate: "2026-08-01",
    summary: "Perjanjian induk penyewaan armada operasional korporat, Service Level Agreement (SLA), unit pengganti, dan term pembayaran.",
    isActive: true,
    clauses: [
      {
        id: "CLAUSE-B2B-01",
        key: "corporate_legal",
        title: "1. Legalitas Perusahaan & Wewenang PIC",
        content: "PIC yang menandatangani mewakili badan hukum dengan wewenang sah sesuai Akta Pendirian / Surat Kuasa Direksi.",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2B-02",
        key: "fleet_allocation_sla",
        title: "2. Alokasi Armada & Service Level Agreement (SLA)",
        content: "Jaja Rent menjamin tanggap darurat perbaikan di bawah 4 jam dan penyediaan replacement unit maksimal 6 jam untuk Jabodetabek.",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2B-03",
        key: "all_inclusive_maintenance",
        title: "3. Perawatan Berkala & Pajak Kendaraan",
        content: "Seluruh biaya servis berkala, perpanjangan STNK/KIR, dan pergantian ban aus normal ditanggung sepenuhnya oleh Jaja Rent / Vendor pengelola.",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2B-04",
        key: "billing_payment_term",
        title: "4. Siklus Penagihan & Term Pembayaran (Net 30/45 Days)",
        content: "Invoice diterbitkan setiap awal bulan dengan term pembayaran Net 30 hari. Keterlambatan pembayaran berulang dapat menangguhkan status sewa.",
        isRequired: true,
      },
      {
        id: "CLAUSE-B2B-05",
        key: "insurance_total_loss",
        title: "5. Perlindungan Asuransi Komprehensif & Pihak Ketiga",
        content: "Armada dilindungi asuransi All-Risk Commercial dengan perluasan Tanggung Jawab Hukum Pihak Ketiga (TJH III).",
        isRequired: true,
      },
    ],
  },
];
