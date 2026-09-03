"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { OwnershipBadge } from "@/components/ui/priority-badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Wrench,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle,
  Radio,
  FileWarning,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
} from "lucide-react";
import { getVehicles } from "@/lib/data/vehicles";
import { Vehicle } from "@/lib/types/fleet";
import { formatNumber } from "@/lib/utils";

function FleetCommandViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "all";
  const ownershipParam = searchParams.get("ownership") || "all";
  const statusParam = searchParams.get("status") || "all";
  const searchParam = searchParams.get("search") || "";

  const [vehicles, setVehicles] = React.useState<Vehicle[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState(searchParam);
  const [activeTab, setActiveTab] = React.useState(
    statusParam !== "all"
      ? statusParam.toLowerCase()
      : ownershipParam !== "all"
        ? ownershipParam.toLowerCase()
        : tabParam,
  );
  const [ownershipFilter, setOwnershipFilter] = React.useState<string>("all");
  const [eligibilityFilter, setEligibilityFilter] = React.useState<string>("all");
  const [gpsFilter, setGpsFilter] = React.useState<string>("all");
  const [maintenanceFilter, setMaintenanceFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<"plate" | "odometer" | "year">("plate");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  React.useEffect(() => {
    async function loadFleet() {
      setLoading(true);
      const data = await getVehicles();
      setVehicles(data);
      setLoading(false);
    }
    loadFleet();
  }, []);

  // Calculate Operational Metrics
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const reservedCount = vehicles.filter((v) => v.status === "RESERVED").length;
  const allocatedCount = vehicles.filter((v) => v.status === "ALLOCATED").length;
  const rentedCount = vehicles.filter((v) => v.status === "RENTED").length;
  const inspectionCount = vehicles.filter(
    (v) => v.status === "INSPECTION" || v.status === "RETURNED",
  ).length;
  const maintenanceCount = vehicles.filter((v) => v.status === "MAINTENANCE").length;
  const inactiveCount = vehicles.filter(
    (v) =>
      v.status === "INACTIVE" ||
      v.status === "ACCIDENT" ||
      v.status === "DOCUMENT_HOLD" ||
      v.status === "SOLD",
  ).length;

  // Calculate Critical Operational Alerts
  const maintenanceAlerts = vehicles.filter(
    (v) =>
      v.odometer >= v.nextServiceOdometer ||
      v.maintenanceStatus === "DUE" ||
      v.maintenanceStatus === "OVERDUE",
  );
  const documentAlerts = vehicles.filter(
    (v) => v.documentStatus === "EXPIRING_SOON" || v.documentStatus === "EXPIRED",
  );
  const gpsOfflineAlerts = vehicles.filter((v) => v.gpsStatus === "OFFLINE");
  const inspectionPendingAlerts = vehicles.filter(
    (v) => v.status === "INSPECTION" || v.status === "RETURNED",
  );

  // Filter Vehicles
  const filteredVehicles = vehicles.filter((veh) => {
    // Search text
    const s = search.toLowerCase();
    const matchesSearch =
      veh.plateNumber.toLowerCase().includes(s) ||
      veh.brand.toLowerCase().includes(s) ||
      veh.model.toLowerCase().includes(s) ||
      veh.vin?.toLowerCase().includes(s) ||
      (veh.currentCustomerName && veh.currentCustomerName.toLowerCase().includes(s)) ||
      veh.locationCity.toLowerCase().includes(s);

    // Tab filter
    let matchesTab = true;
    if (activeTab === "available") {
      matchesTab = veh.status === "AVAILABLE";
    } else if (activeTab === "allocated") {
      matchesTab = veh.status === "ALLOCATED" || veh.status === "RESERVED";
    } else if (activeTab === "rented") {
      matchesTab = veh.status === "RENTED";
    } else if (activeTab === "inspection") {
      matchesTab = veh.status === "INSPECTION" || veh.status === "RETURNED";
    } else if (activeTab === "maintenance") {
      matchesTab = veh.status === "MAINTENANCE";
    } else if (activeTab === "inactive") {
      matchesTab =
        veh.status === "INACTIVE" ||
        veh.status === "ACCIDENT" ||
        veh.status === "DOCUMENT_HOLD" ||
        veh.status === "SOLD";
    } else if (activeTab === "jaja_owned") {
      matchesTab = veh.ownership === "JAJA_OWNED";
    } else if (activeTab === "vendor_owned") {
      matchesTab = veh.ownership === "VENDOR_OWNED";
    }

    // Secondary filters
    let matchesOwnership = true;
    if (ownershipFilter !== "all") {
      matchesOwnership = veh.ownership === ownershipFilter;
    }

    let matchesEligibility = true;
    if (eligibilityFilter === "B2C") {
      matchesEligibility = veh.businessEligibility === "B2C" || veh.businessEligibility === "BOTH";
    } else if (eligibilityFilter === "B2B") {
      matchesEligibility = true;
    }

    let matchesGps = true;
    if (gpsFilter !== "all") {
      matchesGps = veh.gpsStatus === gpsFilter;
    }

    let matchesMaintenance = true;
    if (maintenanceFilter === "OK") {
      matchesMaintenance = veh.maintenanceStatus === "OK";
    } else if (maintenanceFilter === "DUE") {
      matchesMaintenance =
        veh.maintenanceStatus === "DUE" ||
        veh.maintenanceStatus === "OVERDUE" ||
        veh.odometer >= veh.nextServiceOdometer;
    } else if (maintenanceFilter === "IN_PROGRESS") {
      matchesMaintenance = veh.maintenanceStatus === "IN_PROGRESS" || veh.status === "MAINTENANCE";
    }

    return (
      matchesSearch &&
      matchesTab &&
      matchesOwnership &&
      matchesEligibility &&
      matchesGps &&
      matchesMaintenance
    );
  });

  // Sort
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortField === "odometer") {
      return sortOrder === "asc" ? a.odometer - b.odometer : b.odometer - a.odometer;
    }
    if (sortField === "year") {
      return sortOrder === "asc" ? a.year - b.year : b.year - a.year;
    }
    return sortOrder === "asc"
      ? a.plateNumber.localeCompare(b.plateNumber)
      : b.plateNumber.localeCompare(a.plateNumber);
  });

  const totalPages = Math.ceil(sortedVehicles.length / pageSize) || 1;
  const paginatedVehicles = sortedVehicles.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: "plate" | "odometer" | "year") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Fleet Command Center
            </h1>
            <span className="text-[11px] bg-neutral-900 text-white font-mono px-2 py-0.5 rounded-full font-semibold">
              Live Fleet View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Monitoring operasional komprehensif seluruh {totalCount} unit kendaraan Jaja Rent
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/schedule">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              Master Schedule
            </Button>
          </Link>
          <Link href="/operations/inspections">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Inspeksi QC
            </Button>
          </Link>
          <Link href="/operations/maintenance">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <Wrench className="h-3.5 w-3.5" />
              Service Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Fleet Command KPI Cards (Section 22) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="p-3 bg-white border border-neutral-200 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Total Fleet
          </span>
          <span className="text-xl font-extrabold text-neutral-900 mt-1">{totalCount}</span>
          <span className="text-[10px] text-neutral-400">Seluruh unit</span>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Available
          </span>
          <span className="text-xl font-extrabold text-emerald-800 mt-1">{availableCount}</span>
          <span className="text-[10px] text-emerald-600">Siap sewa</span>
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Reserved
          </span>
          <span className="text-xl font-extrabold text-amber-900 mt-1">{reservedCount}</span>
          <span className="text-[10px] text-amber-600">Terpesan</span>
        </div>

        <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            Allocated
          </span>
          <span className="text-xl font-extrabold text-indigo-900 mt-1">{allocatedCount}</span>
          <span className="text-[10px] text-indigo-600">Unit dialokasi</span>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Rented
          </span>
          <span className="text-xl font-extrabold text-blue-900 mt-1">{rentedCount}</span>
          <span className="text-[10px] text-blue-600">Sedang jalan</span>
        </div>

        <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Inspection
          </span>
          <span className="text-xl font-extrabold text-purple-900 mt-1">{inspectionCount}</span>
          <span className="text-[10px] text-purple-600">QC & return</span>
        </div>

        <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
            Maintenance
          </span>
          <span className="text-xl font-extrabold text-orange-900 mt-1">{maintenanceCount}</span>
          <span className="text-[10px] text-orange-600">Di bengkel</span>
        </div>

        <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Inactive
          </span>
          <span className="text-xl font-extrabold text-rose-900 mt-1">{inactiveCount}</span>
          <span className="text-[10px] text-rose-600">Hold / problem</span>
        </div>
      </div>

      {/* 2. Critical Operational Alerts Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => {
            setMaintenanceFilter("DUE");
            setPage(1);
          }}
          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            maintenanceAlerts.length > 0
              ? "bg-amber-50/80 border-amber-300 hover:bg-amber-100/70"
              : "bg-neutral-50 border-neutral-200 opacity-70"
          }`}
        >
          <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
            <Wrench className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950">Maintenance Due</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                {maintenanceAlerts.length}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 truncate mt-0.5">
              {maintenanceAlerts.length > 0
                ? `${maintenanceAlerts[0].plateNumber} & lainnya jatuh tempo`
                : "Semua unit servis aman"}
            </p>
          </div>
        </div>

        <div
          onClick={() => {
            setActiveTab("all");
            setSearch("expir");
            setPage(1);
          }}
          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            documentAlerts.length > 0
              ? "bg-rose-50/80 border-rose-300 hover:bg-rose-100/70"
              : "bg-neutral-50 border-neutral-200 opacity-70"
          }`}
        >
          <div className="p-2 bg-rose-100 text-rose-800 rounded-lg shrink-0">
            <FileWarning className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-950">Dokumen Expiring</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-rose-200 text-rose-900 rounded">
                {documentAlerts.length}
              </span>
            </div>
            <p className="text-[11px] text-rose-800 truncate mt-0.5">
              {documentAlerts.length > 0
                ? "STNK / KIR perlu perpanjangan segera"
                : "Seluruh berkas legalitas aktif"}
            </p>
          </div>
        </div>

        <div
          onClick={() => {
            setGpsFilter("OFFLINE");
            setPage(1);
          }}
          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            gpsOfflineAlerts.length > 0
              ? "bg-orange-50/80 border-orange-300 hover:bg-orange-100/70"
              : "bg-neutral-50 border-neutral-200 opacity-70"
          }`}
        >
          <div className="p-2 bg-orange-100 text-orange-800 rounded-lg shrink-0">
            <Radio className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-950">GPS Telematics Offline</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-orange-200 text-orange-900 rounded">
                {gpsOfflineAlerts.length}
              </span>
            </div>
            <p className="text-[11px] text-orange-800 truncate mt-0.5">
              {gpsOfflineAlerts.length > 0
                ? `${gpsOfflineAlerts.length} unit tidak terhubung sinyal`
                : "Semua tracker online"}
            </p>
          </div>
        </div>

        <div
          onClick={() => {
            setActiveTab("inspection");
            setPage(1);
          }}
          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
            inspectionPendingAlerts.length > 0
              ? "bg-purple-50/80 border-purple-300 hover:bg-purple-100/70"
              : "bg-neutral-50 border-neutral-200 opacity-70"
          }`}
        >
          <div className="p-2 bg-purple-100 text-purple-800 rounded-lg shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950">Inspection Pending</span>
              <span className="text-xs font-mono font-bold px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded">
                {inspectionPendingAlerts.length}
              </span>
            </div>
            <p className="text-[11px] text-purple-800 truncate mt-0.5">
              {inspectionPendingAlerts.length > 0
                ? "Unit baru kembali butuh periksa kondisi"
                : "Tidak ada antrean inspeksi"}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Main Fleet Table Container */}
      <Card className="border-neutral-200 shadow-xs">
        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200 bg-neutral-50/75 px-4 pt-3 flex flex-wrap gap-1">
          {[
            { id: "all", label: "Semua Unit", count: totalCount },
            { id: "available", label: "Available", count: availableCount },
            { id: "allocated", label: "Allocated / Reserved", count: allocatedCount + reservedCount },
            { id: "rented", label: "Rented", count: rentedCount },
            { id: "inspection", label: "Inspection", count: inspectionCount },
            { id: "maintenance", label: "Maintenance", count: maintenanceCount },
            { id: "inactive", label: "Inactive / Hold", count: inactiveCount },
            {
              id: "jaja_owned",
              label: "Jaja Owned",
              count: vehicles.filter((v) => v.ownership === "JAJA_OWNED").length,
            },
            {
              id: "vendor_owned",
              label: "Vendor Owned",
              count: vehicles.filter((v) => v.ownership === "VENDOR_OWNED").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-neutral-900 text-neutral-900 bg-white rounded-t-md font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-neutral-900 text-white font-semibold"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Strip */}
        <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Cari plat nomor, model, VIN, customer, lokasi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs bg-neutral-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Ownership filter */}
            <select
              value={ownershipFilter}
              onChange={(e) => {
                setOwnershipFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
            >
              <option value="all">Kepemilikan (Semua)</option>
              <option value="JAJA_OWNED">Jaja Owned</option>
              <option value="VENDOR_OWNED">Vendor Owned</option>
            </select>

            {/* Eligibility filter */}
            <select
              value={eligibilityFilter}
              onChange={(e) => {
                setEligibilityFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
            >
              <option value="all">Kelayakan Bisnis (Semua)</option>
              <option value="B2C">B2C Retail Eligible</option>
              <option value="B2B">B2B Corporate Eligible</option>
            </select>

            {/* GPS filter */}
            <select
              value={gpsFilter}
              onChange={(e) => {
                setGpsFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
            >
              <option value="all">Status GPS (Semua)</option>
              <option value="ONLINE">GPS Online</option>
              <option value="OFFLINE">GPS Offline</option>
              <option value="IDLE">GPS Idle</option>
            </select>

            {/* Maintenance filter */}
            <select
              value={maintenanceFilter}
              onChange={(e) => {
                setMaintenanceFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
            >
              <option value="all">Status Servis (Semua)</option>
              <option value="OK">Servis Aman</option>
              <option value="DUE">Jatuh Tempo / Overdue</option>
              <option value="IN_PROGRESS">Sedang Servis</option>
            </select>
          </div>
        </div>

        {/* Dense Table */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("plate")}
                  className="cursor-pointer hover:text-neutral-900"
                >
                  <div className="flex items-center gap-1">
                    Kendaraan & Plat <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                  </div>
                </TableHead>
                <TableHead>Kepemilikan</TableHead>
                <TableHead>Status Operasional</TableHead>
                <TableHead>Penyewa / Rental Aktif</TableHead>
                <TableHead>Lokasi Unit</TableHead>
                <TableHead
                  onClick={() => toggleSort("odometer")}
                  className="cursor-pointer hover:text-neutral-900"
                >
                  <div className="flex items-center gap-1">
                    Odometer / Servis <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                  </div>
                </TableHead>
                <TableHead>Dokumen</TableHead>
                <TableHead>Telematika GPS</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-28 text-center text-neutral-400 text-xs">
                    Memuat data fleet...
                  </TableCell>
                </TableRow>
              ) : paginatedVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-28 text-center text-neutral-500 text-xs">
                    Tidak ada kendaraan yang sesuai dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVehicles.map((veh, idx) => (
                  <TableRow
                    key={veh.id}
                    className="hover:bg-neutral-50/80 transition-colors cursor-pointer"
                    onClick={() => router.push(`/fleet/${veh.id}`)}
                  >
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>

                    <TableCell className="font-semibold text-neutral-900">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-xs tracking-tight">
                          {veh.plateNumber}
                        </span>
                        <span className="text-[11px] font-normal text-neutral-600 line-clamp-1">
                          {veh.brand} {veh.model} ({veh.year})
                        </span>
                        <span className="text-[9px] font-mono text-neutral-400">
                          VIN: {veh.vin?.slice(-8) || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <OwnershipBadge ownership={veh.ownership} />
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={veh.status} />
                    </TableCell>

                    <TableCell className="max-w-44 text-neutral-800 font-medium">
                      {veh.currentCustomerName ? (
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            {veh.currentRentalType === "B2B" ? (
                              <Building2 className="h-3 w-3 text-purple-600 shrink-0" />
                            ) : (
                              <User className="h-3 w-3 text-blue-600 shrink-0" />
                            )}
                            <span className="truncate text-xs font-semibold">
                              {veh.currentCustomerName}
                            </span>
                          </div>
                          {veh.currentRentalId && (
                            <span className="text-[10px] font-mono text-neutral-400">
                              {veh.currentRentalId}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-xs font-normal">Tersedia di pool</span>
                      )}
                    </TableCell>

                    <TableCell className="text-neutral-600 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-800">{veh.locationCity}</span>
                        <span className="text-[10px] text-neutral-400 line-clamp-1">
                          {veh.locationArea}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-neutral-800">
                          {formatNumber(veh.odometer)} KM
                        </span>
                        <span
                          className={`text-[10px] font-medium ${
                            veh.odometer >= veh.nextServiceOdometer
                              ? "text-rose-600 font-bold"
                              : "text-neutral-400"
                          }`}
                        >
                          Next: {formatNumber(veh.nextServiceOdometer)} KM
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          veh.documentStatus === "OK"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : veh.documentStatus === "EXPIRING_SOON"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {veh.documentStatus.replace(/_/g, " ")}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            veh.gpsStatus === "ONLINE"
                              ? "bg-emerald-500 animate-pulse"
                              : veh.gpsStatus === "IDLE"
                                ? "bg-amber-400"
                                : "bg-rose-500"
                          }`}
                        />
                        <span className="text-[11px] font-medium text-neutral-700">
                          {veh.gpsStatus}
                        </span>
                        {veh.speed > 0 && (
                          <span className="text-[10px] text-neutral-400 font-mono">
                            ({veh.speed} km/h)
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/fleet/${veh.id}`);
                        }}
                        className="text-xs font-semibold text-neutral-800 hover:text-neutral-950 gap-1"
                      >
                        Detail
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-xs text-neutral-500">
            <div>
              Menampilkan <span className="font-medium">{(page - 1) * pageSize + 1}</span> s/d{" "}
              <span className="font-medium">
                {Math.min(page * pageSize, sortedVehicles.length)}
              </span>{" "}
              dari <span className="font-medium">{sortedVehicles.length}</span> unit kendaraan
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-mono">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FleetPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-neutral-400">Loading Fleet Command Center...</div>}>
      <FleetCommandViewContent />
    </Suspense>
  );
}
