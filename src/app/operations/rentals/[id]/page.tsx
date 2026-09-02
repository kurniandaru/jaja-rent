"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RentalStatusStepper } from "@/components/rentals/rental-status-stepper";
import { HandoverUploadModal } from "@/components/rentals/handover-upload-modal";
import { RentalRecord } from "@/lib/types/rental";
import { getRentalById, returnRental } from "@/lib/data/rentals";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Car,
  ArrowLeft,
  User,
  Building2,
  Calendar,
  FileCheck2,
  FileText,
  ClipboardCheck,
  Truck,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Gauge,
  Fuel,
  Upload,
  Camera,
  ExternalLink,
} from "lucide-react";

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [rental, setRental] = React.useState<RentalRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "customer" | "contract" | "vehicle" | "inspection" | "delivery" | "handover" | "operational"
  >("overview");

  const [isHandoverModalOpen, setIsHandoverModalOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (id) {
      const data = await getRentalById(id);
      setRental(data);
    }
    setLoading(false);
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReturnVehicle = async () => {
    if (!rental) return;
    const confirm = window.confirm("Apakah Anda yakin ingin memproses pengembalian kendaraan ini dan menyelesaikan masa sewa?");
    if (confirm) {
      await returnRental(
        rental.id,
        new Date().toISOString().split("T")[0],
        "Pengembalian unit selesai tanpa keluhan."
      );
      await loadData();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 text-xs gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span>Memuat data transaksi rental...</span>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">Transaksi Rental Tidak Ditemukan</h2>
        <Link href="/operations/rentals">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Rental
          </Button>
        </Link>
      </div>
    );
  }

  const isB2C = rental.type === "B2C";
  const isHandedOver = rental.handover?.isHandedOver;

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div className="flex items-center gap-3">
          <Link href="/operations/rentals">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4 text-neutral-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                {rental.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isB2C
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-purple-50 text-purple-700 border border-purple-200"
                }`}
              >
                {rental.type} Rental
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  rental.status === "ACTIVE"
                    ? "bg-emerald-600 text-white"
                    : rental.status === "HANDOVER"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                }`}
              >
                {rental.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
              {rental.vehiclePlate} &middot; {rental.vehicleModel}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isHandedOver && rental.status !== "COMPLETED" && (
            <Button
              size="sm"
              onClick={() => setIsHandoverModalOpen(true)}
              className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <FileCheck2 className="h-4 w-4" />
              Upload Bukti Serah Terima (BAST)
            </Button>
          )}

          {rental.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReturnVehicle}
              className="text-xs font-bold gap-1.5 border-neutral-300 text-neutral-800 hover:bg-neutral-100"
            >
              <RotateCcw className="h-3.5 w-3.5 text-neutral-600" />
              Proses Pengembalian Unit (Return)
            </Button>
          )}
        </div>
      </div>

      {/* Visual 7-Stage Lifecycle Stepper */}
      <RentalStatusStepper currentStatus={rental.status} />

      {/* Critical Handover Notice if not handed over */}
      {!isHandedOver && rental.status !== "COMPLETED" && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <strong className="text-amber-900 font-bold block">
                Menunggu Dokumen Bukti Serah Terima Kendaraan (BAST)
              </strong>
              <p className="text-amber-700 text-[11px] mt-0.5">
                Sesuai aturan operasional, status rental belum dapat berubah menjadi <strong>ACTIVE</strong> sebelum bukti serah terima (PDF/Foto) di-upload.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setIsHandoverModalOpen(true)}
            className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            Upload BAST Sekarang
          </Button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex rounded-xl bg-neutral-100/90 p-1 border border-neutral-200/80 overflow-x-auto text-xs font-semibold gap-1 select-none">
        {[
          { id: "overview", label: "Overview", icon: Car },
          { id: "customer", label: "Customer", icon: isB2C ? User : Building2 },
          ...(!isB2C ? [{ id: "contract", label: "Contract B2B", icon: FileText }] : []),
          { id: "vehicle", label: "Vehicle Specs", icon: Car },
          { id: "inspection", label: "Pre-Inspection", icon: ClipboardCheck },
          { id: "delivery", label: "Delivery Schedule", icon: Truck },
          { id: "handover", label: "Bukti Serah Terima (BAST)", icon: FileCheck2 },
          { id: "operational", label: "Operational & GPS", icon: Gauge },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-white/50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <Card className="border-neutral-200/80 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Informasi Rental
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between pb-1 border-b border-neutral-100">
                <span className="text-neutral-500">Nomor Transaksi:</span>
                <span className="font-mono font-bold text-neutral-900">{rental.id}</span>
              </div>
              <div className="flex justify-between pb-1 border-b border-neutral-100">
                <span className="text-neutral-500">Penyewa:</span>
                <strong className="text-neutral-900">{rental.customerName}</strong>
              </div>
              <div className="flex justify-between pb-1 border-b border-neutral-100">
                <span className="text-neutral-500">Periode Sewa:</span>
                <span className="text-neutral-800 font-mono">
                  {rental.startDate} s/d {rental.endDate} ({rental.durationText})
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-neutral-100">
                <span className="text-neutral-500">Layanan Driver:</span>
                <span className="font-semibold text-neutral-800">
                  {rental.withDriver ? `Ya (${rental.driverName || "Driver Jaja"})` : "Lepas Kunci (Self-Drive)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Lokasi Serah Terima:</span>
                <span className="text-neutral-800">{rental.pickupLocation}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200/80 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Financial & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between pb-1 border-b border-neutral-100">
                <span className="text-neutral-500">Rate Sewa:</span>
                <span className="font-mono font-bold text-neutral-900">
                  {formatCurrency(rental.ratePerPeriod)}
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-neutral-100">
                <span className="text-neutral-500">Total Tagihan:</span>
                <span className="font-mono font-bold text-base text-neutral-900">
                  {formatCurrency(rental.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-neutral-100">
                <span className="text-neutral-500">Deposit Jaminan:</span>
                <span className="font-mono text-neutral-800">
                  {rental.depositAmount ? formatCurrency(rental.depositAmount) : "Tanpa Deposit"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status Pembayaran:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {rental.paymentStatus}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Customer */}
      {activeTab === "customer" && (
        <Card className="border-neutral-200/80 shadow-xs max-w-2xl text-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              {isB2C ? <User className="h-4 w-4 text-primary" /> : <Building2 className="h-4 w-4 text-primary" />}
              Data Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Nama Pelanggan:</span>
              <strong className="text-neutral-900">{rental.customerName}</strong>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Nomor Telepon:</span>
              <span className="font-mono text-neutral-900">{rental.customerPhone || "-"}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Email:</span>
              <span className="text-neutral-800">{rental.customerEmail || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Tipe Pelanggan:</span>
              <span className="font-semibold text-neutral-800">{rental.customerType}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Contract (B2B) */}
      {activeTab === "contract" && !isB2C && (
        <Card className="border-neutral-200/80 shadow-xs max-w-2xl text-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              Ketentuan Kontrak B2B
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Nomor Kontrak Terkait:</span>
              <Link
                href={`/operations/contracts/${rental.contractId}`}
                className="font-mono font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                {rental.contractId}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Billing Cycle:</span>
              <span className="font-semibold text-neutral-800">Bulanan (Net 30 Days)</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">SLA Perbaikan & Penggantian:</span>
              <span className="text-neutral-800">Maks 4 Jam / Unit Pengganti Maks 6 Jam</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Maintenance & Asuransi:</span>
              <span className="font-semibold text-emerald-700">All-In Managed by Jaja-Rent</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4. Vehicle Specs */}
      {activeTab === "vehicle" && (
        <Card className="border-neutral-200/80 shadow-xs max-w-2xl text-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Car className="h-4 w-4 text-primary" />
              Spesifikasi Unit Kendaraan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Nomor Polisi:</span>
              <strong className="font-mono text-sm text-neutral-900">{rental.vehiclePlate}</strong>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Model & Tipe:</span>
              <span className="font-semibold text-neutral-900">{rental.vehicleModel}</span>
            </div>
            <div className="flex justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-neutral-500">Kepemilikan Armada:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  rental.vehicleOwnership === "JAJA_OWNED"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-purple-50 text-purple-700 border border-purple-200"
                }`}
              >
                {rental.vehicleOwnership === "JAJA_OWNED" ? "Jaja-Owned Vehicle" : "Vendor-Owned Vehicle"}
              </span>
            </div>
            {rental.vendorName && (
              <div className="flex justify-between">
                <span className="text-neutral-500">Mitra Vendor:</span>
                <span className="font-semibold text-neutral-800">{rental.vendorName}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Pre-Rental Inspection */}
      {activeTab === "inspection" && (
        <Card className="border-neutral-200/80 shadow-xs max-w-2xl text-xs">
          <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Pre-Rental Digital Inspection
            </CardTitle>
            {rental.inspection?.inspectionId && (
              <Link href={`/operations/inspections/${rental.inspection.inspectionId}`}>
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 font-semibold">
                  Lihat Audit 76 Komponen
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {rental.inspection ? (
              <>
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase block">
                      Hasil Inspeksi Sebelum Serah Terima
                    </span>
                    <span className="text-xs font-semibold text-neutral-900 block mt-0.5">
                      Status: <strong>{rental.inspection.status || "PASSED"}</strong> &middot; Inspector: {rental.inspection.inspectorName || "Tim QC Jaja"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-neutral-400 block">Overall Grade</span>
                    <span className="text-xl font-bold font-mono text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-lg">
                      Grade {rental.inspection.grade || "A"}
                    </span>
                  </div>
                </div>

                {rental.inspection.summaryNotes && (
                  <p className="text-neutral-600 italic bg-white p-3 rounded-lg border border-neutral-100">
                    &quot;{rental.inspection.summaryNotes}&quot;
                  </p>
                )}
              </>
            ) : (
              <div className="p-6 text-center text-neutral-400">
                Belum ada data inspeksi pre-rental tercatat.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 6. Delivery Schedule */}
      {activeTab === "delivery" && (
        <Card className="border-neutral-200/80 shadow-xs max-w-2xl text-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-primary" />
              Jadwal & Detail Pengiriman
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {rental.delivery ? (
              <>
                <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Status Delivery:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {rental.delivery.status}
                  </span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Jadwal Pengiriman:</span>
                  <span className="font-mono text-neutral-900">
                    {rental.delivery.scheduledDate} &middot; {rental.delivery.scheduledTime || "08:00 WIB"}
                  </span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Alamat Tujuan:</span>
                  <span className="text-neutral-900 font-medium">{rental.delivery.deliveryLocation}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                  <span className="text-neutral-500">Petugas Pengantar:</span>
                  <span className="text-neutral-900">{rental.delivery.deliveredBy || "Dispatch Staff"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Penerima di Lokasi:</span>
                  <span className="text-neutral-900 font-bold">{rental.delivery.recipientName} ({rental.delivery.recipientPhone})</span>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-neutral-400">
                Belum ada jadwal delivery tercatat.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 7. Handover (Bukti Serah Terima BAST) */}
      {activeTab === "handover" && (
        <Card className="border-neutral-200/80 shadow-xs max-w-3xl text-xs">
          <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <FileCheck2 className="h-4.5 w-4.5 text-emerald-600" />
                Bukti Serah Terima Kendaraan (BAST)
              </CardTitle>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Dokumen legalitas fisik dan dokumentasi foto saat kendaraan diserahterimakan kepada penyewa.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsHandoverModalOpen(true)}
              className="text-xs font-bold gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800"
            >
              <Upload className="h-3.5 w-3.5" />
              {isHandedOver ? "Update Dokumen BAST" : "+ Upload BAST"}
            </Button>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 space-y-4">
            {isHandedOver && rental.handover ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Detail Penyerahan</span>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Tanggal / Waktu:</span>
                      <strong className="text-neutral-900">{rental.handover.handoverDate} {rental.handover.handoverTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Diserahkan Oleh:</span>
                      <span className="text-neutral-800">{rental.handover.handedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Diterima Oleh:</span>
                      <strong className="text-neutral-900">{rental.handover.receivedBy}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">Kondisi Fisik</span>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Odometer:</span>
                      <strong className="font-mono text-neutral-900">{formatNumber(rental.handover.odometerAtHandover || 45200)} KM</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Bahan Bakar:</span>
                      <strong className="font-mono text-emerald-700">{rental.handover.fuelLevelPercent || 100}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Status Legal:</span>
                      <span className="font-bold text-emerald-700">BAST Terkonfirmasi ✓</span>
                    </div>
                  </div>
                </div>

                {/* Document Attached Preview */}
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className="h-5 w-5 text-emerald-700" />
                    <div>
                      <span className="font-bold text-neutral-900 block">{rental.handover.documentName || "BAST_Signed.pdf"}</span>
                      <span className="text-[10px] text-emerald-700">Telah ditandatangani kedua belah pihak</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                    TERVERIFIKASI
                  </span>
                </div>

                {/* Photo Gallery */}
                {rental.handover.photos && rental.handover.photos.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-neutral-800 block">
                      Foto Dokumentasi Serah Terima ({rental.handover.photos.length}):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {rental.handover.photos.map((url, idx) => (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
                          <img src={url} alt={`Dokumentasi ${idx + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-neutral-400 space-y-2 border-2 border-dashed border-neutral-200 rounded-xl">
                <FileCheck2 className="h-8 w-8 mx-auto text-neutral-300" />
                <p className="font-semibold text-neutral-700">Belum ada Bukti Serah Terima yang di-upload</p>
                <p className="text-[11px] text-neutral-400 max-w-md mx-auto">
                  Silakan upload Berita Acara Serah Terima (BAST) dan foto fisik unit saat diserahkan ke pelanggan untuk mengaktifkan status rental.
                </p>
                <Button
                  size="sm"
                  onClick={() => setIsHandoverModalOpen(true)}
                  className="mt-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Upload BAST Sekarang
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 8. Operational & GPS */}
      {activeTab === "operational" && (
        <Card className="border-neutral-200/80 shadow-xs max-w-2xl text-xs">
          <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-primary" />
              Monitoring Operasional Kendaraan
            </CardTitle>
            <Link href="/operations/gps">
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1">
                Buka Live GPS Map
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Status GPS Telemetry</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ONLINE &middot; Ignition ON &middot; Kecepatan 34 km/h
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500">Jakarta Selatan</span>
            </div>

            <div className="pt-2 flex justify-end">
              {rental.status === "ACTIVE" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReturnVehicle}
                  className="text-xs font-bold gap-1.5 text-neutral-800 hover:bg-neutral-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Selesaikan Rental & Terima Unit (Return)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Handover Upload Modal */}
      <HandoverUploadModal
        open={isHandoverModalOpen}
        onOpenChange={setIsHandoverModalOpen}
        rentalId={rental.id}
        customerName={rental.customerName}
        plateNumber={rental.vehiclePlate}
        defaultLocation={rental.pickupLocation}
        onHandoverConfirmed={loadData}
      />
    </div>
  );
}
