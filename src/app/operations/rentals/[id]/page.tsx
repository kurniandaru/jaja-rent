"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { RentalRecord } from "@/lib/types/rental";
import { getRentalById, returnRental } from "@/lib/data/rentals";
import {
  RentalChargeItem,
  RentalPaymentRecord,
  RentalDepositRecord,
  ReturnInspectionComparison,
} from "@/lib/types/business-core";
import {
  calculateTotalCharges,
  calculateSettlementSummary,
  activateRentalAction,
  completeRentalAction,
  evaluateRentalActivationEligibility,
} from "@/lib/services/rental-service";
import {
  seedRentalCharges,
  seedRentalPayments,
  seedRentalDeposit,
  seedActiveContract,
} from "@/lib/mock-data/phase1-seed";
import { ActionBlockerBanner } from "@/components/common/action-blocker-banner";
import { ActivityTimelineCard } from "@/components/common/activity-timeline-card";
import { RentalTelematicsCard } from "@/components/telematics/rental-telematics-card";
import { formatRupiah, formatNumber } from "@/lib/utils";
import {
  Car,
  ArrowLeft,
  Calendar,
  FileCheck2,
  FileText,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  Fuel,
  ExternalLink,
  Plus,
  Banknote,
  DollarSign,
  ShieldAlert,
} from "lucide-react";

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [rental, setRental] = React.useState<RentalRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<
    | "overview"
    | "vehicle"
    | "charges"
    | "payment"
    | "inspection"
    | "settlement"
    | "timeline"
  >("overview");

  // Charges state
  const [charges, setCharges] =
    React.useState<RentalChargeItem[]>(seedRentalCharges);
  const [newChargeDesc, setNewChargeDesc] = React.useState("");
  const [newChargeAmount, setNewChargeAmount] = React.useState("");
  const [newChargeType, setNewChargeType] = React.useState<any>("EXTRA_TIME");

  // Payments & Deposit state
  const [payments, setPayments] =
    React.useState<RentalPaymentRecord[]>(seedRentalPayments);
  const [deposit, setDeposit] =
    React.useState<RentalDepositRecord>(seedRentalDeposit);

  // Return Inspection comparison state
  const [inspectionComparison, setInspectionComparison] =
    React.useState<ReturnInspectionComparison>({
      inspectionId: "INS-RET-001",
      returnOdometer: 42800,
      startingOdometer: 42100,
      distanceDrivenKm: 700,
      returnFuelPercent: 90,
      startingFuelPercent: 100,
      newDamageFound: true,
      damageDescriptions: ["Goresan ringan pada bumper belakang sisi kiri"],
      recommendedDamageFee: 250000,
      actualReturnTime: "2026-09-05T20:00:00Z",
      scheduledReturnTime: "2026-09-05T18:00:00Z",
      isOverdue: true,
      overdueHours: 2,
      recommendedOvertimeFee: 100000,
    });

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 text-xs gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span>Memuat data rental...</span>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-neutral-800">
          Rental tidak ditemukan
        </p>
        <Link href="/operations/rentals">
          <Button variant="outline" size="sm" className="text-xs">
            Kembali ke Daftar Rental
          </Button>
        </Link>
      </div>
    );
  }

  const totalChargesAmount = calculateTotalCharges(charges);
  const settlement = calculateSettlementSummary(
    rental,
    charges,
    payments,
    deposit,
    inspectionComparison,
  );
  const activationBlocker = evaluateRentalActivationEligibility(
    rental,
    seedActiveContract,
    deposit,
  );

  const handleAddCharge = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseInt(newChargeAmount);
    if (!newChargeDesc || !amountNum) return;

    const newItem: RentalChargeItem = {
      id: `CHG-${Date.now().toString().slice(-4)}`,
      rentalId: rental.id,
      chargeType: newChargeType,
      description: newChargeDesc,
      quantity: 1,
      unitPrice: amountNum,
      amount: amountNum,
      createdAt: new Date().toISOString(),
    };

    setCharges([...charges, newItem]);
    setNewChargeDesc("");
    setNewChargeAmount("");
  };

  const handleActivateRental = async () => {
    const res = await activateRentalAction(
      rental,
      seedActiveContract,
      "Ops Lead",
    );
    if (res.success && res.rental) {
      setRental({ ...res.rental });
    }
  };

  const handleCompleteSettlement = async () => {
    const res = await completeRentalAction(
      rental,
      seedActiveContract,
      settlement,
      deposit,
      "Finance Officer",
    );
    if (res.success && res.rental) {
      setRental({ ...res.rental });
      setActiveTab("settlement");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/operations/rentals"
              className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Daftar Rental
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-mono font-bold text-neutral-900">
              {rental.id}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              {rental.customerName}
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
              {rental.vehiclePlate}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                rental.status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : rental.status === "COMPLETED"
                    ? "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
              }`}
            >
              {rental.status}
            </span>
          </div>
        </div>

        {/* Lifecycle Action Buttons */}
        <div className="flex items-center gap-2">
          {rental.status !== "ACTIVE" && rental.status !== "COMPLETED" && (
            <Button
              size="sm"
              disabled={!activationBlocker.canPerform}
              onClick={handleActivateRental}
              className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
              Aktivasi Rental (Start)
            </Button>
          )}

          {rental.status === "ACTIVE" && (
            <Button
              size="sm"
              onClick={handleCompleteSettlement}
              className="text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Proses Settlement & Selesaikan
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation (7 Tabs) */}
      <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 max-w-4xl text-xs font-semibold overflow-x-auto">
        {[
          { id: "overview", label: "1. Overview", icon: FileText },
          { id: "vehicle", label: "2. Unit Kendaraan", icon: Car },
          {
            id: "charges",
            label: `3. Rincian Biaya (${charges.length})`,
            icon: DollarSign,
          },
          { id: "payment", label: "4. Pembayaran & Deposit", icon: Banknote },
          {
            id: "inspection",
            label: "5. Hasil Inspeksi Return",
            icon: ClipboardCheck,
          },
          {
            id: "settlement",
            label: "6. Settlement Akhir",
            icon: CheckCircle2,
          },
          { id: "timeline", label: "7. Audit Timeline", icon: Clock },
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
                  Jadwal & Lokasi Operasional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-neutral-500 block">
                      Tanggal Mulai:
                    </span>
                    <strong className="text-neutral-900 font-mono text-sm block">
                      {rental.startDate}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">
                      Tanggal Selesai:
                    </span>
                    <strong className="text-neutral-900 font-mono text-sm block">
                      {rental.endDate}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
                  <div>
                    <span className="text-neutral-500 block">
                      Lokasi Serah Terima:
                    </span>
                    <strong className="text-neutral-900 block">
                      {rental.pickupLocation}
                    </strong>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">
                      Lokasi Pengembalian:
                    </span>
                    <strong className="text-neutral-900 block">
                      {rental.dropoffLocation}
                    </strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Explanatory Activation Blocker Banner */}
            <ActionBlockerBanner
              blocker={activationBlocker}
              actionTitle="Aktivasi Rental Berjalan"
            />
          </div>

          <div className="space-y-6">
            <Card className="border-neutral-200 shadow-xs">
              <CardHeader className="p-4 border-b border-neutral-100">
                <CardTitle className="text-sm font-bold text-neutral-900">
                  Ringkasan Finansial
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Total Tagihan Biaya:</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {formatRupiah(totalChargesAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Total Terbayar:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {formatRupiah(settlement.totalPaidPayments)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Uang Jaminan (Deposit):</span>
                  <span className="font-mono text-amber-700 font-bold">
                    {formatRupiah(deposit.amount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: VEHICLE */}
      {activeTab === "vehicle" && (
        <div className="space-y-4 max-w-2xl">
          <Card className="border-neutral-200 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100">
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Car className="h-4 w-4 text-primary" />
                Unit Armada Terpasang
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-neutral-500 block">Nomor Polisi:</span>
                  <strong className="text-neutral-900 font-mono text-sm block">
                    {rental.vehiclePlate}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-500 block">
                    Model Kendaraan:
                  </span>
                  <strong className="text-neutral-900 block">
                    {rental.vehicleModel}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-end">
                <Link
                  href={`/fleet/${rental.vehiclePlate.replace(/\s+/g, "-")}`}
                >
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    Lihat Profil Armada Lengkap
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Phase 4: Rental Live Telematics & Tracking */}
          <RentalTelematicsCard rental={rental} />
        </div>
      )}

      {/* TAB 3: CHARGES BREAKDOWN */}
      {activeTab === "charges" && (
        <div className="space-y-4 max-w-3xl">
          <Card className="border-neutral-200 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Struktur Rincian Biaya Rental (Rental Charges)
                </CardTitle>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Total dihitung secara deterministik dari itemisasi komponen
                  biaya.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  Total Tagihan
                </span>
                <span className="text-base font-mono font-bold text-neutral-900">
                  {formatRupiah(totalChargesAmount)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-neutral-50/80">
                  <TableRow className="text-xs">
                    <TableHead className="w-12 font-bold text-center">
                      No
                    </TableHead>
                    <TableHead className="font-bold">Komponen Biaya</TableHead>
                    <TableHead className="font-bold">Deskripsi</TableHead>
                    <TableHead className="text-center font-bold">Qty</TableHead>
                    <TableHead className="text-right font-bold">
                      Harga Satuan
                    </TableHead>
                    <TableHead className="text-right font-bold">
                      Subtotal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {charges.map((item, idx) => (
                    <TableRow
                      key={item.id}
                      className="text-xs hover:bg-neutral-50/60"
                    >
                      <TableCell className="text-center font-mono font-bold text-neutral-500">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200">
                          {item.chargeType}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-neutral-900">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRupiah(item.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-neutral-900">
                        {formatRupiah(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-neutral-50/80 font-bold text-xs">
                    <TableCell colSpan={5} className="text-right">
                      TOTAL BIAYA RENTAL (CALCULATED):
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-primary">
                      {formatRupiah(totalChargesAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add Charge Form */}
          <Card className="border-neutral-200 shadow-xs">
            <CardHeader className="p-3.5 border-b border-neutral-100">
              <CardTitle className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                <Plus className="h-3.5 w-3.5" />
                Tambah Komponen Biaya Tambahan (Adjustment / Overtime /
                Kerusakan)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5">
              <form
                onSubmit={handleAddCharge}
                className="flex flex-col sm:flex-row items-end gap-2 text-xs"
              >
                <div className="w-full sm:w-40">
                  <label className="text-[10px] font-bold text-neutral-600 block mb-1">
                    Tipe Biaya
                  </label>
                  <select
                    value={newChargeType}
                    onChange={(e) => setNewChargeType(e.target.value)}
                    className="w-full h-8 rounded border border-neutral-200 px-2 bg-white text-xs"
                  >
                    <option value="EXTRA_TIME">EXTRA_TIME (Overtime)</option>
                    <option value="DAMAGE">DAMAGE (Ganti Rugi)</option>
                    <option value="FUEL">FUEL (Bahan Bakar)</option>
                    <option value="DRIVER">DRIVER (Layanan Supir)</option>
                    <option value="DISCOUNT">DISCOUNT (Potongan)</option>
                  </select>
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-neutral-600 block mb-1">
                    Deskripsi
                  </label>
                  <Input
                    value={newChargeDesc}
                    onChange={(e) => setNewChargeDesc(e.target.value)}
                    placeholder="Misal: Denda overtime 2 jam..."
                    className="h-8 text-xs"
                  />
                </div>
                <div className="w-full sm:w-36">
                  <label className="text-[10px] font-bold text-neutral-600 block mb-1">
                    Nominal (Rp)
                  </label>
                  <Input
                    type="number"
                    value={newChargeAmount}
                    onChange={(e) => setNewChargeAmount(e.target.value)}
                    placeholder="100000"
                    className="h-8 text-xs font-mono font-bold"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 text-xs font-bold bg-neutral-900 text-white"
                >
                  + Simpan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: PAYMENT & DEPOSIT */}
      {activeTab === "payment" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Payments */}
          <Card className="border-neutral-200 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                Catatan Pembayaran (Payments)
              </CardTitle>
              <span className="text-xs font-mono font-bold text-emerald-700">
                {formatRupiah(settlement.totalPaidPayments)} Terbayar
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <strong className="font-mono text-neutral-900">
                      {p.paymentNumber}
                    </strong>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {p.paymentStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Metode: {p.paymentMethod}</span>
                    <span className="font-mono font-bold text-neutral-900">
                      {formatRupiah(p.amount)}
                    </span>
                  </div>
                  {p.reference && (
                    <span className="text-[10px] text-neutral-400 font-mono block">
                      Ref: {p.reference}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deposit Foundation */}
          <Card className="border-neutral-200 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Uang Jaminan (Security Deposit)
              </CardTitle>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                STATUS: {deposit.status}
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                <div className="flex justify-between text-neutral-700">
                  <span>Nominal Deposit Diterima:</span>
                  <span className="font-mono font-bold text-neutral-900">
                    {formatRupiah(deposit.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-700">
                  <span>Potongan Klaim Kerusakan / Denda:</span>
                  <span className="font-mono font-bold text-rose-600">
                    - {formatRupiah(settlement.depositDeducted)}
                  </span>
                </div>
                <div className="pt-2 border-t border-amber-200 flex justify-between font-bold text-sm text-neutral-900">
                  <span>Deposit Dikembalikan (Refund):</span>
                  <span className="font-mono text-emerald-700">
                    {formatRupiah(settlement.depositReturned)}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500">
                Deposit disimpan sebagai jaminan dan akan otomatis
                direkonsiliasi pada saat penyelesaian akhir (settlement).
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: INSPECTION COMPARISON */}
      {activeTab === "inspection" && (
        <Card className="border-neutral-200 shadow-xs max-w-3xl">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" />
              Perbandingan Kondisi Inspeksi (Check-in vs Check-out)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                <span className="text-neutral-400 font-bold block mb-1">
                  ODOMETER KENDARAAN
                </span>
                <div className="flex justify-between">
                  <span>Mulai Sewa:</span>
                  <span className="font-mono font-bold">
                    {formatNumber(inspectionComparison.startingOdometer)} KM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Saat Kembali:</span>
                  <span className="font-mono font-bold">
                    {formatNumber(inspectionComparison.returnOdometer)} KM
                  </span>
                </div>
                <div className="pt-1 border-t border-neutral-200 flex justify-between text-neutral-600">
                  <span>Jarak Ditempuh:</span>
                  <span className="font-mono font-bold text-primary">
                    +{formatNumber(inspectionComparison.distanceDrivenKm)} KM
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                <span className="text-neutral-400 font-bold block mb-1">
                  LEVEL BAHAN BAKAR (BBM)
                </span>
                <div className="flex justify-between">
                  <span>Mulai:</span>
                  <span className="font-mono font-bold">
                    {inspectionComparison.startingFuelPercent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Kembali:</span>
                  <span className="font-mono font-bold">
                    {inspectionComparison.returnFuelPercent}%
                  </span>
                </div>
                <div className="pt-1 border-t border-neutral-200 flex justify-between text-neutral-600">
                  <span>Selisih BBM:</span>
                  <span className="font-mono font-bold text-amber-700">
                    -
                    {inspectionComparison.startingFuelPercent -
                      inspectionComparison.returnFuelPercent}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Damage findings */}
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 space-y-1.5">
              <span className="font-bold text-rose-900 block flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Temuan Kerusakan Baru Saat Pengembalian (Damage Audit):
              </span>
              <ul className="list-disc list-inside text-rose-800 text-[11px] space-y-1">
                {inspectionComparison.damageDescriptions?.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
              <div className="pt-1.5 border-t border-rose-200 flex justify-between items-center text-xs">
                <span className="text-rose-900 font-semibold">
                  Estimasi Biaya Ganti Rugi:
                </span>
                <span className="font-mono font-bold text-rose-700">
                  {formatRupiah(inspectionComparison.recommendedDamageFee)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 6: FINAL SETTLEMENT */}
      {activeTab === "settlement" && (
        <Card className="border-neutral-200 shadow-xs max-w-2xl">
          <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Rekapitulasi Pelunasan & Penyelesaian (Final Settlement)
            </CardTitle>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              STATUS: {settlement.status}
            </span>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between text-neutral-600">
                <span>Biaya Sewa Pokok:</span>
                <span className="font-mono">
                  {formatRupiah(settlement.baseRentalCharges)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Biaya Proteksi Asuransi:</span>
                <span className="font-mono">
                  {formatRupiah(settlement.insuranceCharges)}
                </span>
              </div>
              <div className="flex justify-between text-rose-700 font-semibold">
                <span>Denda Keterlambatan (Overtime):</span>
                <span className="font-mono">
                  +{formatRupiah(settlement.overtimeCharges)}
                </span>
              </div>
              <div className="flex justify-between text-rose-700 font-semibold">
                <span>Klaim Kerusakan (Damage Fee):</span>
                <span className="font-mono">
                  +{formatRupiah(settlement.damageCharges)}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-900">
                <span>Total Tagihan Akhir:</span>
                <span className="font-mono text-primary">
                  {formatRupiah(settlement.totalFinalCharges)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Total Pembayaran Diterima:</span>
                <span className="font-mono font-bold">
                  {formatRupiah(settlement.totalPaidPayments)}
                </span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Deposit Dipotong untuk Denda/Kerusakan:</span>
                <span className="font-mono font-bold">
                  -{formatRupiah(settlement.depositDeducted)}
                </span>
              </div>
              <div className="pt-2 border-t border-neutral-300 flex justify-between font-extrabold text-sm text-neutral-900">
                <span>Sisa Deposit Dikembalikan ke Customer:</span>
                <span className="font-mono text-emerald-600">
                  {formatRupiah(settlement.depositReturned)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              {rental.status !== "COMPLETED" && (
                <Button
                  size="sm"
                  onClick={handleCompleteSettlement}
                  className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1 text-emerald-400" />
                  Selesaikan Rental & Terbitkan Settlement (Complete)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: TIMELINE */}
      {activeTab === "timeline" && (
        <div className="max-w-2xl">
          <ActivityTimelineCard
            entityType="RENTAL"
            entityId={rental.id}
            title="Riwayat Audit & Lifecycle Rental"
            fallbackEvents={[
              {
                id: "EV-1",
                action: "RENTAL_ACTIVATED",
                actorName: "Operations Fleet Dispatcher",
                notes: "Kendaraan diserahkan dan rental resmi berjalan.",
                createdAt: rental.createdAt,
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
