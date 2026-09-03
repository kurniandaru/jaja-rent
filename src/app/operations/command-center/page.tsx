"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ShieldAlert,
  Car,
  Activity,
  AlertTriangle,
  Radio,
  Clock,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { getVehicles } from "@/lib/data/vehicles";
import {
  queryOperationalAlerts,
  acknowledgeAlertAction,
  resolveAlertAction,
} from "@/lib/services/operational-alert-service";
import type { OperationalAlertRecord } from "@/lib/types/operational-alert";
import { ActiveIncidentsTable } from "@/components/telematics/active-incidents-table";
import { Button } from "@/components/ui/button";

// Dynamically import Leaflet Map with SSR disabled
const LiveCommandMap = dynamic(
  () =>
    import("@/components/telematics/live-command-map").then(
      (mod) => mod.LiveCommandMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] flex flex-col items-center justify-center bg-neutral-100 rounded-xl text-neutral-400 gap-2 border border-neutral-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-xs">Memuat Peta Fleet Command Center...</span>
      </div>
    ),
  },
);

export default function FleetCommandCenterPage() {
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [alerts, setAlerts] = React.useState<OperationalAlertRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<
    string | null
  >(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const allVehicles = await getVehicles();
      const allAlerts = await queryOperationalAlerts({ status: "ALL" });

      const activeAlerts = allAlerts.filter(
        (a) => a.status === "OPEN" || a.status === "ACKNOWLEDGED",
      );

      // Map vehicles to live command state
      const mapped = allVehicles.map((v) => {
        const vehicleAlert = activeAlerts.find(
          (a) =>
            a.vehicleId.toLowerCase() === v.id.toLowerCase() ||
            (a.vehiclePlate &&
              a.vehiclePlate.toLowerCase() === v.plateNumber.toLowerCase()),
        );

        let liveStatus: "MOVING" | "STOPPED" | "OFFLINE" | "ALERT" = "STOPPED";
        if (vehicleAlert) {
          liveStatus = "ALERT";
        } else if (v.gpsStatus === "OFFLINE") {
          liveStatus = "OFFLINE";
        } else if (v.status === "RENTED" && (v.speed || 0) > 0) {
          liveStatus = "MOVING";
        }

        return {
          vehicleId: v.id,
          plateNumber: v.plateNumber,
          model: `${v.brand} ${v.model}`,
          latitude: v.latitude || -6.2088,
          longitude: v.longitude || 106.8456,
          speed: v.speed || 0,
          status: liveStatus,
          customerName: v.currentCustomerName,
          driverName: v.currentDriverName,
          alertTitle: vehicleAlert?.title,
        };
      });

      setVehicles(mapped);
      setAlerts(activeAlerts);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAcknowledge = async (alertId: string, note?: string) => {
    await acknowledgeAlertAction(alertId, "Operations Dispatcher", note);
    await loadData();
  };

  const handleResolve = async (alertId: string, resolutionNote: string) => {
    await resolveAlertAction(alertId, "Operations Dispatcher", resolutionNote);
    await loadData();
  };

  const movingCount = vehicles.filter((v) => v.status === "MOVING").length;
  const stoppedCount = vehicles.filter((v) => v.status === "STOPPED").length;
  const offlineCount = vehicles.filter((v) => v.status === "OFFLINE").length;
  const alertCount = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL");

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-red-600 animate-pulse" />
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
              Fleet Command Center
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Sistem pemantauan real-time telematika, deteksi insiden, kepatuhan
            batas wilayah, dan aksi operasional armada.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh Telematika
          </Button>
          <Link href="/operations/gps">
            <Button size="sm" variant="secondary" className="h-8 text-xs gap-1">
              Peta Armada Penuh <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">
              Total Armada GPS
            </div>
            <div className="text-2xl font-bold text-neutral-900 mt-1">
              {vehicles.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">
              Bergerak (Moving)
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {movingCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">
              Berhenti / Idle
            </div>
            <div className="text-2xl font-bold text-neutral-800 mt-1">
              {stoppedCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-neutral-500 font-medium">
              Alert Operasional
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {alertCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Critical Alert Banner (if any) */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-sm animate-pulse">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-900 text-sm">
              PERHATIAN SEGERA: {criticalAlerts.length} Insiden Kritis
              Membutuhkan Tindakan Dispatcher!
            </div>
            <div className="text-xs text-red-700 mt-0.5">
              {criticalAlerts
                .map((c) => `${c.vehiclePlate}: ${c.title}`)
                .join(" | ")}
            </div>
          </div>
        </div>
      )}

      {/* Live Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">
            Live Fleet Map & Geofence Boundaries
          </h2>
          <span className="text-[11px] text-neutral-400">
            Klik pin kendaraan untuk melihat status dan membuka profil unit
          </span>
        </div>
        <LiveCommandMap
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onSelectVehicle={setSelectedVehicleId}
        />
      </div>

      {/* Active Incidents Table */}
      <ActiveIncidentsTable
        alerts={alerts}
        onAcknowledge={handleAcknowledge}
        onResolve={handleResolve}
      />
    </div>
  );
}
