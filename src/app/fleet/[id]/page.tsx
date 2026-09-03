"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Car,
  Building2,
  User,
  MapPin,
  ShieldCheck,
  Wrench,
  FileCheck2,
  History,
  Navigation,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ExternalLink,
  FileText,
  Calendar,
  Clock,
  Radio,
  Plus,
  ArrowRight,
  ShieldAlert,
  Sliders,
  DollarSign,
  Camera,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { OwnershipBadge } from "@/components/ui/priority-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ActionBlockerBanner } from "@/components/common/action-blocker-banner";
import { ActivityTimelineCard } from "@/components/common/activity-timeline-card";
import {
  getVehicleById,
  getAllocationsForVehicle,
  getDamagesForVehicle,
  getDocumentsForVehicle,
  updateVehicleStatusAction,
  saveAllocation,
  saveDamage,
} from "@/lib/data/vehicles";
import { Vehicle } from "@/lib/types/fleet";
import {
  VehicleAllocationRecord,
  VehicleDamageRecord,
  VehicleDocumentWithAlert,
  VehicleConditionArea,
  ConditionSeverity,
} from "@/lib/types/fleet-operations";
import {
  getVehicleAvailability,
  allocateVehicleAction,
  releaseVehicleAllocationAction,
} from "@/lib/services/fleet-availability-service";
import {
  evaluateHandoverEligibility,
  executeVehicleHandoverAction,
  returnVehicleAction,
  recordVehicleDamageAction,
} from "@/lib/services/fleet-inspection-service";
import {
  sendVehicleToMaintenanceAction,
  completeMaintenanceWorkAction,
  performMaintenanceQCAction,
} from "@/lib/services/fleet-maintenance-service";
import { calculateDocumentAlert } from "@/lib/services/vehicle-timeline-service";
import { formatNumber, formatRupiah, formatDate } from "@/lib/utils";
import { mockRentals, mockInspections, mockMaintenance } from "@/lib/data";

// Dynamic import Leaflet GPS History Map
const VehicleGPSHistoryMap = dynamic(
  () =>
    import("@/components/fleet/vehicle-gps-history-map").then(
      (mod) => mod.VehicleGPSHistoryMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] flex flex-col items-center justify-center bg-neutral-100 text-neutral-500 rounded-xl gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-xs font-medium">
          Memuat peta pelacak GPS historis...
        </span>
      </div>
    ),
  },
);

