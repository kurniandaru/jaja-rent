"use client";

import * as React from "react";
import { useParams } from "next/navigation";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { OwnershipBadge } from "@/components/ui/priority-badge";
import { Progress } from "@/components/ui/progress";
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
  mockVehicles,
  mockRentals,
  mockInspections,
  mockMaintenance,
  mockDocuments,
  mockVehicleHistories,
  getVehicleById,
} from "@/lib/data";
import { formatRupiah, formatNumber, formatDate } from "@/lib/utils";

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = (params.id as string) || "B-1234-XYZ";

  const [activeTab, setActiveTab] = React.useState<
    "overview" | "rental" | "gps" | "inspection" | "maintenance" | "documents" | "history"
  >("overview");

  const [isInspectionModalOpen, setIsInspectionModalOpen] = React.useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = React.useState(false);

  // Lookup vehicle
  const vehicle =
    mockVehicles.find(
      (v) => v.id.toLowerCase() === vehicleId.toLowerCase() || v.plateNumber.replace(/\s+/g, "-").toLowerCase() === vehicleId.toLowerCase()
    ) || mockVehicles[0];

  // Lookup related operational data
  const vehicleRentals = mockRentals.filter((r) => r.vehicleId === vehicle.id || r.vehiclePlate === vehicle.plateNumber);
  const vehicleInspections = mockInspections.filter((i) => i.vehicleId === vehicle.id || i.plateNumber === vehicle.plateNumber);
  const vehicleMaintenance = mockMaintenance.filter((m) => m.vehicleId === vehicle.id || m.plateNumber === vehicle.plateNumber);
  const vehicleDocs = mockDocuments.filter((d) => d.vehicleId === vehicle.id || d.plateNumber === vehicle.plateNumber);
  const vehicleHistoryEvents = mockVehicleHistories[vehicle.id] || mockVehicleHistories["B-1234-XYZ"] || [];

  // Maintenance distance calculations
  const nextServiceOdo = vehicle.nextServiceOdometer || vehicle.odometer + 3000;
  const lastServiceOdo = vehicleMaintenance[0]?.odometer || vehicle.odometer - 2421;
  const totalServiceInterval = nextServiceOdo - lastServiceOdo;
  const currentIntervalProgress = Math.max(0, vehicle.odometer - lastServiceOdo);
  const progressPercent = Math.min(100, Math.round((currentIntervalProgress / totalServiceInterval) * 100)) || 75;
  const kmRemaining = Math.max(0, nextServiceOdo - vehicle.odometer);

  return (
    <div className="space-y-6 pb-16">
      {/* Back button & quick navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/fleet"
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Fleet Registry
        </Link>
        <span className="text-xs font-mono text-neutral-400">
          ID: {vehicle.id} &middot; VIN: {vehicle.vin}
        </span>
      </div>

      {/* Vehicle Hero Header */}
      <div className="rounded-lg border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                {vehicle.plateNumber}
              </h1>
              <OwnershipBadge ownership={vehicle.ownership} />
              <StatusBadge status={vehicle.status} />
              {vehicle.businessEligibility && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-700 uppercase">
                  {vehicle.businessEligibility === "BOTH" ? "B2C & B2B" : vehicle.businessEligibility}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600">
              <span className="font-medium text-neutral-900 text-sm">
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </span>
              <span className="text-neutral-300">•</span>
              <span>{vehicle.color}</span>
              <span className="text-neutral-300">•</span>
              <span>{vehicle.transmission}</span>
              <span className="text-neutral-300">•</span>
              <span>{vehicle.fuelType}</span>
              <span className="text-neutral-300">•</span>
              <span className="font-mono font-medium text-neutral-800">
                {formatNumber(vehicle.odometer)} KM
              </span>
            </div>

            {vehicle.currentCustomerName && (
              <div className="flex items-center gap-2 pt-1 text-xs font-medium text-neutral-700">
                <span className="text-neutral-400 font-semibold uppercase text-[10px]">
                  Active Customer:
                </span>
                <span className="flex items-center gap-1 font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                  {vehicle.currentRentalType === "B2B" ? (
                    <Building2 className="h-3 w-3 text-purple-600" />
                  ) : (
                    <User className="h-3 w-3 text-blue-600" />
                  )}
                  {vehicle.currentCustomerName}
                </span>
                {vehicle.currentDriverName && (
                  <span className="text-neutral-500 text-xs">
                    (Driver: {vehicle.currentDriverName})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInspectionModalOpen(true)}
              className="gap-1.5"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              New Inspection
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMaintenanceModalOpen(true)}
              className="gap-1.5"
            >
              <Wrench className="h-3.5 w-3.5" />
              Book Service
            </Button>
            {vehicle.status === "MAINTENANCE" && vehicle.currentContractId && (
              <Link href={`/corporate/contracts/${vehicle.currentContractId}?action=replacement`}>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Find Replacement
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* 7 Operational Navigation Tabs */}
        <div className="mt-6 flex flex-wrap border-b border-neutral-200 -mb-5 sm:-mb-6 gap-1 text-xs">
          {[
            { id: "overview", label: "Overview", icon: Car },
            { id: "rental", label: "Rental", icon: KeyRound, count: vehicleRentals.length },
            { id: "gps", label: "GPS Telemetry", icon: Navigation },
            { id: "inspection", label: "Inspection", icon: ShieldCheck, count: vehicleInspections.length },
            { id: "maintenance", label: "Maintenance", icon: Wrench, count: vehicleMaintenance.length },
            { id: "documents", label: "Documents", icon: FileCheck2, count: vehicleDocs.length },
            { id: "history", label: "Vehicle History", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "overview" | "rental" | "gps" | "inspection" | "maintenance" | "documents" | "history")}
                className={`flex items-center gap-1.5 px-3 py-2.5 font-medium border-b-2 transition-all ${
                  isActive
                    ? "border-neutral-900 text-neutral-900 font-semibold"
                    : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-neutral-900" : "text-neutral-400"}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"
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

      {/* Tab 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Vehicle Information */}
            <Card className="border-neutral-200">
              <CardHeader className="pb-3 border-b border-neutral-100">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Car className="h-4 w-4 text-neutral-600" />
                  Vehicle Specification
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-neutral-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Police Number</span>
                  <span className="font-bold text-neutral-900">{vehicle.plateNumber}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Brand / Model</span>
                  <span className="font-medium text-neutral-900">{vehicle.brand} {vehicle.model}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Year / Color</span>
                  <span className="font-medium text-neutral-900">{vehicle.year} &middot; {vehicle.color}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Transmission & Fuel</span>
                  <span className="font-medium text-neutral-900">{vehicle.transmission} &middot; {vehicle.fuelType}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Seat Capacity</span>
                  <span className="font-medium text-neutral-900">{vehicle.seatCapacity} Passenger Seats</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">VIN (Chassis No.)</span>
                  <span className="font-mono text-neutral-800">{vehicle.vin}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Engine Number</span>
                  <span className="font-mono text-neutral-800">{vehicle.engineNumber}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Current Odometer</span>
                  <span className="font-mono font-bold text-neutral-900">{formatNumber(vehicle.odometer)} KM</span>
                </div>
              </CardContent>
            </Card>

            {/* Ownership & Business Model Compliance */}
            <Card className="border-neutral-200">
              <CardHeader className="pb-3 border-b border-neutral-100">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-neutral-600" />
                  Ownership & Business Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/70 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500 uppercase text-[11px] font-semibold">Owner Type</span>
                    <OwnershipBadge ownership={vehicle.ownership} />
                  </div>
                  {vehicle.vendorName && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-500">Vendor Partner</span>
                      <span className="font-semibold text-neutral-900">{vehicle.vendorName}</span>
                    </div>
                  )}
                </div>

                {/* Business Model Compliance Rules Box */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase">
                    Commercial Channel Eligibility
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      className={`p-3 rounded-md border flex items-center justify-between ${
                        vehicle.ownership === "JAJA_OWNED"
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                          : "bg-neutral-100/60 border-neutral-200 text-neutral-400"
                      }`}
                    >
                      <div>
                        <div className="font-bold">B2C Rental</div>
                        <div className="text-[10px]">Individual / Daily</div>
                      </div>
                      {vehicle.ownership === "JAJA_OWNED" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-neutral-400" />
                      )}
                    </div>

                    <div className="p-3 rounded-md border bg-emerald-50/50 border-emerald-200 text-emerald-900 flex items-center justify-between">
                      <div>
                        <div className="font-bold">B2B Rent-to-Rent</div>
                        <div className="text-[10px]">Corporate Contracts</div>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </div>
                  </div>
                  {vehicle.ownership === "VENDOR_OWNED" && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      <strong>Policy Notice:</strong> Vendor-owned vehicle is strictly reserved for B2B Corporate contracts and cannot be assigned to B2C individual rentals.
                    </p>
                  )}
                </div>

                {/* Commercial Pricing Reference */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {vehicle.dailyRateB2C && (
                    <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 block uppercase">B2C Daily Rate</span>
                      <span className="font-bold text-neutral-900">{formatRupiah(vehicle.dailyRateB2C)}</span>
                    </div>
                  )}
                  {vehicle.monthlyRateB2B && (
                    <div className="p-2.5 rounded bg-neutral-50 border border-neutral-200">
                      <span className="text-[10px] text-neutral-400 block uppercase">B2B Monthly Rate</span>
                      <span className="font-bold text-neutral-900">{formatRupiah(vehicle.monthlyRateB2B)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Rental & Live GPS status split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Current Rental Details */}
            <Card className="border-neutral-200">
              <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-neutral-600" />
                  Current Rental Deployment
                </CardTitle>
                <StatusBadge status={vehicle.status} />
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                {vehicle.currentCustomerName ? (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Customer Account</span>
                      <span className="font-bold text-neutral-900">{vehicle.currentCustomerName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Rental Type</span>
                      <span className="font-semibold text-neutral-800">{vehicle.currentRentalType}</span>
                    </div>
                    {vehicle.currentContractId && (
                      <div className="flex justify-between py-1.5 border-b border-neutral-100">
                        <span className="text-neutral-500">Contract Reference</span>
                        <Link
                          href={`/corporate/contracts/${vehicle.currentContractId}`}
                          className="font-mono font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                          {vehicle.currentContractId} <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Assigned Driver</span>
                      <span className="font-medium text-neutral-900">{vehicle.currentDriverName || "Self-Drive (No Driver)"}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-neutral-500">Deployment Duration</span>
                      <span className="font-mono text-neutral-800">01 Jan 2026 — 31 Dec 2026 (365 Days)</span>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-neutral-400">
                    Vehicle is currently available in pool without active deployment.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current GPS & Location */}
            <Card className="border-neutral-200">
              <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-neutral-600" />
                  Current Geolocation
                </CardTitle>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {vehicle.gpsStatus}
                </span>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 space-y-1">
                  <div className="text-[10px] uppercase font-semibold text-neutral-400">Registered Zone & Area</div>
                  <div className="font-bold text-sm text-neutral-900">{vehicle.locationCity}</div>
                  <div className="text-neutral-600 text-xs">{vehicle.locationArea}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase block">Speed</span>
                    <span className="font-bold text-neutral-900 font-mono">{vehicle.speed} km/h</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase block">GPS Ping</span>
                    <span className="font-medium text-neutral-800">{vehicle.lastGpsUpdate}</span>
                  </div>
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase block">Coordinates</span>
                    <span className="font-mono text-[11px] text-neutral-700">
                      {vehicle.latitude.toFixed(2)}, {vehicle.longitude.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: RENTAL */}
      {activeTab === "rental" && (
        <div className="space-y-5">
          {/* Active rental highlighted banner */}
          <Card className="border-neutral-200">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-semibold">Active Rental Agreement</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {vehicleRentals.filter((r) => r.status === "ACTIVE").length > 0 ? (
                vehicleRentals
                  .filter((r) => r.status === "ACTIVE")
                  .map((r) => (
                    <div key={r.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Customer</span>
                        <span className="font-bold text-sm text-neutral-900">{r.customerName}</span>
                        <span className="text-neutral-500 block">{r.type} Rental</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Contract Schedule</span>
                        <span className="font-medium text-neutral-900">
                          {formatDate(r.startDate)} — {formatDate(r.endDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Driver Assigned</span>
                        <span className="font-medium text-neutral-900">{r.driverName || "Self Drive"}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Contract Value</span>
                        <span className="font-bold text-neutral-900">{formatRupiah(r.totalAmount)}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-neutral-400 text-xs py-4">No active rental agreement in place.</div>
              )}
            </CardContent>
          </Card>

          {/* Rental History Table */}
          <Card className="border-neutral-200">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-semibold">Rental History & Dispatch Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                      No
                    </TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleRentals.map((r, idx) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-center font-medium text-neutral-500 text-xs">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-neutral-900">{r.customerName}</TableCell>
                      <TableCell>
                        <span className="font-medium text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px]">
                          {r.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-neutral-600">{formatDate(r.startDate)}</TableCell>
                      <TableCell className="font-mono text-neutral-600">{formatDate(r.endDate)}</TableCell>
                      <TableCell className="text-neutral-600">365 days</TableCell>
                      <TableCell className="text-neutral-800">{r.driverName || "-"}</TableCell>
                      <TableCell className="font-mono font-medium text-neutral-900">{formatRupiah(r.totalAmount)}</TableCell>
                      <TableCell><StatusBadge status={r.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: GPS */}
      {activeTab === "gps" && (
        <div className="space-y-5">
          {/* Telemetry Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-white shadow-xs">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Live Speed</span>
              <span className="text-xl font-bold text-neutral-900 font-mono">{vehicle.speed} KM/H</span>
            </div>
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-white shadow-xs">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Odometer</span>
              <span className="text-xl font-bold text-neutral-900 font-mono">{formatNumber(vehicle.odometer)} KM</span>
            </div>
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-white shadow-xs">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">GPS Signal</span>
              <span className="text-xl font-bold text-emerald-600">ONLINE</span>
            </div>
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-white shadow-xs">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Last Update</span>
              <span className="text-sm font-semibold text-neutral-900 mt-1 block">{vehicle.lastGpsUpdate}</span>
            </div>
          </div>

          {/* Interactive Map View with Breadcrumbs */}
          <Card className="border-neutral-200 overflow-hidden">
            <div className="h-72 bg-neutral-900 text-white relative flex flex-col justify-between p-4">
              <div className="absolute inset-0 opacity-25 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              <div className="relative z-10 flex justify-between items-center text-xs">
                <span className="font-mono text-neutral-400">
                  LAT: {vehicle.latitude} &middot; LNG: {vehicle.longitude}
                </span>
                <span className="bg-neutral-800/90 border border-neutral-700 px-2 py-1 rounded text-[11px] font-medium text-white">
                  Zone: {vehicle.locationCity}
                </span>
              </div>

              {/* Marker simulation */}
              <div className="relative flex items-center justify-center my-auto">
                <div className="flex flex-col items-center">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg ring-4 ring-blue-400/30 animate-pulse">
                    <Car className="h-3 w-3" />
                  </span>
                  <div className="mt-2 bg-white text-neutral-900 text-xs font-bold px-2 py-1 rounded shadow-md border border-neutral-200">
                    {vehicle.plateNumber} ({vehicle.speed} km/h)
                  </div>
                </div>
              </div>

              <div className="relative z-10 bg-neutral-950/80 p-2.5 rounded border border-neutral-800 text-xs text-neutral-300 flex justify-between">
                <span>Address: {vehicle.locationArea}, {vehicle.locationCity}</span>
                <span className="text-neutral-400 font-mono">Heading: North-East</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: INSPECTION */}
      {activeTab === "inspection" && (
        <div className="space-y-5">
          {/* Latest Inspection Banner */}
          <Card className="border-neutral-200">
            <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Latest Inspection Report</CardTitle>
                <p className="text-xs text-neutral-500">Conducted on 01 Sep 2026 by Ahmad Subarjo</p>
              </div>
              <StatusBadge status="PASSED" />
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-200/60">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Type</span>
                  <span className="font-bold text-neutral-900">Periodic Inspection</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Inspector</span>
                  <span className="font-medium text-neutral-900">Ahmad Subarjo</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Recorded Odometer</span>
                  <span className="font-mono font-medium text-neutral-900">82,421 KM</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Result</span>
                  <span className="font-bold text-emerald-700">PASSED (All Systems OK)</span>
                </div>
              </div>

              {/* 4 Multi-Point Inspection Checklist Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {/* Exterior */}
                <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-2">
                  <div className="text-xs font-bold text-neutral-900 border-b pb-1">Exterior</div>
                  <ul className="text-xs space-y-1.5 text-neutral-700">
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Body & Paint (No scratch)</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Windshield & Glass</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Tire Tread Depth</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Headlamp & Foglight</li>
                  </ul>
                </div>

                {/* Interior */}
                <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-2">
                  <div className="text-xs font-bold text-neutral-900 border-b pb-1">Interior</div>
                  <ul className="text-xs space-y-1.5 text-neutral-700">
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Seat Leather & Rails</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> AC Cooling Temp</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Dashboard & Screen</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Interior Cleanliness</li>
                  </ul>
                </div>

                {/* Engine */}
                <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-2">
                  <div className="text-xs font-bold text-neutral-900 border-b pb-1">Engine & Powertrain</div>
                  <ul className="text-xs space-y-1.5 text-neutral-700">
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Engine Oil Level</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Radiator Coolant</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> 12V / HV Battery</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Brake Fluid Level</li>
                  </ul>
                </div>

                {/* Safety */}
                <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-2">
                  <div className="text-xs font-bold text-neutral-900 border-b pb-1">Safety & Emergency</div>
                  <ul className="text-xs space-y-1.5 text-neutral-700">
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> All 7 Seatbelts</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Airbag Status OK</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Spare Tire & Jack</li>
                    <li className="flex items-center gap-1.5 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> APAR (Fire Ext.)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: MAINTENANCE */}
      {activeTab === "maintenance" && (
        <div className="space-y-5">
          {/* Service Indicator & Progress */}
          <Card className="border-neutral-200">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-semibold">Service Schedule & Odometer Threshold</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-200/60">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Last Service</span>
                  <span className="font-bold text-neutral-900">10 Aug 2026 (80,000 KM)</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Current Odometer</span>
                  <span className="font-mono font-bold text-neutral-900">{formatNumber(vehicle.odometer)} KM</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Next Service Target</span>
                  <span className="font-mono font-bold text-neutral-900">{formatNumber(nextServiceOdo)} KM</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Distance Remaining</span>
                  <span className="font-mono font-bold text-emerald-700">{formatNumber(kmRemaining)} KM</span>
                </div>
              </div>

              {/* Progress bar towards next service */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-neutral-600">Maintenance Cycle Progress</span>
                  <span className="font-mono text-neutral-900">{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Maintenance History Table */}
          <Card className="border-neutral-200">
            <CardHeader className="pb-3 border-b border-neutral-100">
              <CardTitle className="text-sm font-semibold">Workshop Service History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                      No
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Odometer</TableHead>
                    <TableHead>Workshop</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleMaintenance.map((m, idx) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-center font-medium text-neutral-500 text-xs">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-mono text-neutral-600">{formatDate(m.date)}</TableCell>
                      <TableCell className="font-semibold text-neutral-900">{m.type.replace(/_/g, " ")}</TableCell>
                      <TableCell className="font-mono text-neutral-800">{formatNumber(m.odometer)} KM</TableCell>
                      <TableCell className="text-neutral-800">{m.workshopName}</TableCell>
                      <TableCell className="text-neutral-600 max-w-xs truncate">{m.description}</TableCell>
                      <TableCell className="font-mono font-medium text-neutral-900">{formatRupiah(m.cost)}</TableCell>
                      <TableCell><StatusBadge status={m.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 6: DOCUMENTS */}
      {activeTab === "documents" && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleDocs.map((doc) => (
              <Card key={doc.id} className="border-neutral-200">
                <CardHeader className="pb-2 border-b border-neutral-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-neutral-700" />
                    <CardTitle className="text-sm font-semibold">{doc.documentType}</CardTitle>
                  </div>
                  <StatusBadge status={doc.status} />
                </CardHeader>
                <CardContent className="pt-3 space-y-2.5 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Document Number</span>
                    <span className="font-mono font-medium text-neutral-900">{doc.documentNumber}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-100">
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Issued</span>
                      <span className="text-neutral-800">{formatDate(doc.issuedDate)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Expires</span>
                      <span className="font-medium text-neutral-900">{formatDate(doc.expiryDate)}</span>
                    </div>
                  </div>
                  {doc.notes && (
                    <p className="text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded border border-neutral-100">
                      {doc.notes}
                    </p>
                  )}
                  <div className="pt-2 flex justify-between items-center border-t border-neutral-100">
                    <span className="text-neutral-400 text-[10px]">Renewal: {doc.costToRenew ? formatRupiah(doc.costToRenew) : "-"}</span>
                    <Button variant="outline" size="xs">View Document</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: HISTORY */}
      {activeTab === "history" && (
        <Card className="border-neutral-200">
          <CardHeader className="pb-3 border-b border-neutral-100">
            <CardTitle className="text-sm font-semibold">Vehicle Lifecycle & Audit Trail</CardTitle>
            <p className="text-xs text-neutral-500">Chronological history of dispatches, maintenance, inspections, and status changes</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="relative pl-6 border-l-2 border-neutral-200 space-y-8">
              {vehicleHistoryEvents.map((evt) => (
                <div key={evt.id} className="relative group">
                  {/* Dot indicator */}
                  <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-white border-2 border-neutral-900 group-hover:scale-125 transition-transform" />

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-medium text-neutral-500">{evt.date}</span>
                      {evt.tag && (
                        <span className="px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 text-[10px] font-semibold uppercase">
                          {evt.tag}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-neutral-900">{evt.title}</h4>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">{evt.description}</p>
                    <div className="text-[11px] text-neutral-400 flex items-center gap-3 pt-1">
                      {evt.actor && <span>Operator / Vendor: {evt.actor}</span>}
                      {evt.odometer && <span className="font-mono">{formatNumber(evt.odometer)} KM</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog: Log Inspection Modal */}
      <Dialog open={isInspectionModalOpen} onOpenChange={setIsInspectionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Vehicle Inspection</DialogTitle>
            <DialogDescription>
              Record periodic, pre-rental, or post-rental inspection for unit {vehicle.plateNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Inspection Type</label>
              <select className="w-full h-8 rounded border border-neutral-200 px-2 text-xs bg-white">
                <option>Periodic Inspection</option>
                <option>Pre-Rental Dispatch Check</option>
                <option>Post-Rental Return Inspection</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Current Odometer (KM)</label>
              <input type="number" defaultValue={vehicle.odometer} className="w-full h-8 rounded border border-neutral-200 px-2 text-xs" />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Inspector Name</label>
              <input defaultValue="Ahmad Subarjo" className="w-full h-8 rounded border border-neutral-200 px-2 text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsInspectionModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setIsInspectionModalOpen(false)}>Save Inspection Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Book Service Modal */}
      <Dialog open={isMaintenanceModalOpen} onOpenChange={setIsMaintenanceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Workshop Service</DialogTitle>
            <DialogDescription>
              Dispatch unit {vehicle.plateNumber} to partner workshop.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Service Type</label>
              <select className="w-full h-8 rounded border border-neutral-200 px-2 text-xs bg-white">
                <option>Periodic Service (Oil & Filters)</option>
                <option>Brake & Suspension Overhaul</option>
                <option>Air Conditioning Overhaul</option>
                <option>Body Repair & Paint</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">Partner Workshop</label>
              <select className="w-full h-8 rounded border border-neutral-200 px-2 text-xs bg-white">
                <option>AutoCare Pulogadung (Jakarta Timur)</option>
                <option>Plaza Toyota Kebon Jeruk (Jakarta Barat)</option>
                <option>Auto2000 Cikarang (Bekasi)</option>
                <option>Bengkel Sentosa Daan Mogot (Tangerang)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsMaintenanceModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => setIsMaintenanceModalOpen(false)}>Confirm Dispatch to Workshop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
