"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { mockMaintenance, mockVehicles, getMaintenanceRecords, createMaintenanceRecord } from "@/lib/data";
import { formatRupiah, formatDate, formatNumber } from "@/lib/utils";

export default function MaintenanceManagementPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [maintenanceList, setMaintenanceList] = React.useState(mockMaintenance);

  // Form state
  const [selectedVehicleId, setSelectedVehicleId] =
    React.useState("B-7711-GHY");
  const [serviceType, setServiceType] = React.useState<
    "PERIODIC_SERVICE" | "REPAIR" | "TIRE_REPLACEMENT"
  >("PERIODIC_SERVICE");
  const [workshop, setWorkshop] = React.useState("AutoCare Pulogadung");
  const [cost, setCost] = React.useState("1850000");

  const handleBookService = () => {
    const veh =
      mockVehicles.find((v) => v.id === selectedVehicleId) || mockVehicles[0];
    const newRecord = {
      id: `MNT-2026-${Date.now().toString().slice(-4)}`,
      vehicleId: veh.id,
      plateNumber: veh.plateNumber,
      model: `${veh.brand} ${veh.model}`,
      type: serviceType,
      date: new Date().toISOString().split("T")[0],
      odometer: veh.odometer,
      workshopName: workshop,
      workshopLocation: "Jabodetabek Workshop Network",
      cost: parseInt(cost) || 1500000,
      status: "IN_PROGRESS" as const,
      description: "Scheduled maintenance dispatched via operations platform.",
      durationDays: 2,
    };

    setMaintenanceList([newRecord, ...maintenanceList]);
    setIsModalOpen(false);
  };

  const filtered = maintenanceList.filter((m) => {
    return (
      m.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.model.toLowerCase().includes(search.toLowerCase()) ||
      m.workshopName.toLowerCase().includes(search.toLowerCase()) ||
      m.type.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
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
          className="gap-1.5 font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          Book Workshop Service
        </Button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Maintenance Due
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                3
              </div>
              <span className="text-[11px] text-amber-600 font-medium">
                Threshold reached
              </span>
            </div>
            <div className="p-2 rounded-md bg-amber-50 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                In Progress
              </span>
              <div className="text-2xl font-bold text-blue-700 mt-1 font-mono">
                2
              </div>
              <span className="text-[11px] text-blue-600 font-medium">
                Currently in workshop
              </span>
            </div>
            <div className="p-2 rounded-md bg-blue-50 text-blue-700">
              <Wrench className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
                Completed (Month)
              </span>
              <div className="text-2xl font-bold text-emerald-800 mt-1 font-mono">
                42
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Service completed
              </span>
            </div>
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Maintenance Cost
              </span>
              <div className="text-xl font-bold text-neutral-900 mt-1 font-mono">
                Rp 34,5 Jt
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">
                Total spend Sep 2026
              </span>
            </div>
            <div className="p-2 rounded-md bg-neutral-100 text-neutral-800">
              <Banknote className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Search plate, model, workshop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs bg-neutral-50"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Odometer</TableHead>
                <TableHead>Workshop</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Cost (IDR)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m, idx) => (
                <TableRow
                  key={m.id}
                  onClick={() => router.push(`/fleet/${m.vehicleId}`)}
                  className="cursor-pointer hover:bg-neutral-50"
                >
                  <TableCell className="text-center font-medium text-neutral-500 text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-neutral-900">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs">{m.plateNumber}</span>
                      <span className="text-[11px] text-neutral-500">
                        {m.model}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-[11px] font-medium text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                      {m.type.replace(/_/g, " ")}
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-neutral-600 text-xs">
                    {formatDate(m.date)}
                  </TableCell>

                  <TableCell className="font-mono text-neutral-800 text-xs">
                    {formatNumber(m.odometer)} KM
                  </TableCell>

                  <TableCell className="text-neutral-800 text-xs">
                    {m.workshopName}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Book Service Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book Workshop Service</DialogTitle>
            <DialogDescription>
              Assign vehicle to certified maintenance workshop.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Target Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full h-8 rounded border border-neutral-200 px-2 bg-white text-xs"
              >
                {mockVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} - {v.model} ({formatNumber(v.odometer)} KM)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Maintenance Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full h-8 rounded border border-neutral-200 px-2 bg-white text-xs"
              >
                <option value="PERIODIC_SERVICE">
                  Periodic Service (Oil & Filters)
                </option>
                <option value="REPAIR">Mechanical / Electrical Repair</option>
                <option value="TIRE_REPLACEMENT">
                  Tire Replacement & Alignment
                </option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Workshop Partner
              </label>
              <select
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                className="w-full h-8 rounded border border-neutral-200 px-2 bg-white text-xs"
              >
                <option>AutoCare Pulogadung (Jakarta Timur)</option>
                <option>Plaza Toyota Kebon Jeruk (Jakarta Barat)</option>
                <option>Auto2000 Cikarang (Bekasi)</option>
                <option>Bengkel Sentosa Daan Mogot (Tangerang)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Estimated Cost (IDR)
              </label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full h-8 rounded border border-neutral-200 px-2 bg-white text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleBookService}>
              Confirm Dispatch to Workshop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