import { VehicleTelematicsTab } from "@/components/telematics/vehicle-telematics-tab";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = (params.id as string) || "B-1234-XYZ";

  const [vehicle, setVehicle] = React.useState<Vehicle | null>(null);
  const [allocations, setAllocations] = React.useState<
    VehicleAllocationRecord[]
  >([]);
  const [damages, setDamages] = React.useState<VehicleDamageRecord[]>([]);
  const [documents, setDocuments] = React.useState<VehicleDocumentWithAlert[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);

  // 9 Structured Tabs as specified in Section 24
  const [activeTab, setActiveTab] = React.useState<
    | "overview"
    | "rental"
    | "allocation"
    | "inspection"
    | "damage"
    | "maintenance"
    | "documents"
    | "gps"
    | "timeline"
  >("overview");

  // Operational Action Modal States (Section 26 - No arbitrary dropdown)
  const [isAllocateModalOpen, setIsAllocateModalOpen] = React.useState(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = React.useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = React.useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] =
    React.useState(false);
  const [isCompleteMntModalOpen, setIsCompleteMntModalOpen] =
    React.useState(false);
  const [isQCModalOpen, setIsQCModalOpen] = React.useState(false);
  const [isAddDamageModalOpen, setIsAddDamageModalOpen] = React.useState(false);

  // Form states for modals
  const [allocStart, setAllocStart] = React.useState("2026-09-10");
  const [allocEnd, setAllocEnd] = React.useState("2026-09-13");
  const [allocOperator, setAllocOperator] = React.useState(
    "Ops Dispatcher Budi",
  );

  const [handoverLocation, setHandoverLocation] = React.useState(
    "Pool Pusat SCBD Lot 8",
  );
  const [handoverOdometer, setHandoverOdometer] = React.useState(14500);
  const [handoverFuel, setHandoverFuel] = React.useState(100);

  const [returnOdometer, setReturnOdometer] = React.useState(15200);
  const [returnNotes, setReturnNotes] = React.useState(
    "Pengembalian unit selesai tanpa keluhan mesin",
  );

  const [mntWorkshop, setMntWorkshop] = React.useState(
    "Bengkel Resmi Toyota Auto2000",
  );
  const [mntType, setMntType] = React.useState("Servis Berkala & Ganti Oli");
  const [mntDesc, setMntDesc] = React.useState(
    "Tune up mesin, ganti filter oli, pembersihan rem",
  );

  const [damageArea, setDamageArea] =
    React.useState<VehicleConditionArea>("BODY");
  const [damageDesc, setDamageDesc] = React.useState("");
  const [damageSeverity, setDamageSeverity] =
    React.useState<ConditionSeverity>("MINOR");
  const [damageCost, setDamageCost] = React.useState(250000);

  const [actionNotice, setActionNotice] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadVehicleData = React.useCallback(async () => {
    setLoading(true);
    const v = await getVehicleById(vehicleId);
    if (v) {
      setVehicle({ ...v });
      setHandoverOdometer(v.odometer);
      setReturnOdometer(v.odometer + 450);
      const allocs = await getAllocationsForVehicle(v.id);
      const dmgs = await getDamagesForVehicle(v.id);
      const docs = await getDocumentsForVehicle(v.id);
      setAllocations(allocs);
      setDamages(dmgs);
      setDocuments(docs);
    }
    setLoading(false);
  }, [vehicleId]);

  React.useEffect(() => {
    loadVehicleData();
  }, [loadVehicleData]);

  if (loading || !vehicle) {
    return (
      <div className="p-12 text-center text-xs text-neutral-400">
        Memuat detail operasional kendaraan...
      </div>
    );
  }

  // Related operational mock items
  const vehicleRentals = mockRentals.filter(
    (r) => r.vehicleId === vehicle.id || r.vehiclePlate === vehicle.plateNumber,
  );
  const vehicleInspections = mockInspections.filter(
    (i) => i.vehicleId === vehicle.id || i.plateNumber === vehicle.plateNumber,
  );
  const vehicleMaintenance = mockMaintenance.filter(
    (m) => m.vehicleId === vehicle.id || m.plateNumber === vehicle.plateNumber,
  );

  // Latest pre-rental inspection
  const latestPreInspection = vehicleInspections.find(
    (i) => i.type === "PRE_RENTAL",
  ) || {
    id: "INSP-PRE-001",
    type: "PRE_RENTAL",
    result: "PASSED" as const,
  };

  // Check Availability for allocation
  const availability = getVehicleAvailability(
    vehicle,
    allocStart,
    allocEnd,
    allocations.map((a) => ({
      id: a.id,
      vehicleId: a.vehicleId,
      sourceType: "ALLOCATION",
      startDate: a.startAt,
      endDate: a.endAt,
      status: a.status,
    })),
  );

  // Check Handover Blocker
  const handoverEligibility = evaluateHandoverEligibility(
    vehicle,
    vehicleRentals[0] || ({ vehicleId: vehicle.id } as any),
    latestPreInspection,
  );

  // Handle Operational Actions
  const handleAllocate = async () => {
    const res = await allocateVehicleAction(
      vehicle,
      allocStart,
      allocEnd,
      allocOperator,
      undefined,
      undefined,
      allocations.map((a) => ({
        id: a.id,
        vehicleId: a.vehicleId,
        sourceType: "ALLOCATION",
        startDate: a.startAt,
        endDate: a.endAt,
        status: a.status,
      })),
    );

    if (res.success && res.allocation) {
      await saveAllocation(res.allocation);
      setIsAllocateModalOpen(false);
      setActionNotice({
        type: "success",
        message: `Unit ${vehicle.plateNumber} berhasil dialokasikan (${res.allocation.allocationNumber}). Status menjadi ALLOCATED.`,
      });
      loadVehicleData();
    } else {
      setActionNotice({
        type: "error",
        message: res.error || "Gagal mengalokasikan unit.",
      });
    }
  };

  const handleHandover = async () => {
    const dummyRental = vehicleRentals[0] || {
      id: "RNT-ACT-001",
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plateNumber,
      status: "RESERVED",
    };

    const res = await executeVehicleHandoverAction(
      vehicle,
      dummyRental as any,
      {
        handoverLocation,
        odometer: Number(handoverOdometer),
        fuelLevel: Number(handoverFuel),
        notes: "Serah terima kunci & BAST selesai",
      },
      latestPreInspection,
      "Field Ops Hendra",
    );

    if (res.success) {
      setIsHandoverModalOpen(false);
      setActionNotice({
        type: "success",
        message: `Kendaraan ${vehicle.plateNumber} telah diserahterimakan! Status unit menjadi RENTED.`,
      });
      loadVehicleData();
    } else {
      setActionNotice({
        type: "error",
        message: res.error || "Gagal melakukan serah terima.",
      });
    }
  };

  const handleReturn = async () => {
    const dummyRental = vehicleRentals[0] || {
      id: "RNT-ACT-001",
      vehicleId: vehicle.id,
      vehiclePlate: vehicle.plateNumber,
      status: "ACTIVE",
    };

    const res = await returnVehicleAction(
      vehicle,
      dummyRental as any,
      new Date().toISOString(),
      Number(returnOdometer),
      "QC Lead Dimas",
      returnNotes,
    );

    if (res.success) {
      setIsReturnModalOpen(false);
      setActionNotice({
        type: "success",
        message: `Kendaraan ${vehicle.plateNumber} diterima dari penyewa. Status menjadi INSPECTION (menunggu periksa kondisi).`,
      });
      loadVehicleData();
    }
  };

  const handleSendMaintenance = async () => {
    const res = await sendVehicleToMaintenanceAction(
      vehicle,
      mntType,
      mntDesc,
      mntWorkshop,
      "Fleet Ops Dimas",
    );

    if (res.success) {
      setIsMaintenanceModalOpen(false);
      setActionNotice({
        type: "success",
        message: `Kendaraan ${vehicle.plateNumber} dikirim ke bengkel ${mntWorkshop}. Status unit menjadi MAINTENANCE.`,
      });
      loadVehicleData();
    }
  };

  const handleCompleteMaintenance = async () => {
    const res = await completeMaintenanceWorkAction(
      vehicle,
      "MNT-1001",
      [
        {
          id: "1",
          category: "OIL",
          itemName: "Oli Mesin 0W-20",
          quantity: 4,
          unitCost: 165000,
          subtotal: 660000,
          status: "REPLACED",
        },
        {
          id: "2",
          category: "OTHER",
          itemName: "Jasa Servis & Tune Up",
          quantity: 1,
          unitCost: 350000,
          subtotal: 350000,
          status: "OK",
        },
      ],
      mntWorkshop,
      "Kepala Bengkel Wahyu",
    );

    if (res.success) {
      setIsCompleteMntModalOpen(false);
      setActionNotice({
        type: "success",
        message: `Pekerjaan bengkel selesai! Unit sekarang dalam status pemeriksaan QC (QC_PENDING).`,
      });
      loadVehicleData();
    }
  };

  const handleQC = async (result: "PASS" | "FAIL") => {
    const res = await performMaintenanceQCAction(
      vehicle,
      "MNT-1001",
      result,
      "QC Lead Rudi",
      result === "PASS"
        ? "Uji jalan & inspeksi komponen pasca-servis memenuhi standar keselamatan."
        : "Masih ditemukan bunyi decit pada rem belakang, perlu perbaikan ulang.",
    );

    if (res.success) {
      setIsQCModalOpen(false);
      setActionNotice({
        type: "success",
        message:
          result === "PASS"
            ? `QC LULUS! Unit ${vehicle.plateNumber} telah kembali berstatus AVAILABLE dan siap disewakan.`
            : `QC GAGAL. Unit ${vehicle.plateNumber} dikembalikan ke antrean bengkel (MAINTENANCE).`,
      });
      loadVehicleData();
    }
  };

  const handleAddDamage = async () => {
    if (!damageDesc) return;
    const res = await recordVehicleDamageAction(
      vehicle.id,
      {
        area: damageArea,
        description: damageDesc,
        severity: damageSeverity,
        estimatedCost: Number(damageCost),
      },
      "Inspector Bambang",
    );

    if (res.success) {
      await saveDamage(res.damage);
      setIsAddDamageModalOpen(false);
      setDamageDesc("");
      setActionNotice({
        type: "success",
        message: `Kerusakan baru ${res.damage.damageNumber} (${damageArea}) berhasil dicatat di buku besar kerusakan.`,
      });
      loadVehicleData();
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali ke Fleet Command Center
        </Link>
        <span className="text-xs font-mono text-neutral-400">
          Unit ID: {vehicle.id} &middot; VIN: {vehicle.vin}
        </span>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
            actionNotice.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <span>{actionNotice.message}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-[11px] font-bold underline ml-4 hover:opacity-80"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
                {vehicle.plateNumber}
              </h1>
              <OwnershipBadge ownership={vehicle.ownership} />
              <StatusBadge status={vehicle.status} />
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900 text-white uppercase font-mono">
                {vehicle.lifecycleStatus || "ACTIVE"}
              </span>
              {vehicle.businessEligibility && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700 uppercase border border-neutral-200">
                  {vehicle.businessEligibility === "BOTH"
                    ? "B2C & B2B"
                    : vehicle.businessEligibility}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-600">
              <span className="font-bold text-neutral-900 text-sm">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </span>
              <span className="text-neutral-300">•</span>
              <span>{vehicle.color}</span>
              <span className="text-neutral-300">•</span>
              <span>{vehicle.transmission}</span>
              <span className="text-neutral-300">•</span>
              <span>{vehicle.fuelType}</span>
              <span className="text-neutral-300">•</span>
              <span className="font-mono font-bold text-neutral-800">
                {formatNumber(vehicle.odometer)} KM
              </span>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="flex flex-col text-right text-xs">
            <span className="text-neutral-400 font-medium">Lokasi Terkini</span>
            <span className="font-bold text-neutral-900 text-sm">
              {vehicle.locationCity}
            </span>
            <span className="text-[11px] text-neutral-500">
              {vehicle.locationArea}
            </span>
          </div>
        </div>

        {/* 9 Structured Tabs as specified in Section 24 */}
        <div className="mt-6 flex flex-wrap border-b border-neutral-200 -mb-5 sm:-mb-6 gap-1 text-xs">
          {[
            { id: "overview", label: "Overview", icon: Car },
            {
              id: "rental",
              label: "Rental History",
              icon: KeyRound,
              count: vehicleRentals.length,
            },
            {
              id: "allocation",
              label: "Allocation",
              icon: Calendar,
              count: allocations.length,
            },
            {
              id: "inspection",
              label: "Inspection",
              icon: ShieldCheck,
              count: vehicleInspections.length,
            },
            {
              id: "damage",
              label: "Damage",
              icon: AlertTriangle,
              count: damages.length,
            },
            {
              id: "maintenance",
              label: "Maintenance",
              icon: Wrench,
              count: vehicleMaintenance.length,
            },
            {
              id: "documents",
              label: "Documents",
              icon: FileCheck2,
              count: documents.length,
            },
            { id: "gps", label: "GPS & Telematics", icon: Navigation },
            { id: "timeline", label: "Timeline", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-neutral-900 text-neutral-900 font-bold"
                    : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isActive ? "text-neutral-900" : "text-neutral-400"}`}
                />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? "bg-neutral-900 text-white"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW (Answers all 8 questions from Section 24 + Action Buttons from Section 26) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Section 26: Discrete Operational Action Buttons (No Arbitrary Dropdown!) */}
          <Card className="border-neutral-200 bg-neutral-50/50 p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Operational Workflow Actions (Section 26)
                </span>
                <p className="text-xs text-neutral-600">
                  Perubahan status unit dilakukan melalui aksi operasional resmi
                  ber-audit trail.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white border border-neutral-200 rounded">
                Current: {vehicle.status}
              </span>
            </div>

            <div className="pt-3 flex flex-wrap gap-2">
              <Button
                variant={vehicle.status === "AVAILABLE" ? "default" : "outline"}
                size="sm"
                onClick={() => setIsAllocateModalOpen(true)}
                className="text-xs font-semibold gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                Alokasikan Unit
              </Button>

              <Button
                variant={
                  vehicle.status === "ALLOCATED" ||
                  vehicle.status === "RESERVED"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() => setIsHandoverModalOpen(true)}
                className="text-xs font-semibold gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5" />
                Serah Terima (Handover)
              </Button>

              <Button
                variant={vehicle.status === "RENTED" ? "default" : "outline"}
                size="sm"
                onClick={() => setIsReturnModalOpen(true)}
                className="text-xs font-semibold gap-1.5"
              >
                <Clock className="h-3.5 w-3.5" />
                Terima Pengembalian
              </Button>

              <Button
                variant={
                  vehicle.status === "INSPECTION" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setIsMaintenanceModalOpen(true)}
                className="text-xs font-semibold gap-1.5"
              >
                <Wrench className="h-3.5 w-3.5" />
                Kirim ke Bengkel
              </Button>

              <Button
                variant={
                  vehicle.status === "MAINTENANCE" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setIsCompleteMntModalOpen(true)}
                className="text-xs font-semibold gap-1.5"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Selesaikan Servis
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsQCModalOpen(true)}
                className="text-xs font-semibold gap-1.5 text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Inspeksi QC Keluar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddDamageModalOpen(true)}
                className="text-xs font-semibold gap-1.5 text-rose-800 border-rose-300 bg-rose-50 hover:bg-rose-100 ml-auto"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />+ Catat
                Kerusakan
              </Button>
            </div>
          </Card>

          {/* 8 Question Operational Grid (Section 24) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Current Status */}
            <Card className="border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                1. Status Operasional
              </span>
              <div className="my-2">
                <StatusBadge status={vehicle.status} />
              </div>
              <p className="text-[11px] text-neutral-500">
                Tahap: {vehicle.lifecycleStage || vehicle.status}
              </p>
            </Card>

            {/* 2. Current Customer & Rental */}
            <Card className="border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                2. Penyewa & Rental Saat Ini
              </span>
              <div className="my-1">
                {vehicle.currentCustomerName ? (
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block truncate">
                      {vehicle.currentCustomerName}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      {vehicle.currentRentalId || "Active Contract"}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-medium text-neutral-400">
                    Tidak sedang disewa
                  </span>
                )}
              </div>
              <span className="text-[10px] text-neutral-500">
                Tipe: {vehicle.businessEligibility}
              </span>
            </Card>

            {/* 3. Current Location */}
            <Card className="border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                3. Lokasi Keberadaan Unit
              </span>
              <div className="my-1 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    {vehicle.locationCity}
                  </span>
                  <span className="text-[11px] text-neutral-500 line-clamp-1">
                    {vehicle.locationArea}
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                GPS: {vehicle.latitude.toFixed(4)},{" "}
                {vehicle.longitude.toFixed(4)}
              </span>
            </Card>

            {/* 4. Odometer & 5. Next Service */}
            <Card className="border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                4 & 5. Odometer & Jadwal Servis
              </span>
              <div className="my-1">
                <span className="text-sm font-mono font-bold text-neutral-900 block">
                  {formatNumber(vehicle.odometer)} KM
                </span>
                <span
                  className={`text-[11px] font-semibold ${
                    vehicle.odometer >= vehicle.nextServiceOdometer
                      ? "text-rose-600"
                      : "text-neutral-500"
                  }`}
                >
                  Servis Berikutnya: {formatNumber(vehicle.nextServiceOdometer)}{" "}
                  KM
                </span>
              </div>
              <span className="text-[10px] text-neutral-400">
                Status Servis: {vehicle.maintenanceStatus}
              </span>
            </Card>

            {/* 6. Document Health */}
            <Card className="border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                6. Kepatuhan Dokumen (STNK/KIR)
              </span>
              <div className="my-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    vehicle.documentStatus === "OK"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : vehicle.documentStatus === "EXPIRING_SOON"
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {vehicle.documentStatus.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-[10px] text-neutral-500">
                {documents.length} berkas legalitas terdaftar
              </p>
            </Card>

            {/* 7. GPS Telematics Health */}
            <Card className="border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                7. Kesehatan GPS Telematics
              </span>
              <div className="my-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    vehicle.gpsStatus === "ONLINE"
                      ? "bg-emerald-500 animate-pulse"
                      : vehicle.gpsStatus === "IDLE"
                        ? "bg-amber-400"
                        : "bg-rose-500"
                  }`}
                />
                <span className="text-xs font-bold text-neutral-800">
                  {vehicle.gpsStatus}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  ({vehicle.speed} km/h)
                </span>
              </div>
              <span className="text-[10px] text-neutral-500">
                Ping: {vehicle.lastGpsUpdate}
              </span>
            </Card>

            {/* 8. Business Rates */}
            <Card className="border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Tarif Rental
              </span>
              <div className="my-1">
                <span className="text-xs font-bold text-neutral-900 block">
                  {vehicle.dailyRateB2C
                    ? formatRupiah(vehicle.dailyRateB2C)
                    : "N/A"}{" "}
                  <span className="text-[10px] font-normal text-neutral-500">
                    / hari (B2C)
                  </span>
                </span>
                <span className="text-xs font-bold text-neutral-900 block">
                  {vehicle.monthlyRateB2B
                    ? formatRupiah(vehicle.monthlyRateB2B)
                    : "N/A"}{" "}
                  <span className="text-[10px] font-normal text-neutral-500">
                    / bln (B2B)
                  </span>
                </span>
              </div>
              <span className="text-[10px] text-neutral-400">
                Kepemilikan: {vehicle.ownership}
              </span>
            </Card>

            {/* 9. Kerusakan Aktif */}
            <Card className="border-neutral-200 shadow-xs p-4 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Buku Besar Kerusakan
              </span>
              <div className="my-1">
                <span className="text-sm font-bold text-neutral-900 block">
                  {damages.length} Kerusakan
                </span>
                <span className="text-[10px] text-rose-600 font-medium">
                  {damages.filter((d) => d.status === "OPEN").length} Open /
                  Under Review
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("damage")}
                className="h-6 text-[10px] text-primary p-0 justify-start"
              >
                Lihat detail kerusakan &rarr;
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: RENTAL HISTORY */}
      {activeTab === "rental" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="border-b border-neutral-100 p-4">
            <CardTitle className="text-sm font-bold text-neutral-900">
              Riwayat Sewa & Kontrak ({vehicleRentals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rental ID</TableHead>
                  <TableHead>Penyewa</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Periode</TableHead>
                  <TableHead>Total Biaya</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleRentals.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-xs text-neutral-500"
                    >
                      Belum ada riwayat rental untuk unit ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicleRentals.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs font-bold">
                        {r.id}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {r.customerName}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-700">
                          {r.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.startDate} s/d {r.endDate}
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold">
                        {formatRupiah(r.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: ALLOCATION */}
      {activeTab === "allocation" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="border-b border-neutral-100 p-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900">
                Daftar Alokasi Unit ({allocations.length})
              </CardTitle>
              <p className="text-xs text-neutral-500">
                Alokasi unit terhubung dengan reservasi & rental dengan proteksi
                benturan jadwal
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAllocateModalOpen(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Alokasikan Unit
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Alokasi</TableHead>
                  <TableHead>Rentang Tanggal</TableHead>
                  <TableHead>Reservasi / Rental</TableHead>
                  <TableHead>Dialokasikan Oleh</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-xs text-neutral-500"
                    >
                      Tidak ada alokasi aktif untuk unit ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  allocations.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs font-bold text-neutral-900">
                        {a.allocationNumber}
                      </TableCell>
                      <TableCell className="text-xs">
                        {a.startAt} s/d {a.endAt}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-neutral-600">
                        {a.reservationNumber ||
                          a.reservationId ||
                          a.rentalId ||
                          "-"}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-700">
                        {a.allocatedBy}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            a.status === "ALLOCATED"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {a.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {a.status === "ALLOCATED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const res = await releaseVehicleAllocationAction(
                                a,
                                vehicle,
                                "Ops Dispatcher Budi",
                              );
                              if (res.success) {
                                setActionNotice({
                                  type: "success",
                                  message: res.message,
                                });
                                loadVehicleData();
                              }
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800"
                          >
                            Lepas Alokasi
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: INSPECTION */}
      {activeTab === "inspection" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="border-b border-neutral-100 p-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900">
                Histori Inspeksi Kondisi ({vehicleInspections.length})
              </CardTitle>
              <p className="text-xs text-neutral-500">
                Pemeriksaan pra-rental, return, servis berkala, dan insiden
              </p>
            </div>
            <Link href="/operations/inspections/new">
              <Button size="sm" className="text-xs font-semibold gap-1.5">
                <Plus className="h-3.5 w-3.5" />+ Buat Inspeksi Baru
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead>Hasil</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleInspections.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs font-bold">
                      {i.id}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                        {i.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{i.date}</TableCell>
                    <TableCell className="text-xs font-medium">
                      {i.inspectorName}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {formatNumber(i.odometer)} KM
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          i.result === "PASSED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {i.result}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 max-w-xs truncate">
                      {i.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: DAMAGE MANAGEMENT */}
      {activeTab === "damage" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="border-b border-neutral-100 p-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900">
                Buku Besar Kerusakan Kendaraan (Vehicle Damages)
              </CardTitle>
              <p className="text-xs text-neutral-500">
                Pelacakan cacat fisik, estimasi biaya, dan status tagihan per 10
                area komponen
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsAddDamageModalOpen(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />+ Catat Kerusakan Baru
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Kerusakan</TableHead>
                  <TableHead>Area Komponen</TableHead>
                  <TableHead>Deskripsi Kerusakan</TableHead>
                  <TableHead>Keparahan</TableHead>
                  <TableHead>Estimasi Biaya</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal Lapor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {damages.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-xs text-neutral-500"
                    >
                      Tidak ada catatan kerusakan pada kendaraan ini (Kondisi
                      bersih).
                    </TableCell>
                  </TableRow>
                ) : (
                  damages.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs font-bold text-neutral-900">
                        {d.damageNumber || d.id}
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-800">
                          {d.area}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-neutral-800">
                        {d.description}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            d.severity === "NORMAL"
                              ? "bg-neutral-100 text-neutral-600"
                              : d.severity === "MINOR"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : d.severity === "MAJOR"
                                  ? "bg-orange-50 text-orange-800 border border-orange-200"
                                  : "bg-rose-50 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {d.severity}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono font-bold">
                        {formatRupiah(d.estimatedCost)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            d.status === "CHARGED" || d.status === "REPAIRED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {d.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-neutral-500">
                        {d.reportedAt ? formatDate(d.reportedAt) : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: MAINTENANCE */}
      {activeTab === "maintenance" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="border-b border-neutral-100 p-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900">
                Log Servis & Bengkel ({vehicleMaintenance.length})
              </CardTitle>
              <p className="text-xs text-neutral-500">
                Pekerjaan bengkel berkala, penggantian suku cadang, dan gerbang
                Quality Control (QC)
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="text-xs font-semibold gap-1.5"
            >
              <Wrench className="h-3.5 w-3.5" />+ Kirim ke Bengkel
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record ID</TableHead>
                  <TableHead>Tipe Servis</TableHead>
                  <TableHead>Bengkel Rekanan</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead>Total Biaya</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicleMaintenance.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-mono text-xs font-bold">
                      {m.id}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-neutral-800">
                      {m.type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-700">
                      {m.workshopName}
                    </TableCell>
                    <TableCell className="text-xs">{m.date}</TableCell>
                    <TableCell className="text-xs font-mono">
                      {formatNumber(m.odometer)} KM
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold">
                      {formatRupiah(m.cost)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : m.status === "IN_PROGRESS"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {m.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: DOCUMENTS */}
      {activeTab === "documents" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="border-b border-neutral-100 p-4">
            <CardTitle className="text-sm font-bold text-neutral-900">
              Dokumen Legal & Kepatuhan ({documents.length})
            </CardTitle>
            <p className="text-xs text-neutral-500">
              Masa berlaku STNK, KIR, BPKB, dan Polis Asuransi terhitung secara
              otomatis
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipe Dokumen</TableHead>
                  <TableHead>Nomor Registrasi</TableHead>
                  <TableHead>Tanggal Terbit</TableHead>
                  <TableHead>Tanggal Kadaluarsa</TableHead>
                  <TableHead>Sisa Masa Berlaku</TableHead>
                  <TableHead>Status Kepatuhan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => {
                  const alert = calculateDocumentAlert(doc.expiryDate);
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-bold text-xs text-neutral-900">
                        {doc.documentType}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {doc.documentNumber}
                      </TableCell>
                      <TableCell className="text-xs">
                        {doc.issuedDate || doc.issueDate}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">
                        {doc.expiryDate}
                      </TableCell>
                      <TableCell className="text-xs text-neutral-600">
                        {alert.alertMessage}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            alert.alertStatus === "VALID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : alert.alertStatus === "EXPIRING_SOON"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {alert.alertStatus.replace(/_/g, " ")}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 8: GPS & ADVANCED TELEMATICS */}
      {activeTab === "gps" && <VehicleTelematicsTab vehicle={vehicle} />}

      {/* TAB 9: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="space-y-4">
          <ActivityTimelineCard
            entityType="VEHICLE"
            entityId={vehicle.id}
            title={`Audit & Operational Timeline — ${vehicle.plateNumber}`}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPERATIONAL ACTION MODALS (Section 26)                                     */}
      {/* ========================================================================= */}

      {/* 1. Modal Alokasi Unit */}
      <Dialog open={isAllocateModalOpen} onOpenChange={setIsAllocateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Alokasikan Kendaraan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Alokasikan unit {vehicle.plateNumber} ({vehicle.brand}{" "}
              {vehicle.model}) untuk jadwal operasional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <ActionBlockerBanner
              blocker={availability.blockerReasons as any}
              actionTitle="Alokasi Unit"
            />

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                value={allocStart}
                onChange={(e) => setAllocStart(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Tanggal Selesai
              </label>
              <Input
                type="date"
                value={allocEnd}
                onChange={(e) => setAllocEnd(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Petugas Alokasi
              </label>
              <Input
                value={allocOperator}
                onChange={(e) => setAllocOperator(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAllocateModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!availability.isAvailable}
              onClick={handleAllocate}
              className="text-xs font-semibold"
            >
              Konfirmasi Alokasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Modal Serah Terima (Handover) */}
      <Dialog open={isHandoverModalOpen} onOpenChange={setIsHandoverModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Serah Terima Kendaraan (Handover)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Serah terima fisik unit {vehicle.plateNumber} kepada penyewa untuk
              memulai rental aktif.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <ActionBlockerBanner
              blocker={handoverEligibility.blockerReasons as any}
              actionTitle="Serah Terima Unit"
            />

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Lokasi Serah Terima
              </label>
              <Input
                value={handoverLocation}
                onChange={(e) => setHandoverLocation(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  Odometer Awal (KM)
                </label>
                <Input
                  type="number"
                  value={handoverOdometer}
                  onChange={(e) => setHandoverOdometer(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                  BBM Awal (%)
                </label>
                <Input
                  type="number"
                  value={handoverFuel}
                  onChange={(e) => setHandoverFuel(Number(e.target.value))}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHandoverModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!handoverEligibility.canPerform}
              onClick={handleHandover}
              className="text-xs font-semibold"
            >
              Konfirmasi Handover & Aktivasi Rental
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Modal Terima Pengembalian (Return) */}
      <Dialog open={isReturnModalOpen} onOpenChange={setIsReturnModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Terima Pengembalian Unit
            </DialogTitle>
            <DialogDescription className="text-xs">
              Catat pengembalian unit {vehicle.plateNumber}. Status unit akan
              berpindah ke INSPECTION.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Odometer Pengembalian (KM)
              </label>
              <Input
                type="number"
                value={returnOdometer}
                onChange={(e) => setReturnOdometer(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Catatan Pengembalian
              </label>
              <Input
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReturnModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleReturn}
              className="text-xs font-semibold"
            >
              Proses Pengembalian (Masuk Inspeksi)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Modal Kirim ke Bengkel (Maintenance) */}
      <Dialog
        open={isMaintenanceModalOpen}
        onOpenChange={setIsMaintenanceModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Kirim Unit ke Bengkel
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kirim unit {vehicle.plateNumber} ke bengkel rekanan untuk servis
              atau perbaikan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Nama Bengkel / Workshop
              </label>
              <Input
                value={mntWorkshop}
                onChange={(e) => setMntWorkshop(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Jenis Servis
              </label>
              <Input
                value={mntType}
                onChange={(e) => setMntType(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Deskripsi Pekerjaan
              </label>
              <Input
                value={mntDesc}
                onChange={(e) => setMntDesc(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMaintenanceModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleSendMaintenance}
              className="text-xs font-semibold"
            >
              Kirim ke Bengkel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. Modal Selesaikan Servis */}
      <Dialog
        open={isCompleteMntModalOpen}
        onOpenChange={setIsCompleteMntModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Selesaikan Servis Bengkel
            </DialogTitle>
            <DialogDescription className="text-xs">
              Konfirmasi penyelesaian pekerjaan servis untuk{" "}
              {vehicle.plateNumber}. Unit akan masuk ke antrean Quality Control
              (QC_PENDING).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-lg bg-neutral-100 border border-neutral-200">
              <span className="font-bold text-neutral-900 block mb-1">
                Item Pekerjaan & Biaya
              </span>
              <ul className="text-[11px] text-neutral-600 space-y-1">
                <li>• Oli Mesin 0W-20 (4L): Rp 660.000</li>
                <li>• Jasa Servis & Tune Up: Rp 350.000</li>
                <li className="font-bold text-neutral-900 pt-1 border-t border-neutral-300">
                  Total Servis: Rp 1.010.000
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompleteMntModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleCompleteMaintenance}
              className="text-xs font-semibold"
            >
              Konfirmasi Selesai Servis (Masuk QC)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. Modal QC Keluar (Pass / Fail) */}
      <Dialog open={isQCModalOpen} onOpenChange={setIsQCModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Quality Control (QC) Pasca-Servis
            </DialogTitle>
            <DialogDescription className="text-xs">
              Verifikasi keselamatan dan kelayakan unit {vehicle.plateNumber}{" "}
              sebelum kembali disewakan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <p className="text-neutral-600">
              QC Lead memeriksa kelayakan mekanikal, sistem rem, lampu, dan uji
              jalan.
            </p>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-950">
              <span className="font-bold block mb-1">Aturan Bisnis:</span>
              <ul className="space-y-1 text-[11px]">
                <li>
                  • <strong>PASS:</strong> Unit langsung berstatus{" "}
                  <code>AVAILABLE</code> dan jadwal servis berikutnya di-reset.
                </li>
                <li>
                  • <strong>FAIL:</strong> Unit dikembalikan ke antrean bengkel
                  (<code>MAINTENANCE</code>).
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQC("FAIL")}
              className="text-xs font-semibold text-rose-700 border-rose-300 hover:bg-rose-50"
            >
              QC GAGAL (Rework)
            </Button>
            <Button
              size="sm"
              onClick={() => handleQC("PASS")}
              className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              QC LULUS (AVAILABLE)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 7. Modal Catat Kerusakan Baru */}
      <Dialog
        open={isAddDamageModalOpen}
        onOpenChange={setIsAddDamageModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Catat Kerusakan Kendaraan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tambahkan catatan cacat kondisi fisik unit {vehicle.plateNumber}{" "}
              ke buku besar kerusakan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Area Komponen (10 Area)
              </label>
              <select
                value={damageArea}
                onChange={(e) => setDamageArea(e.target.value as any)}
                className="w-full h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
              >
                <option value="BODY">BODY (Bemper, Pintu, Fender)</option>
                <option value="GLASS">GLASS (Kaca Depan, Spion)</option>
                <option value="LIGHTS">LIGHTS (Headlamp, Stoplamp)</option>
                <option value="TIRES">TIRES (Ban, Velg)</option>
                <option value="ENGINE">ENGINE (Mesin, Transmisi)</option>
                <option value="INTERIOR">INTERIOR (Jok, Dashboard)</option>
                <option value="ELECTRICAL">ELECTRICAL (Audio, Tombol)</option>
                <option value="AC">AC (Sistem Pendingin)</option>
                <option value="SAFETY">SAFETY (APAR, Sabuk Pengaman)</option>
                <option value="OTHER">OTHER (Kunci, Toolkit)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Tingkat Keparahan (Severity)
              </label>
              <select
                value={damageSeverity}
                onChange={(e) => setDamageSeverity(e.target.value as any)}
                className="w-full h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
              >
                <option value="MINOR">MINOR (Baret ringan, lecet)</option>
                <option value="MAJOR">MAJOR (Penyok, retak besar)</option>
                <option value="CRITICAL">
                  CRITICAL (Membahayakan operasional)
                </option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Estimasi Biaya Perbaikan (Rp)
              </label>
              <Input
                type="number"
                value={damageCost}
                onChange={(e) => setDamageCost(Number(e.target.value))}
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-700 block mb-1">
                Deskripsi Kerusakan
              </label>
              <Input
                placeholder="Contoh: Baret pada sudut bemper belakang kanan..."
                value={damageDesc}
                onChange={(e) => setDamageDesc(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDamageModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!damageDesc}
              onClick={handleAddDamage}
              className="text-xs font-semibold"
            >
              Simpan Kerusakan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
