"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { CreateRentalModal } from "@/components/rentals/create-rental-modal";
import {
  CorporateContract,
  ContractVehicleAllocation,
} from "@/lib/types/corporate";
import {
  getCorporateContractById,
  allocateVehicleToContract,
} from "@/lib/data/contracts";
import { mockVehicles } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  FileText,
  ArrowLeft,
  Building2,
  Car,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [contract, setContract] = React.useState<CorporateContract | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);
  const [isRentalModalOpen, setIsRentalModalOpen] = React.useState(false);
  const [selectedAllocation, setSelectedAllocation] =
    React.useState<ContractVehicleAllocation | null>(null);

  const loadData = React.useCallback(async () => {
    if (id) {
      const data = await getCorporateContractById(id);
      setContract(data);
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
        <span>Memuat data kontrak...</span>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">
          Kontrak Tidak Ditemukan
        </h2>
        <Link href="/operations/contracts">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Kontrak
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div className="flex items-center gap-3">
          <Link href="/operations/contracts">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4 text-neutral-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                {contract.contractNumber}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                B2B Corporate Contract
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  contract.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {contract.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
              Kontrak: {contract.corporateCustomerName}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contract.reservationId && (
            <Link href={`/operations/reservations/${contract.reservationId}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold gap-1.5 border-neutral-300"
              >
                <FileText className="h-3.5 w-3.5 text-primary" />
                Lihat Reservasi Asal ({contract.reservationId})
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            onClick={() => {
              setSelectedAllocation(null);
              setIsRentalModalOpen(true);
            }}
            className="text-xs font-bold gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs"
          >
            <Car className="h-4 w-4" />+ Terbitkan Rental Operasional
          </Button>
        </div>
      </div>

      {/* Contract Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-primary" />
              Corporate Client
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="font-bold text-sm text-neutral-900">
              {contract.corporateCustomerName}
            </div>
            <div className="text-neutral-500">
              ID:{" "}
              <span className="font-mono">{contract.corporateCustomerId}</span>
            </div>
            <div className="text-neutral-600">
              Payment Term: <strong>{contract.paymentTerm}</strong>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary" />
              Financial & Billing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="text-neutral-500">Nilai Tagihan Bulanan:</div>
            <div className="font-mono font-bold text-lg text-neutral-900">
              {formatCurrency(contract.monthlyBillingAmount)}
            </div>
            <div className="text-neutral-600 font-mono text-[11px]">
              {contract.startDate} s/d {contract.endDate}
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              Status Alokasi Armada
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Kebutuhan Unit:</span>
              <strong className="font-mono text-sm">
                {contract.requiredFleet} Unit
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">Unit Terpasang:</span>
              <span className="font-mono text-emerald-700 font-bold">
                {contract.allocatedFleet} Unit
              </span>
            </div>
            {contract.shortageCount > 0 ? (
              <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-1 text-[11px]">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Shortage: Kurang {contract.shortageCount} unit!
              </div>
            ) : (
              <div className="p-1.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Alokasi armada 100% terpenuhi
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Allocation Table */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-900">
              Daftar Alokasi Kendaraan Kontrak (
              {contract.allocatedVehicles?.length || 0} Unit)
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Unit milik Jaja maupun Vendor yang ditugaskan secara aktif pada
              kontrak B2B ini.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50/80 text-neutral-600">
              <TableRow className="border-b border-neutral-200/80 hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  No. Polisi & Model
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Ownership
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Driver Ditugaskan
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Lokasi Operasional
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                  Odometer
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!contract.allocatedVehicles ||
              contract.allocatedVehicles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-28 text-center text-neutral-500 text-xs"
                  >
                    Belum ada kendaraan yang dialokasikan ke kontrak ini.
                  </TableCell>
                </TableRow>
              ) : (
                contract.allocatedVehicles.map((v, idx) => (
                  <TableRow
                    key={v.vehicleId || idx}
                    className="border-b border-neutral-100 hover:bg-neutral-50/70 text-xs"
                  >
                    <TableCell className="text-center font-medium text-neutral-500">
                      {idx + 1}
                    </TableCell>
                    <TableCell>
                      <div className="font-mono font-bold text-neutral-900">
                        {v.plateNumber}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {v.model}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.ownership === "JAJA_OWNED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {v.ownership === "JAJA_OWNED"
                          ? "Jaja Owned"
                          : "Vendor Owned"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-neutral-800">
                      {v.assignedDriver || "Driver Mitra"}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {v.location}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatNumber(v.odometer)} KM
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          v.status === "OPERATIONAL"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : v.status === "MAINTENANCE"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {v.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAllocation(v);
                          setIsRentalModalOpen(true);
                        }}
                        className="h-7 text-[11px] font-semibold gap-1"
                      >
                        <Car className="h-3 w-3" />
                        Terbitkan Rental
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateRentalModal
        open={isRentalModalOpen}
        onOpenChange={setIsRentalModalOpen}
        contractId={contract.contractNumber}
        corporateCustomerName={contract.corporateCustomerName}
      />
    </div>
  );
}
