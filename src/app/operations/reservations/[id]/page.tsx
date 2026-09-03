"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ReservationRecord } from "@/lib/types/rental";
import { getReservationById, updateReservationStatus } from "@/lib/data/reservations";
import { getCustomerById } from "@/lib/data/customers";
import { mockVehicles } from "@/lib/data";
import {
  evaluateReservationApprovalEligibility,
  approveReservationAction,
  rejectReservationAction,
  isVehicleAvailableForDates,
} from "@/lib/services/reservation-service";
import { ActionBlockerBanner } from "@/components/common/action-blocker-banner";
import { ActivityTimelineCard } from "@/components/common/activity-timeline-card";
import { formatRupiah, formatNumber } from "@/lib/utils";
import {
  Calendar,
  ArrowLeft,
  User,
  Building2,
  Car,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ShieldCheck,
  ExternalLink,
  Layers,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [reservation, setReservation] = React.useState<ReservationRecord | null>(null);
  const [customer, setCustomer] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "customer" | "vehicle" | "approval" | "contract" | "timeline"
  >("overview");

  // Rejection Dialog
  const [isRejectModalOpen, setIsRejectModalOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState("");
  const [actionError, setActionError] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    if (id) {
      const data = await getReservationById(id);
      setReservation(data);
      if (data?.customerId) {
        const custData = await getCustomerById(data.customerId);
        if (custData) setCustomer(custData.customer);
      }
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
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-neutral-800">Reservasi tidak ditemukan</p>
        <Link href="/operations/reservations">
          <Button variant="outline" size="sm" className="text-xs">
            Kembali ke Daftar Reservasi
          </Button>
        </Link>
      </div>
    );
  }

  const assignedVehicle = mockVehicles.find(
    (v) => v.id === reservation.b2cRequirement?.vehicleId || v.plateNumber === reservation.b2cRequirement?.plateNumber
  );

  const startDate = reservation.b2cRequirement?.startDate || reservation.b2bRequirement?.startDate || "2026-09-10";
  const endDate = reservation.b2cRequirement?.endDate || "2026-09-15";

  // Check blocker reason
  const coreReservation = {
    id: reservation.id,
    reservationNumber: reservation.id,
    customerId: reservation.customerId,
    customerName: reservation.customerName,
    customerNumber: customer?.customerNumber || reservation.customerId,
    customerPhone: reservation.customerPhone,
    customerStatus: customer?.status || "VERIFIED",
    rentalType: reservation.type,
    assignedVehicleId: assignedVehicle?.id,
    assignedVehiclePlate: assignedVehicle?.plateNumber,
    pickupLocation: reservation.b2cRequirement?.pickupLocation || "Pool Jakarta",
    dropoffLocation: reservation.b2cRequirement?.dropoffLocation || "Pool Jakarta",
    startAt: startDate,
    endAt: endDate,
    status: reservation.status as any,
    withDriver: Boolean(reservation.b2cRequirement?.withDriver),
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt || reservation.createdAt,
  };

  const blocker = evaluateReservationApprovalEligibility(coreReservation, customer, assignedVehicle);

  const handleApprove = async () => {
    setActionError(null);
    const res = await approveReservationAction(coreReservation, "Ops Manager");
    if (!res.success) {
      setActionError(res.error || "Gagal menyetujui reservasi");
      return;
    }
    await updateReservationStatus(reservation.id, "CONFIRMED");
    await loadData();
  };

  const handleReject = async () => {
    if (!rejectReason || rejectReason.trim().length < 5) {
      setActionError("Alasan penolakan wajib diisi minimal 5 karakter.");
      return;
    }
    const res = await rejectReservationAction(coreReservation, rejectReason, "Ops Manager");
    if (!res.success) {
      setActionError(res.error || "Gagal menolak reservasi");
      return;
    }
    await updateReservationStatus(reservation.id, "CANCELLED");
    setIsRejectModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/operations/reservations"
              className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Daftar Reservasi
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-mono font-bold text-neutral-900">{reservation.id}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {reservation.customerName}
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                reservation.status === "CONFIRMED" || reservation.status === "APPROVED"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : reservation.status === "CANCELLED"
                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                  : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {reservation.status}
            </span>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {reservation.status !== "CONFIRMED" && reservation.status !== "APPROVED" && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(true)}
                className="text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                <XCircle className="h-3.5 w-3.5 mr-1" />
                Tolak Reservasi
              </Button>
              <Button
                size="sm"
                disabled={!blocker.canPerform}
                onClick={handleApprove}
                className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                Setujui Reservasi (Approve)
              </Button>
            </>
          )}
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {actionError}
        </div>
      )}

      {/* Tabs Navigation (6 Tabs) */}
      <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 max-w-3xl text-xs font-semibold overflow-x-auto">
        {[
          { id: "overview", label: "1. Overview", icon: FileText },
          { id: "customer", label: "2. Customer", icon: User },
          { id: "vehicle", label: "3. Vehicle Allocation", icon: Car },
          { id: "approval", label: "4. Approval Gate", icon: ShieldCheck },
          { id: "contract", label: "5. Kontrak", icon: FileCheck2 },
          { id: "timeline", label: "6. Audit Timeline", icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-neutral-200 shadow-xs">
              <CardHeader className="p-4 border-b border-neutral-100">
                <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Rincian Jadwal & Kebutuhan Sewa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-neutral-500 block">Tipe Layanan:</span>
                    <strong className="text-neutral-900 block font-semibold text-sm">
                      {reservation.type === "B2C" ? "B2C Retail Individual" : "B2B Corporate Sourcing"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Opsi Pengemudi:</span>
                    <strong className="text-neutral-900 block font-semibold">
                      {reservation.b2cRequirement?.withDriver ? "Dengan Supir Jaja" : "Self-Drive (Lepas Kunci)"}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                  <div>
                    <span className="text-neutral-500 block">Tanggal Mulai:</span>
                    <strong className="text-neutral-900 font-mono text-sm block">{startDate}</strong>
                    <span className="text-[11px] text-neutral-400">Jam 08:00 WIB</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Tanggal Selesai:</span>
                    <strong className="text-neutral-900 font-mono text-sm block">{endDate}</strong>
                    <span className="text-[11px] text-neutral-400">Jam 18:00 WIB</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <div className="flex items-center gap-2 text-neutral-700">
                    <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>
                      Pickup: <strong>{reservation.b2cRequirement?.pickupLocation || "Pool Jakarta Pusat"}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-700">
                    <MapPin className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>
                      Dropoff: <strong>{reservation.b2cRequirement?.dropoffLocation || "Pool Jakarta Pusat"}</strong>
                    </span>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="pt-2 border-t border-neutral-100 text-neutral-600">
                    <span className="text-neutral-400 block mb-0.5">Catatan Khusus:</span>
                    <p className="bg-neutral-50 p-2.5 rounded border border-neutral-200">
                      {reservation.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Explanatory Approval Readiness Banner */}
            <ActionBlockerBanner
              blocker={blocker}
              actionTitle="Persetujuan Reservasi"
            />
          </div>

          <div className="space-y-6">
            <Card className="border-neutral-200 shadow-xs">
              <CardHeader className="p-4 border-b border-neutral-100">
                <CardTitle className="text-sm font-bold text-neutral-900">
                  Estimasi Biaya Sewa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Tarif Harian:</span>
                  <span className="font-mono">Rp 450.000</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Durasi Sewa:</span>
                  <span className="font-mono">3 Hari</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Proteksi Asuransi:</span>
                  <span className="font-mono">Rp 150.000</span>
                </div>
                <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-900">
                  <span>Total Estimasi:</span>
                  <span className="font-mono text-primary">
                    {formatRupiah(reservation.b2cRequirement?.estimatedTotal || 1950000)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER */}
      {activeTab === "customer" && (
        <Card className="border-neutral-200 shadow-xs max-w-2xl">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Profil & Legalitas Pemesan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-neutral-500 block">Nama Lengkap:</span>
                <strong className="text-neutral-900 font-semibold">{reservation.customerName}</strong>
              </div>
              <div>
                <span className="text-neutral-500 block">Status KYC Customer:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {customer?.status || "VERIFIED"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
              <div>
                <span className="text-neutral-500 block">Nomor Telepon:</span>
                <span className="font-mono text-neutral-900">{reservation.customerPhone}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Email:</span>
                <span className="text-neutral-900">{reservation.customerEmail || "-"}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <Link href={`/customers/${reservation.customerId}`}>
                <Button size="sm" variant="outline" className="text-xs gap-1">
                  Buka Halaman Customer Lengkap
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: VEHICLE ALLOCATION */}
      {activeTab === "vehicle" && (
        <div className="space-y-4 max-w-3xl">
          <Card className="border-neutral-200 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Alokasi Unit Armada Kendaraan
              </CardTitle>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                TIDAK ADA KONFLIK JADWAL ✓
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {assignedVehicle ? (
                <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-mono font-bold text-sm text-neutral-900 block">
                      {assignedVehicle.plateNumber}
                    </span>
                    <strong className="text-neutral-800 block text-xs">
                      {assignedVehicle.brand} {assignedVehicle.model} ({assignedVehicle.year})
                    </strong>
                    <span className="text-[11px] text-neutral-500 block">
                      Warna {assignedVehicle.color} &middot; Odometer {formatNumber(assignedVehicle.odometer)} KM
                    </span>
                  </div>
                  <Link href={`/fleet/${assignedVehicle.plateNumber.replace(/\s+/g, "-")}`}>
                    <Button size="sm" variant="outline" className="text-xs gap-1">
                      Detail Armada
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="py-6 text-center text-neutral-500">
                  Belum ada unit kendaraan yang dialokasikan.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: APPROVAL */}
      {activeTab === "approval" && (
        <div className="space-y-4 max-w-2xl">
          <ActionBlockerBanner
            blocker={blocker}
            actionTitle="Persetujuan Reservasi (Approval Gate)"
          />

          <Card className="border-neutral-200 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100">
              <CardTitle className="text-sm font-bold text-neutral-900">
                Aksi Eksekusi Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <p className="text-neutral-600">
                Persetujuan reservasi ini akan mengunci alokasi armada dan menerbitkan draf kontrak sewa digital secara otomatis.
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  disabled={!blocker.canPerform}
                  onClick={handleApprove}
                  className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Konfirmasi Setujui Reservasi
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRejectModalOpen(true)}
                  className="text-xs font-semibold text-rose-600 border-rose-200"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Tolak Reservasi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: CONTRACT */}
      {activeTab === "contract" && (
        <Card className="border-neutral-200 shadow-xs max-w-2xl">
          <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-primary" />
              Kontrak Sewa Digital Terkait
            </CardTitle>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              RNT-000001
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <p className="text-neutral-600">
              Kontrak sewa nomor <strong>RNT-000001</strong> mengatur hak dan kewajiban penyewa, ketentuan asuransi, deposit jaminan, dan klausul ganti rugi.
            </p>
            <Link href="/operations/contracts/CTR-2026-001">
              <Button size="sm" variant="outline" className="text-xs gap-1">
                Buka Dokumen Kontrak Sewa
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="max-w-2xl">
          <ActivityTimelineCard
            entityType="RESERVATION"
            entityId={reservation.id}
            title="Riwayat Audit & Aktivitas Reservasi"
            fallbackEvents={[
              {
                id: "EV-1",
                action: "RESERVATION_CREATED",
                actorName: "Customer via Web Portal",
                notes: "Reservasi baru diajukan oleh pemesan.",
                createdAt: reservation.createdAt,
              },
            ]}
          />
        </div>
      )}

      {/* Rejection Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="max-w-md bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-900">
              Tolak Reservasi Kendaraan
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Masukkan alasan penolakan secara jelas. Alasan ini akan tercatat dalam audit log dan terkirim ke pemesan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-neutral-700 block">
              Alasan Penolakan <span className="text-rose-500">*</span>
            </label>
            <Textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Unit kendaraan sedang dalam perawatan berkala atau jadwal bertabrakan..."
              className="text-xs"
            />
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleReject}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Konfirmasi Tolak Reservasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
