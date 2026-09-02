"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VendorSourcingPanel } from "@/components/reservations/vendor-sourcing-panel";
import { CreateRentalModal } from "@/components/rentals/create-rental-modal";
import { ReservationRecord } from "@/lib/types/rental";
import { getReservationById } from "@/lib/data/reservations";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  Calendar,
  ArrowLeft,
  User,
  Building2,
  Car,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ShieldCheck,
  Send,
  ExternalLink,
} from "lucide-react";

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [reservation, setReservation] =
    React.useState<ReservationRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isRentalModalOpen, setIsRentalModalOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (id) {
      const data = await getReservationById(id);
      setReservation(data);
    }
    setLoading(false);
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 text-xs gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span>Memuat data reservasi...</span>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">
          Reservasi Tidak Ditemukan
        </h2>
        <p className="text-xs text-neutral-500">
          Nomor reservasi {id} tidak terdaftar di sistem.
        </p>
        <Link href="/operations/reservations">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Reservasi
          </Button>
        </Link>
      </div>
    );
  }

  const isB2C = reservation.type === "B2C";
  const b2c = reservation.b2cRequirement;
  const b2b = reservation.b2bRequirement;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div className="flex items-center gap-3">
          <Link href="/operations/reservations">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4 text-neutral-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                {reservation.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isB2C
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "bg-purple-50 text-purple-700 border border-purple-200"
                }`}
              >
                {reservation.type} Rental
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  reservation.status === "CONFIRMED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : reservation.status === "PROCESSING"
                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                      : reservation.status === "CONVERTED"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                }`}
              >
                {reservation.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
              Detail Reservasi: {reservation.customerName}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isB2C && reservation.status !== "CONVERTED" && (
            <Button
              size="sm"
              onClick={() => setIsRentalModalOpen(true)}
              className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              <Car className="h-4 w-4" />+ Buat Rental (Terbitkan Unit)
            </Button>
          )}

          {!isB2C && reservation.status !== "CONVERTED" && (
            <Link href="/operations/contracts">
              <Button
                size="sm"
                className="text-xs font-bold gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs"
              >
                <FileText className="h-4 w-4" />+ Terbitkan Kontrak B2B
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Info Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Customer Identity */}
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
              {isB2C ? (
                <User className="h-4 w-4 text-primary" />
              ) : (
                <Building2 className="h-4 w-4 text-primary" />
              )}
              Identitas Pelanggan ({reservation.customerType})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">
                Nama Lengkap / Perusahaan:
              </span>
              <strong className="text-neutral-900">
                {reservation.customerName}
              </strong>
            </div>
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Nomor WhatsApp / HP:</span>
              <span className="font-mono text-neutral-800">
                {reservation.customerPhone}
              </span>
            </div>
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Email:</span>
              <span className="text-neutral-700">
                {reservation.customerEmail || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Tanggal Dibuat:</span>
              <span className="text-neutral-700 font-mono">
                {reservation.createdAt}
              </span>
            </div>

            {reservation.customerId && (
              <div className="pt-2">
                <Link href={`/corporate/customers/${reservation.customerId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-[11px] h-7 gap-1 font-semibold"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Lihat Profil & KYC Customer
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Requirements Summary */}
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
              <Car className="h-4 w-4 text-primary" />
              {isB2C ? "Rincian Booking B2C" : "Spesifikasi Permintaan B2B"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {isB2C && b2c ? (
              <>
                <div className="flex justify-between pb-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Kendaraan:</span>
                  <strong className="text-neutral-900">
                    {b2c.vehicleModel} ({b2c.plateNumber})
                  </strong>
                </div>
                <div className="flex justify-between pb-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Periode Sewa:</span>
                  <span className="text-neutral-800">
                    {b2c.startDate} s/d {b2c.endDate} ({b2c.durationDays} Hari)
                  </span>
                </div>
                <div className="flex justify-between pb-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Layanan Driver:</span>
                  <span className="font-semibold text-neutral-800">
                    {b2c.withDriver
                      ? "Dengan Driver Jaja"
                      : "Self-Drive (Lepas Kunci)"}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span className="text-neutral-700">
                    Estimasi Total Biaya:
                  </span>
                  <span className="text-emerald-700 font-mono text-sm">
                    {formatCurrency(b2c.estimatedTotal)}
                  </span>
                </div>
              </>
            ) : b2b ? (
              <>
                <div className="flex justify-between pb-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Kebutuhan Unit:</span>
                  <strong className="text-neutral-900">
                    {b2b.quantity} Unit &middot; {b2b.vehicleType}
                  </strong>
                </div>
                <div className="flex justify-between pb-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Durasi Kontrak:</span>
                  <span className="text-neutral-800">
                    {b2b.durationMonths} Bulan (Mulai {b2b.startDate})
                  </span>
                </div>
                <div className="flex justify-between pb-1 border-b border-neutral-100">
                  <span className="text-neutral-500">Area Operasional:</span>
                  <span className="text-neutral-800">{b2b.cityLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">
                    Target Budget / Unit:
                  </span>
                  <span className="font-mono font-semibold text-neutral-800">
                    {b2b.targetBudgetPerUnitMonthly
                      ? formatCurrency(b2b.targetBudgetPerUnitMonthly)
                      : "Sesuai Penawaran"}{" "}
                    / bln
                  </span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* If B2B: Render Vendor Sourcing & Quotations Panel */}
      {!isB2C && (
        <VendorSourcingPanel
          reservationId={reservation.id}
          vehicleType={b2b?.vehicleType || "Fleet Units"}
          requiredQuantity={b2b?.quantity || 5}
          quotations={reservation.vendorQuotations || []}
          negotiationTerms={reservation.negotiationTerms}
          onRefresh={loadData}
        />
      )}

      {/* Modal to Convert to Rental */}
      <CreateRentalModal
        open={isRentalModalOpen}
        onOpenChange={setIsRentalModalOpen}
        reservation={reservation}
      />
    </div>
  );
}
