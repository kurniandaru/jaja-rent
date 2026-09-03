"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Banknote,
  Search,
  Plus,
  Car,
  Filter,
  ExternalLink,
  MapPin,
  Calendar,
} from "lucide-react";
import { mockMaintenance, mockVehicles } from "@/lib/data";
import { MaintenanceRecord } from "@/lib/types/operations";
import { formatRupiah, formatDate, formatNumber } from "@/lib/utils";

export default function MaintenanceManagementPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [maintenanceList, setMaintenanceList] =
    React.useState<MaintenanceRecord[]>(mockMaintenance);

  // Form state
  const [selectedVehicleId, setSelectedVehicleId] = React.useState(
    mockVehicles[0]?.id || "B-1234-XYZ",
  );
  const [serviceType, setServiceType] = React.useState<
    "PERIODIC_SERVICE" | "REPAIR" | "TIRE_REPLACEMENT" | "BODY_PAINT"
  >("PERIODIC_SERVICE");
  const [scheduledDate, setScheduledDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [workshopName, setWorkshopName] = React.useState("AutoCare Pulogadung");
  const [workshopLocation, setWorkshopLocation] =
    React.useState("Jakarta Timur");
  const [cost, setCost] = React.useState("1850000");
  const [serviceDescription, setServiceDescription] = React.useState(
    "Servis berkala ganti oli mesin, filter, tune up, spooring.",
  );
  const [durationDays, setDurationDays] = React.useState(2);
  const [serviceStatus, setServiceStatus] = React.useState<
    "IN_PROGRESS" | "SCHEDULED"
  >("IN_PROGRESS");

  const handleBookService = () => {
    const veh =
      mockVehicles.find((v) => v.id === selectedVehicleId) || mockVehicles[0];
    const newRecord: MaintenanceRecord = {
      id: `MNT-2026-${Date.now().toString().slice(-4)}`,
      vehicleId: veh.id,
      plateNumber: veh.plateNumber,
      model: `${veh.brand} ${veh.model}`,
      type: serviceType,
      date: scheduledDate,
      odometer: veh.odometer,
      workshopName: workshopName,
      workshopLocation: workshopLocation,
      cost: parseInt(cost) || 1500000,
      status: serviceStatus,
      description:
        serviceDescription ||
        "Scheduled maintenance dispatched via operations platform.",
      durationDays: durationDays || 2,
    };

    setMaintenanceList([newRecord, ...maintenanceList]);
    setIsModalOpen(false);
  };

  const filtered = maintenanceList.filter((m) => {
    // Status filter
    if (statusFilter !== "ALL" && m.status !== statusFilter) {
      return false;
    }

    // Keyword search
    const s = search.toLowerCase();
    return (
      m.plateNumber.toLowerCase().includes(s) ||
      m.model.toLowerCase().includes(s) ||
      m.workshopName.toLowerCase().includes(s) ||
      m.type.toLowerCase().includes(s) ||
      m.description?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Maintenance Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Workshop dispatch &middot; Periodic servicing &middot; Repair costs
            and parts tracking
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          size="sm"
          className="bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5 font-bold text-xs shadow-xs"
        >
          <Plus className="h-4 w-4" />+ Book Workshop Service
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-neutral-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Maintenance Due
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                {maintenanceList.filter((m) => m.status === "SCHEDULED" || m.status === "OVERDUE").length || 3}
              </div>
              <span className="text-[11px] text-amber-600 font-medium">
                Threshold reached
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                In Progress
              </span>
              <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
                {maintenanceList.filter((m) => m.status === "IN_PROGRESS")
                  .length || 2}
              </div>
              <span className="text-[11px] text-blue-600 font-medium">
                Currently in workshop
              </span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
                Completed (Month)
              </span>
              <div className="text-2xl font-bold text-emerald-800 mt-1 font-mono">
                {maintenanceList.filter((m) => m.status === "COMPLETED")
                  .length || 42}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Service completed
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Maintenance Cost
              </span>
              <div className="text-xl font-bold text-neutral-900 mt-1 font-mono">
                Rp 34,5 Jt
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">
                YTD Sep 2026
              </span>
            </div>
            <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
              <Banknote className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table with Inline Filter Tabs and Search Bar */}
      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-3.5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter Segmented Controls */}
          <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 shrink-0 text-xs font-semibold overflow-x-auto">
            {[
              { id: "ALL", label: `Semua (${maintenanceList.length})` },
              {
                id: "IN_PROGRESS",
                label: `In Progress (${maintenanceList.filter((m) => m.status === "IN_PROGRESS").length})`,
              },
              {
                id: "SCHEDULED",
                label: `Scheduled (${maintenanceList.filter((m) => m.status === "SCHEDULED" || m.status === "OVERDUE").length})`,
              },
              {
                id: "COMPLETED",
                label: `Completed (${maintenanceList.filter((m) => m.status === "COMPLETED").length})`,
              },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === st.id
                    ? "bg-white text-neutral-900 shadow-xs font-bold"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Box Inline */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Cari plat, model, bengkel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-neutral-50"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/80">
              <TableRow className="text-xs">
                <TableHead className="w-12 font-bold text-center">No</TableHead>
                <TableHead className="font-bold">ID & Tanggal</TableHead>
                <TableHead className="font-bold">Unit Kendaraan</TableHead>
                <TableHead className="font-bold">Jenis Perawatan</TableHead>
                <TableHead className="font-bold">Odometer</TableHead>
                <TableHead className="font-bold">Bengkel Rekanan</TableHead>
                <TableHead className="font-bold">Deskripsi Servis</TableHead>
                <TableHead className="font-bold">Biaya</TableHead>
                <TableHead className="font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-neutral-500 text-xs"
                  >
                    Tidak ada catatan maintenance yang sesuai filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((m, idx) => (
                  <TableRow
                    key={m.id}
                    className="text-xs hover:bg-neutral-50/60"
                  >
                    <TableCell className="text-center font-mono font-bold text-neutral-500">
                      {idx + 1}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-neutral-900 block">
                          {m.id}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          {m.date}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <Link
                          href={`/fleet/${m.plateNumber.replace(/\s+/g, "-")}`}
                          className="font-mono font-bold text-neutral-900 hover:text-primary block"
                        >
                          {m.plateNumber}
                        </Link>
                        <span className="text-[11px] text-neutral-500 block truncate max-w-[150px]">
                          {m.model}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-semibold text-neutral-800 block text-xs">
                        {m.type === "PERIODIC_SERVICE"
                          ? "Servis Berkala"
                          : m.type === "REPAIR"
                            ? "Perbaikan Mesin"
                            : m.type === "TIRE_REPLACEMENT"
                              ? "Ganti Ban"
                              : m.type}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono text-neutral-800 text-xs">
                      {formatNumber(m.odometer)} KM
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <strong className="text-neutral-900 block text-xs">
                          {m.workshopName}
                        </strong>
                        {m.workshopLocation && (
                          <span className="text-[10px] text-neutral-400 block">
                            {m.workshopLocation}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-neutral-600 text-xs max-w-xs truncate">
                      {m.description}
                    </TableCell>

                    <TableCell className="font-mono font-bold text-neutral-900 text-xs">
                      {formatRupiah(m.cost)}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={m.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Book Service Dialog with Complete Structured Form Fields */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md sm:max-w-lg bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-orange-600" />
              Book Workshop Service (Disposisi Servis)
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Jadwalkan unit armada ke jaringan bengkel rekanan resmi
              terverifikasi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1 text-xs max-h-[70vh] overflow-y-auto pr-1">
            {/* Target Vehicle */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Target Unit Kendaraan <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full h-8.5 rounded-md border border-neutral-200 px-2.5 bg-white text-xs font-semibold text-neutral-900"
              >
                {mockVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.brand} {v.model} (
                    {formatNumber(v.odometer)} KM)
                  </option>
                ))}
              </select>
            </div>

            {/* Service Type & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Jenis Perawatan / Servis{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full h-8.5 rounded-md border border-neutral-200 px-2.5 bg-white text-xs font-semibold text-neutral-900"
                >
                  <option value="PERIODIC_SERVICE">
                    Servis Berkala (Ganti Oli & Filter)
                  </option>
                  <option value="REPAIR">Perbaikan Mesin / Elektrikal</option>
                  <option value="TIRE_REPLACEMENT">
                    Ganti Ban & Spooring Balancing
                  </option>
                  <option value="BODY_PAINT">Body Repair & Cat</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Tanggal Masuk Servis <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="h-8.5 text-xs font-mono"
                />
              </div>
            </div>

            {/* Workshop & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Bengkel Rekanan <span className="text-rose-500">*</span>
                </label>
                <select
                  value={workshopName}
                  onChange={(e) => {
                    setWorkshopName(e.target.value);
                    if (e.target.value.includes("Pulogadung"))
                      setWorkshopLocation("Jakarta Timur");
                    else if (e.target.value.includes("Kebon Jeruk"))
                      setWorkshopLocation("Jakarta Barat");
                    else if (e.target.value.includes("Cikarang"))
                      setWorkshopLocation("Bekasi / Cikarang");
                    else setWorkshopLocation("Tangerang");
                  }}
                  className="w-full h-8.5 rounded-md border border-neutral-200 px-2.5 bg-white text-xs font-semibold text-neutral-900"
                >
                  <option value="AutoCare Pulogadung">
                    AutoCare Pulogadung
                  </option>
                  <option value="Plaza Toyota Kebon Jeruk">
                    Plaza Toyota Kebon Jeruk
                  </option>
                  <option value="Auto2000 Cikarang">Auto2000 Cikarang</option>
                  <option value="Bengkel Sentosa Daan Mogot">
                    Bengkel Sentosa Daan Mogot
                  </option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Wilayah / Lokasi Bengkel
                </label>
                <Input
                  value={workshopLocation}
                  onChange={(e) => setWorkshopLocation(e.target.value)}
                  className="h-8.5 text-xs"
                />
              </div>
            </div>

            {/* Cost & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Estimasi Biaya Servis (Rp){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="h-8.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Estimasi Durasi Pengerjaan (Hari)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="h-8.5 text-xs font-mono"
                />
              </div>
            </div>

            {/* Description & Scope */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Catatan Rincian Pengerjaan / Scope of Work
              </label>
              <Textarea
                rows={2}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Rincian part yang diganti, keluhan pengemudi, atau instruksi QC..."
                className="text-xs"
              />
            </div>

            {/* Status Selection */}
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Status Disposisi
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setServiceStatus("IN_PROGRESS")}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    serviceStatus === "IN_PROGRESS"
                      ? "bg-blue-50 border-blue-400 text-blue-800"
                      : "bg-white border-neutral-200 text-neutral-600"
                  }`}
                >
                  Langsung Masuk Bengkel (IN_PROGRESS)
                </button>
                <button
                  type="button"
                  onClick={() => setServiceStatus("SCHEDULED")}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    serviceStatus === "SCHEDULED"
                      ? "bg-amber-50 border-amber-400 text-amber-800"
                      : "bg-white border-neutral-200 text-neutral-600"
                  }`}
                >
                  Jadwalkan Servis (SCHEDULED)
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleBookService}
              className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simpan & Konfirmasi Servis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
