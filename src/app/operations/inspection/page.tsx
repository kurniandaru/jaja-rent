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
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Plus,
  ShieldAlert,
  Car,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { mockInspections, mockVehicles, getInspections, createInspection } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

export default function InspectionManagementPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [isNewModalOpen, setIsNewModalOpen] = React.useState(false);
  const [inspectionsList, setInspectionsList] = React.useState(mockInspections);

  // New Inspection Form state
  const [selectedPlate, setSelectedPlate] = React.useState("B-5678-ABC");
  const [inspType, setInspType] = React.useState<
    "PERIODIC" | "PRE_RENTAL" | "POST_RENTAL"
  >("PERIODIC");
  const [inspector, setInspector] = React.useState("Ahmad Subarjo");
  const [checkPassed, setCheckPassed] = React.useState(true);

  const handleSaveInspection = () => {
    const veh =
      mockVehicles.find((v) => v.id === selectedPlate) || mockVehicles[0];
    const newRecord = {
      id: `INSP-2026-${Date.now().toString().slice(-4)}`,
      vehicleId: veh.id,
      plateNumber: veh.plateNumber,
      model: `${veh.brand} ${veh.model}`,
      type: inspType,
      date: new Date().toISOString().split("T")[0],
      odometer: veh.odometer,
      inspectorName: inspector,
      result: checkPassed ? ("PASSED" as const) : ("FAILED" as const),
      checklist: {
        exterior: {
          body: checkPassed,
          glass: true,
          tire: checkPassed,
          lamp: true,
        },
        interior: { seat: true, ac: true, dashboard: true, cleanliness: true },
        engine: {
          oil: true,
          coolant: true,
          battery: true,
          brakeFluid: checkPassed,
        },
        safety: {
          seatbelt: true,
          airbag: true,
          spareTire: true,
          toolKit: true,
        },
      },
      notes: checkPassed
        ? "Vehicle cleared for dispatch."
        : "Defects noted during inspection.",
    };

    setInspectionsList([newRecord, ...inspectionsList]);
    setIsNewModalOpen(false);
  };

  const filtered = inspectionsList.filter((i) => {
    return (
      i.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.model.toLowerCase().includes(search.toLowerCase()) ||
      i.inspectorName.toLowerCase().includes(search.toLowerCase()) ||
      i.type.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Inspection Operations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Pre-rental, post-rental, and periodic multi-point vehicle safety
            certifications
          </p>
        </div>

        <Button
          onClick={() => setIsNewModalOpen(true)}
          size="sm"
          className="gap-1.5 font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          Log New Inspection
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Inspection Due
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                4
              </div>
              <span className="text-[11px] text-amber-600 font-medium">
                Action pending
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
                Today
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                2
              </div>
              <span className="text-[11px] text-blue-600 font-medium">
                Scheduled for 01 Sep
              </span>
            </div>
            <div className="p-2 rounded-md bg-blue-50 text-blue-700">
              <ClipboardCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-rose-800 tracking-wider">
                Failed
              </span>
              <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">
                1
              </div>
              <span className="text-[11px] text-rose-700 font-medium">
                Dispatched to workshop
              </span>
            </div>
            <div className="p-2 rounded-md bg-rose-100 text-rose-700">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-emerald-800 tracking-wider">
                Completed
              </span>
              <div className="text-2xl font-bold text-emerald-800 mt-1 font-mono">
                38
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                Passed this month
              </span>
            </div>
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
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
              placeholder="Search plate, model, inspector..."
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
                <TableHead>Inspection Type</TableHead>
                <TableHead>Recorded Date</TableHead>
                <TableHead>Recorded Odometer</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Notes & Issues</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((insp, idx) => (
                <TableRow
                  key={insp.id}
                  onClick={() => router.push(`/fleet/${insp.vehicleId}`)}
                  className="cursor-pointer hover:bg-neutral-50"
                >
                  <TableCell className="text-center font-medium text-neutral-500 text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-neutral-900">
                    <div className="flex flex-col">
                      <span className="font-bold text-xs">
                        {insp.plateNumber}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {insp.model}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-[11px] font-medium text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                      {insp.type.replace(/_/g, " ")}
                    </span>
                  </TableCell>

                  <TableCell className="font-mono text-neutral-600 text-xs">
                    {formatDate(insp.date)}
                  </TableCell>

                  <TableCell className="font-mono text-neutral-800 text-xs">
                    {formatNumber(insp.odometer)} KM
                  </TableCell>

                  <TableCell className="text-neutral-800 text-xs">
                    {insp.inspectorName}
                  </TableCell>

                  <TableCell className="text-neutral-600 text-xs max-w-xs truncate">
                    {insp.notes || "-"}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={insp.result} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Inspection Dialog */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Vehicle Safety Inspection</DialogTitle>
            <DialogDescription>
              Execute multi-point physical check before releasing or accepting
              fleet return.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Target Vehicle
                </label>
                <select
                  value={selectedPlate}
                  onChange={(e) => setSelectedPlate(e.target.value)}
                  className="w-full h-8 rounded border border-neutral-200 px-2 bg-white text-xs"
                >
                  {mockVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} - {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Inspection Type
                </label>
                <select
                  value={inspType}
                  onChange={(e) => setInspType(e.target.value as any)}
                  className="w-full h-8 rounded border border-neutral-200 px-2 bg-white text-xs"
                >
                  <option value="PERIODIC">Periodic Inspection</option>
                  <option value="PRE_RENTAL">Pre-Rental Dispatch Check</option>
                  <option value="POST_RENTAL">
                    Post-Rental Return Inspection
                  </option>
                </select>
              </div>
            </div>

            {/* Checklist items mock preview */}
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/70 space-y-2">
              <span className="text-[10px] font-semibold uppercase text-neutral-500">
                Multi-Point Check
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-700">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked /> Exterior Body & Glass
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked /> Tire Depth & Lights
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked /> Engine Oil & Fluids
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked /> AC, Brakes &
                  Seatbelts
                </label>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Inspector
              </label>
              <input
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                className="w-full h-8 rounded border border-neutral-200 px-2 bg-white text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                Inspection Verdict
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="verdict"
                    checked={checkPassed}
                    onChange={() => setCheckPassed(true)}
                  />
                  <span className="font-semibold text-emerald-700">
                    PASSED (Fleet Ready)
                  </span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="verdict"
                    checked={!checkPassed}
                    onChange={() => setCheckPassed(false)}
                  />
                  <span className="font-semibold text-rose-700">
                    FAILED (Requires Maintenance)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveInspection}>
              Save Certification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
