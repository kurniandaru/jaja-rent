"use client";

import * as React from "react";
import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  Building2,
  Car,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Wrench,
  ShieldAlert,
  MapPin,
  Gauge,
  Plus,
} from "lucide-react";
import { mockContracts, mockVehicles, getCorporateContractById, assignReplacementUnit } from "@/lib/data";
import { formatRupiah, formatDate, formatNumber } from "@/lib/utils";

function ContractDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const contractId = (params.id as string) || "CTR-2026-001";
  const actionParam = searchParams.get("action");

  // Initial contract state
  const baseContract =
    mockContracts.find((c) => c.id === contractId || c.contractNumber === contractId) ||
    mockContracts[0];

  const [contract, setContract] = React.useState(baseContract);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = React.useState(
    actionParam === "replacement"
  );
  const [selectedReplacementUnit, setSelectedReplacementUnit] = React.useState<string | null>(null);
  const [isSuccessToast, setIsSuccessToast] = React.useState(false);

  // Filter available candidate replacement units (Must be eligible for B2B)
  const availableCandidates = mockVehicles.filter(
    (v) => v.status === "AVAILABLE" && (v.businessEligibility === "B2B" || v.businessEligibility === "BOTH")
  );

  const handleAssignReplacement = () => {
    if (!selectedReplacementUnit) return;
    const replacementVehicle = mockVehicles.find((v) => v.id === selectedReplacementUnit);
    if (!replacementVehicle) return;

    // Reactively update contract allocations
    const newAllocation = {
      vehicleId: replacementVehicle.id,
      plateNumber: replacementVehicle.plateNumber,
      model: `${replacementVehicle.brand} ${replacementVehicle.model}`,
      ownership: replacementVehicle.ownership,
      assignedDriver: "Ahmad Riyadi (Transferred from B 8899 KLU)",
      status: "REPLACEMENT" as const,
      location: replacementVehicle.locationArea,
      odometer: replacementVehicle.odometer,
    };

    setContract((prev) => ({
      ...prev,
      operationalFleet: prev.operationalFleet + 1,
      replacementFleet: prev.replacementFleet + 1,
      shortageCount: Math.max(0, prev.shortageCount - 1),
      allocatedVehicles: [newAllocation, ...prev.allocatedVehicles],
    }));

    setIsReplacementModalOpen(false);
    setIsSuccessToast(true);
    setTimeout(() => setIsSuccessToast(false), 6000);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/corporate/contracts"
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Corporate Contracts
        </Link>
        <span className="text-xs font-mono text-neutral-400">
          Contract Ref: {contract.contractNumber}
        </span>
      </div>

      {/* Success Notification Toast */}
      {isSuccessToast && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold">Replacement Unit Successfully Deployed!</div>
              <div className="text-[11px] text-emerald-700">
                Fleet shortage has been resolved. Contract operational fulfillment restored to 100%.
              </div>
            </div>
          </div>
          <Button size="xs" variant="outline" onClick={() => setIsSuccessToast(false)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Contract Hero Header */}
      <div className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2 rounded-md bg-purple-50 text-purple-700">
                <Building2 className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {contract.corporateCustomerName}
              </h1>
              <StatusBadge status={contract.status} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
              <span className="font-mono font-bold text-neutral-900">
                {contract.contractNumber}
              </span>
              <span className="text-neutral-300">•</span>
              <span>Period: {formatDate(contract.startDate)} — {formatDate(contract.endDate)}</span>
              <span className="text-neutral-300">•</span>
              <span>Billing: <strong className="text-neutral-900 font-mono">{formatRupiah(contract.monthlyBillingAmount)} / month</strong></span>
              <span className="text-neutral-300">•</span>
              <span>Terms: {contract.paymentTerm}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {contract.shortageCount > 0 ? (
              <Button
                onClick={() => setIsReplacementModalOpen(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 text-xs font-medium shadow-xs"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Find Replacement Unit ({contract.shortageCount})
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReplacementModalOpen(true)}
                className="gap-1.5 text-xs font-medium"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Extra Fleet
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fleet Requirement KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-lg border border-neutral-200 bg-white shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 block">
            Required Fleet
          </span>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
            {contract.requiredFleet}
          </div>
          <span className="text-[10px] text-neutral-400">Contract Quota</span>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 bg-white shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 block">
            Allocated
          </span>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
            {contract.allocatedFleet}
          </div>
          <span className="text-[10px] text-neutral-400">Assigned units</span>
        </div>

        <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50 shadow-xs">
          <span className="text-[11px] uppercase font-bold text-emerald-800 block">
            Operational
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
            {contract.operationalFleet}
          </div>
          <span className="text-[10px] text-emerald-700 font-medium">On the road</span>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 bg-white shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 block">
            Maintenance
          </span>
          <div className={`text-2xl font-bold mt-1 font-mono ${contract.maintenanceFleet > 0 ? "text-rose-600" : "text-neutral-900"}`}>
            {contract.maintenanceFleet}
          </div>
          <span className="text-[10px] text-neutral-400">In workshop</span>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 bg-white shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 block">
            Replacement
          </span>
          <div className="text-2xl font-bold text-blue-600 mt-1 font-mono">
            {contract.replacementFleet}
          </div>
          <span className="text-[10px] text-neutral-400">Temporary standby</span>
        </div>
      </div>

      {/* Corporate Shortage Alert Banner (If vehicle is in maintenance) */}
      {contract.shortageCount > 0 && (
        <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-rose-100 text-rose-700 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-rose-900">
                  Fleet Shortage Detected ({contract.shortageCount} Vehicle)
                </h4>
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-rose-700 mt-0.5">
                Unit <strong>B 8899 KLU</strong> is currently undergoing brake overhaul at AutoCare Pulogadung. SLA requires immediate replacement unit dispatch.
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsReplacementModalOpen(true)}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shrink-0"
          >
            <Car className="h-3.5 w-3.5" />
            Find Replacement
          </Button>
        </div>
      )}

      {/* Allocated Vehicles Table */}
      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-semibold">
              Allocated Vehicles ({contract.allocatedVehicles.length})
            </CardTitle>
            <p className="text-xs text-neutral-500">
              Specific vehicle roster deployed to {contract.corporateCustomerName}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Driver Assigned</TableHead>
                <TableHead>Operational Status</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contract.allocatedVehicles.map((veh, idx) => {
                const isUnderMaintenance = veh.status === "MAINTENANCE";
                const isReplacement = veh.status === "REPLACEMENT";

                return (
                  <TableRow
                    key={veh.vehicleId}
                    className={
                      isUnderMaintenance
                        ? "bg-rose-50/50 hover:bg-rose-50"
                        : isReplacement
                        ? "bg-blue-50/40 hover:bg-blue-50/70"
                        : "hover:bg-neutral-50"
                    }
                  >
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-900">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{veh.plateNumber}</span>
                        <span className="text-[11px] text-neutral-500">{veh.model}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <OwnershipBadge ownership={veh.ownership} />
                    </TableCell>

                    <TableCell className="text-neutral-800 text-xs">
                      {veh.assignedDriver || "Designated Driver"}
                    </TableCell>

                    <TableCell>
                      {isUnderMaintenance ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <Wrench className="h-3 w-3 text-rose-600" />
                          MAINTENANCE
                        </span>
                      ) : isReplacement ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          <Car className="h-3 w-3 text-blue-600" />
                          REPLACEMENT UNIT
                        </span>
                      ) : (
                        <StatusBadge status="AVAILABLE" />
                      )}
                    </TableCell>

                    <TableCell className="text-neutral-600 text-xs">
                      {veh.location}
                    </TableCell>

                    <TableCell className="font-mono text-neutral-800 text-xs">
                      {formatNumber(veh.odometer)} KM
                    </TableCell>

                    <TableCell>
                      <Link href={`/fleet/${veh.vehicleId}`}>
                        <Button variant="outline" size="xs">
                          Inspect
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Replacement Unit Workflow Dialog */}
      <Dialog open={isReplacementModalOpen} onOpenChange={setIsReplacementModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              <DialogTitle>Find & Assign Replacement Unit</DialogTitle>
            </div>
            <DialogDescription>
              Select an available candidate from the pool to cover the contract shortage for {contract.corporateCustomerName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/70">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block">
                Policy & Business Rules
              </span>
              <p className="text-neutral-600 mt-0.5">
                Eligible units include <strong>Jaja-owned</strong> or <strong>Vendor-owned (B2B approved)</strong> vehicles currently marked as AVAILABLE in pool.
              </p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {availableCandidates.map((candidate) => {
                const isSelected = selectedReplacementUnit === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => setSelectedReplacementUnit(candidate.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-neutral-900 bg-neutral-100/90 ring-1 ring-neutral-900"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-neutral-900">{candidate.plateNumber}</span>
                        <OwnershipBadge ownership={candidate.ownership} />
                        <span className="text-[10px] text-neutral-500">{candidate.transmission} &middot; {candidate.fuelType}</span>
                      </div>
                      <div className="text-neutral-700 font-medium text-xs">
                        {candidate.brand} {candidate.model} ({candidate.year})
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {candidate.locationArea}</span>
                        <span className="flex items-center gap-1 font-mono"><Gauge className="h-3 w-3" /> {formatNumber(candidate.odometer)} KM</span>
                      </div>
                    </div>

                    <Button
                      size="xs"
                      variant={isSelected ? "default" : "outline"}
                      className="shrink-0"
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReplacementModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!selectedReplacementUnit}
              onClick={handleAssignReplacement}
              className="bg-neutral-900 text-white gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm & Assign Replacement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ContractDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-neutral-400">Loading Contract Details...</div>}>
      <ContractDetailContent />
    </Suspense>
  );
}
