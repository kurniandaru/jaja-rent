"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Navigation,
  Radio,
  Search,
  MapPin,
  Car,
  Compass,
  Gauge,
  BatteryCharging,
  Zap,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Building2,
  Layers,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { mockGPSTelemetry, mockVehicles, getGPSTelemetryList, getVehicles } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

// Dynamically import Leaflet Map Component with SSR disabled
const GPSMapView = dynamic(
  () => import("@/components/map/gps-map-view").then((mod) => mod.GPSMapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-500 gap-3 min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-xs font-medium">Memuat peta GPS interaktif...</span>
      </div>
    ),
  }
);

export default function LiveGPSPage() {
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [groupBy, setGroupBy] = React.useState<"company" | "owner">("company");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "MOVING" | "IDLE" | "OFF">("ALL");
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string | null>(null);
  const [visibleVehicleIds, setVisibleVehicleIds] = React.useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = React.useState<{ [key: string]: boolean }>({});

  // Merge GPS telemetry with master vehicle ownership and customer data
  React.useEffect(() => {
    async function loadVehicles() {
      const allVehicles = await getVehicles();
      const gpsList = await getGPSTelemetryList();

      const combined = allVehicles.map((veh) => {
        const gps = gpsList.find((g) => g.vehicleId === veh.id || g.plateNumber === veh.plateNumber);

        // Assign mock coordinates in Jabodetabek area for any unit without active GPS
        const lat = veh.latitude || gps?.latitude || -6.2088 + (Math.random() - 0.5) * 0.15;
        const lng = veh.longitude || gps?.longitude || 106.8456 + (Math.random() - 0.5) * 0.15;

        const isMoving = veh.status === "RENTED" && (veh.speed || (gps?.speed ?? 0)) > 0;
        const isIdle = veh.status === "AVAILABLE" || veh.status === "RESERVED" || (veh.speed === 0);
        const isOff = veh.status === "MAINTENANCE" || veh.status === "DOCUMENT_HOLD" || veh.status === "INACTIVE";

        return {
          vehicleId: veh.id,
          plateNumber: veh.plateNumber,
          model: `${veh.brand} ${veh.model}`,
          brand: veh.brand,
          customerName: veh.currentCustomerName || (veh.businessEligibility === "B2C" ? "Retail B2C Pool" : "Tersedia di Pool"),
          businessType: veh.businessEligibility,
          status: isOff ? "OFFLINE" : "ONLINE",
          rentalStatus: veh.status,
          latitude: lat,
          longitude: lng,
          speed: isMoving ? (veh.speed || gps?.speed || 45) : 0,
          heading: "North-East",
          odometer: veh.odometer,
          batteryLevel: 96,
          ignition: isMoving || (isIdle && veh.status === "RENTED") ? "ON" : "OFF",
          lastUpdate: "3s ago",
          address: veh.locationArea || "Jakarta",
          city: veh.locationCity || "Jakarta",
          ownership: veh.ownership === "JAJA_OWNED" ? "PT Jaja Rent Indonesia" : (veh.vendorName || "Mitra Vendor"),
          ownershipType: veh.ownership,
          driverName: veh.currentDriverName,
        };
      });

      setVehicles(combined);
      setVisibleVehicleIds(new Set(combined.map((v) => v.vehicleId)));
      if (combined.length > 0) {
        setSelectedVehicleId((prev) => prev || combined[0].vehicleId);
      }
    }

    loadVehicles();
  }, []);

  // Filter vehicles based on search and status
  const filteredVehicles = React.useMemo(() => {
    return vehicles.filter((v) => {
      const s = search.toLowerCase();
      const matchesSearch =
        v.plateNumber.toLowerCase().includes(s) ||
        v.model.toLowerCase().includes(s) ||
        v.customerName.toLowerCase().includes(s) ||
        v.ownership.toLowerCase().includes(s) ||
        v.city.toLowerCase().includes(s);

      const isMoving = v.speed > 0 && v.ignition === "ON";
      const isIdle = (v.speed === 0 && v.ignition === "ON") || v.rentalStatus === "AVAILABLE";
      const isOff = v.ignition === "OFF" || v.status === "OFFLINE" || v.rentalStatus === "MAINTENANCE" || v.rentalStatus === "DOCUMENT_HOLD";

      let matchesStatus = true;
      if (statusFilter === "MOVING") matchesStatus = isMoving;
      if (statusFilter === "IDLE") matchesStatus = isIdle;
      if (statusFilter === "OFF") matchesStatus = isOff;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, search, statusFilter]);

  // Group vehicles
  const groupedVehicles = React.useMemo(() => {
    const groups: { [key: string]: typeof filteredVehicles } = {};

    filteredVehicles.forEach((veh) => {
      let groupKey = "";
      if (groupBy === "company") {
        groupKey = veh.customerName || "Pool Standby";
      } else {
        groupKey = veh.ownership || "PT Jaja Rent Indonesia";
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(veh);
    });

    return groups;
  }, [filteredVehicles, groupBy]);

  // Toggle individual vehicle visibility
  const toggleVehicleVisibility = (vehicleId: string) => {
    setVisibleVehicleIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) {
        next.delete(vehicleId);
      } else {
        next.add(vehicleId);
      }
      return next;
    });
  };

  // Toggle all vehicles in a group
  const toggleGroupVisibility = (groupVehicles: typeof filteredVehicles) => {
    const allChecked = groupVehicles.every((v) => visibleVehicleIds.has(v.vehicleId));
    setVisibleVehicleIds((prev) => {
      const next = new Set(prev);
      groupVehicles.forEach((v) => {
        if (allChecked) {
          next.delete(v.vehicleId);
        } else {
          next.add(v.vehicleId);
        }
      });
      return next;
    });
  };

  // Select all visible vehicles
  const selectAll = () => {
    setVisibleVehicleIds(new Set(vehicles.map((v) => v.vehicleId)));
  };

  // Clear all visible vehicles
  const clearAll = () => {
    setVisibleVehicleIds(new Set());
  };

  const activeVehicle = vehicles.find((v) => v.vehicleId === selectedVehicleId) || vehicles[0];

  const totalMoving = vehicles.filter((v) => v.speed > 0 && v.ignition === "ON").length;
  const totalIdle = vehicles.filter((v) => (v.speed === 0 && v.ignition === "ON") || v.rentalStatus === "AVAILABLE").length;
  const totalOff = vehicles.filter((v) => v.ignition === "OFF" || v.rentalStatus === "MAINTENANCE" || v.rentalStatus === "DOCUMENT_HOLD").length;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] w-full overflow-hidden bg-neutral-50">
      {/* Top Controls Bar */}
      <div className="bg-white border-b border-neutral-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-bold text-neutral-900 leading-none">
              Live Fleet GPS Tracking
            </h1>
            <span className="text-[11px] text-neutral-500 font-medium">
              Memantau {vehicles.length} unit secara real-time &middot; {visibleVehicleIds.size} unit aktif di peta
            </span>
          </div>
        </div>

        {/* Status Counts Strip */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              statusFilter === "ALL"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            Semua ({vehicles.length})
          </button>
          <button
            onClick={() => setStatusFilter("MOVING")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === "MOVING"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Bergerak ({totalMoving})
          </button>
          <button
            onClick={() => setStatusFilter("IDLE")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === "IDLE"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Idle ({totalIdle})
          </button>
          <button
            onClick={() => setStatusFilter("OFF")}
            className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
              statusFilter === "OFF"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Off/Maint ({totalOff})
          </button>
        </div>
      </div>

      {/* Main Split View: Left Selector Panel + Right Leaflet Map */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Control & Grouped Checklist Panel */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-r border-neutral-200 flex flex-col shrink-0 h-full overflow-hidden z-10 shadow-sm">
          {/* Panel Search & Group Switcher */}
          <div className="p-3 border-b border-neutral-200 space-y-2.5 bg-neutral-50/50">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Cari plat, model, klien, vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-white"
              />
            </div>

            {/* Group Switcher Tabs */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Kelompokkan:
              </span>
              <div className="flex rounded-md bg-neutral-200/70 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setGroupBy("company")}
                  className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                    groupBy === "company"
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Building2 className="h-3 w-3" />
                  Perusahaan
                </button>
                <button
                  onClick={() => setGroupBy("owner")}
                  className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                    groupBy === "owner"
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Layers className="h-3 w-3" />
                  Pemilik / Vendor
                </button>
              </div>
            </div>

            {/* Bulk Selection Actions */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-200/60">
              <span className="text-neutral-500 text-[11px]">
                Centang untuk tampil di peta
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="text-primary hover:underline font-bold text-[11px]"
                >
                  Centang Semua
                </button>
                <span className="text-neutral-300">&middot;</span>
                <button
                  onClick={clearAll}
                  className="text-neutral-500 hover:text-neutral-900 text-[11px]"
                >
                  Hapus Semua
                </button>
              </div>
            </div>
          </div>

          {/* Grouped Vehicle List */}
          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 p-1">
            {Object.keys(groupedVehicles).length === 0 ? (
              <div className="p-8 text-center text-neutral-400 text-xs">
                Tidak ada kendaraan yang sesuai filter.
              </div>
            ) : (
              Object.entries(groupedVehicles).map(([groupName, groupUnits]) => {
                const groupCheckedCount = groupUnits.filter((u) => visibleVehicleIds.has(u.vehicleId)).length;
                const isGroupAllChecked = groupCheckedCount === groupUnits.length;
                const isGroupCollapsed = collapsedGroups[groupName];

                return (
                  <div key={groupName} className="py-1">
                    {/* Group Header */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 bg-neutral-100/70 hover:bg-neutral-100 rounded-md transition-colors">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <button
                          onClick={() => toggleGroupVisibility(groupUnits)}
                          className="text-neutral-600 hover:text-neutral-900"
                          title="Centang/Hapus grup ini"
                        >
                          {isGroupAllChecked ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : groupCheckedCount > 0 ? (
                            <div className="h-4 w-4 rounded bg-primary/20 border border-primary flex items-center justify-center">
                              <span className="w-2 h-0.5 bg-primary"></span>
                            </div>
                          ) : (
                            <Square className="h-4 w-4 text-neutral-400" />
                          )}
                        </button>

                        <button
                          onClick={() =>
                            setCollapsedGroups((prev) => ({
                              ...prev,
                              [groupName]: !prev[groupName],
                            }))
                          }
                          className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 truncate text-left flex-1"
                        >
                          {groupBy === "company" ? (
                            <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          ) : (
                            <Layers className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                          )}
                          <span className="truncate">{groupName}</span>
                          <span className="text-[10px] text-neutral-500 font-normal ml-1 shrink-0">
                            ({groupCheckedCount}/{groupUnits.length})
                          </span>
                        </button>
                      </div>

                      <button
                        onClick={() =>
                          setCollapsedGroups((prev) => ({
                            ...prev,
                            [groupName]: !prev[groupName],
                          }))
                        }
                        className="text-neutral-400 hover:text-neutral-700 p-0.5"
                      >
                        {isGroupCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Group Items */}
                    {!isGroupCollapsed && (
                      <div className="space-y-0.5 mt-1 pl-1">
                        {groupUnits.map((v) => {
                          const isChecked = visibleVehicleIds.has(v.vehicleId);
                          const isSelected = selectedVehicleId === v.vehicleId;
                          const isMoving = v.speed > 0 && v.ignition === "ON";
                          const isIdle = (v.speed === 0 && v.ignition === "ON") || v.rentalStatus === "AVAILABLE";
                          const isOff = v.ignition === "OFF" || v.rentalStatus === "MAINTENANCE" || v.rentalStatus === "DOCUMENT_HOLD";

                          return (
                            <div
                              key={v.vehicleId}
                              onClick={() => {
                                setSelectedVehicleId(v.vehicleId);
                                if (!isChecked) {
                                  toggleVehicleVisibility(v.vehicleId);
                                }
                              }}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-primary/10 border-l-3 border-primary"
                                  : "hover:bg-neutral-50"
                              }`}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVehicleVisibility(v.vehicleId);
                                }}
                                className="text-neutral-500 hover:text-neutral-900 shrink-0"
                              >
                                {isChecked ? (
                                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                                ) : (
                                  <Square className="h-3.5 w-3.5 text-neutral-300" />
                                )}
                              </button>

                              {/* Status Dot */}
                              <span
                                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                  isMoving
                                    ? "bg-emerald-500 shadow-xs shadow-emerald-500/50 animate-pulse"
                                    : isIdle
                                    ? "bg-blue-500"
                                    : "bg-rose-500"
                                }`}
                              />

                              {/* Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-xs text-neutral-900 tracking-tight">
                                    {v.plateNumber}
                                  </span>
                                  {isMoving ? (
                                    <span className="font-mono text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                                      {v.speed} km/h
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-neutral-400 font-medium">
                                      {isIdle ? "Idle" : "Off"}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-neutral-500 truncate flex items-center justify-between">
                                  <span className="truncate">{v.model}</span>
                                  <span className="text-[10px] text-neutral-400 shrink-0 ml-1">
                                    {v.city}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Active Selected Vehicle Bottom Quick-Info Bar */}
          {activeVehicle && (
            <div className="p-3 bg-neutral-900 text-white border-t border-neutral-800 shrink-0 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-neutral-800">
                <div>
                  <span className="font-bold text-white text-sm">{activeVehicle.plateNumber}</span>
                  <span className="text-neutral-400 text-[11px] block">{activeVehicle.model}</span>
                </div>
                <Link
                  href={`/fleet/${activeVehicle.plateNumber.replace(/\s+/g, "-")}`}
                  className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Detail Unit &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-neutral-300">
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Speed / Kontak:</span>
                  <span className="font-mono font-bold text-white">{activeVehicle.speed} km/h</span> &middot; {activeVehicle.ignition}
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px] uppercase font-semibold">Pengguna:</span>
                  <span className="font-semibold text-white truncate block">{activeVehicle.customerName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Map Canvas Area */}
        <div className="flex-1 h-full w-full relative">
          <GPSMapView
            vehicles={vehicles}
            visibleVehicleIds={visibleVehicleIds}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(id) => setSelectedVehicleId(id)}
          />
        </div>
      </div>
    </div>
  );
}
