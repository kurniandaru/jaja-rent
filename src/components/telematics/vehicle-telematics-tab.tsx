"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  Radio,
  Activity,
  Zap,
  Battery,
  MapPin,
  Clock,
  Car,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import type { Vehicle } from "@/lib/types/fleet";
import type { OperationalAlertRecord } from "@/lib/types/operational-alert";
import type { VehicleTripRecord } from "@/lib/types/telematics";
import {
  queryOperationalAlerts,
  acknowledgeAlertAction,
  resolveAlertAction,
} from "@/lib/services/operational-alert-service";
import {
  getTripsForVehicle,
  getTelematicsEventsForVehicle,
} from "@/lib/services/gps-event-engine";
import { Button } from "@/components/ui/button";

const VehicleGPSHistoryMap = dynamic(
  () =>
    import("@/components/fleet/vehicle-gps-history-map").then(
      (mod) => mod.VehicleGPSHistoryMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 flex items-center justify-center bg-neutral-100 rounded-xl text-neutral-400 text-xs">
        Memuat riwayat rute GPS...
      </div>
    ),
  },
);

interface VehicleTelematicsTabProps {
  vehicle: Vehicle;
}

export function VehicleTelematicsTab({ vehicle }: VehicleTelematicsTabProps) {
  const [timeRange, setTimeRange] = React.useState<
    "TODAY" | "YESTERDAY" | "7DAYS"
  >("TODAY");
  const [alerts, setAlerts] = React.useState<OperationalAlertRecord[]>([]);
  const [trips, setTrips] = React.useState<VehicleTripRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const vAlerts = await queryOperationalAlerts({ vehicleId: vehicle.id });
      const vTrips = getTripsForVehicle(vehicle.id);
      setAlerts(vAlerts);
      setTrips(vTrips);
    } finally {
      setIsLoading(false);
    }
  }, [vehicle.id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAcknowledge = async (alertId: string) => {
    await acknowledgeAlertAction(
      alertId,
      "Operations Dispatcher",
      "Menerima notifikasi insiden.",
    );
    await loadData();
  };

  const handleResolve = async (alertId: string) => {
    await resolveAlertAction(
      alertId,
      "Operations Dispatcher",
      "Insiden telah ditangani dengan supir.",
    );
    await loadData();
  };

  const isMoving = vehicle.status === "RENTED" && (vehicle.speed || 0) > 0;
  const isOffline = vehicle.gpsStatus === "OFFLINE";
  const overspeedCount = alerts.filter(
    (a) => a.alertType === "OVERSPEED",
  ).length;
  const longStopCount = alerts.filter(
    (a) => a.alertType === "LONG_STOP",
  ).length;
  const totalDistanceKm = trips.reduce((acc, t) => acc + t.distanceKm, 0);

  return (
    <div className="space-y-6">
      {/* 1. Live Status Telematics Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-3">
          <div className="flex items-center gap-2.5">
            <Radio
              className={`w-5 h-5 ${
                isOffline
                  ? "text-neutral-400"
                  : isMoving
                    ? "text-emerald-500 animate-pulse"
                    : "text-blue-500"
              }`}
            />
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm">
                Status Telematika Real-Time (Perangkat GPS)
              </h3>
              <p className="text-[11px] text-neutral-400">
                Provider: Teltonika FMC130 4G Tracker (IMEI: 869402058192019)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                isOffline
                  ? "bg-neutral-100 text-neutral-600"
                  : isMoving
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {isOffline
                ? "OFFLINE"
                : isMoving
                  ? `BERGERAK (${vehicle.speed} km/h)`
                  : "BERHENTI (IDLE)"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-neutral-400" />
              Kecepatan Saat Ini
            </div>
            <div className="text-xl font-bold text-neutral-900 mt-1">
              {vehicle.speed || 0}{" "}
              <span className="text-xs font-normal text-neutral-500">km/h</span>
            </div>
          </div>

          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-neutral-400" />
              Status Kontak (Ignition)
            </div>
            <div className="text-xl font-bold text-neutral-900 mt-1">
              {isMoving || vehicle.status === "RENTED" ? (
                <span className="text-emerald-600">ON</span>
              ) : (
                <span className="text-neutral-500">OFF</span>
              )}
            </div>
          </div>

          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Battery className="w-3.5 h-3.5 text-neutral-400" />
              Daya Baterai GPS
            </div>
            <div className="text-xl font-bold text-neutral-900 mt-1">
              98%{" "}
              <span className="text-xs font-normal text-emerald-600">
                (Optimal)
              </span>
            </div>
          </div>

          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Sinyal & Update Terakhir
            </div>
            <div className="text-sm font-semibold text-neutral-900 mt-1">
              {vehicle.lastGpsUpdate || "1 menit yang lalu"}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Satelit: 14 GPS/GLONASS
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-neutral-600 flex items-center gap-1.5 bg-neutral-50/70 p-2.5 rounded-lg">
          <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span>
            Lokasi:{" "}
            <strong>
              {vehicle.locationArea || "Sudirman Central Business District"}
            </strong>
            , {vehicle.locationCity || "Jakarta Selatan"} (
            {vehicle.latitude?.toFixed(4)}, {vehicle.longitude?.toFixed(4)})
          </span>
        </div>
      </div>

      {/* 2. Today's Performance Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <div className="text-xs text-neutral-500 font-medium">
            Jarak Tempuh Hari Ini
          </div>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {totalDistanceKm > 0 ? totalDistanceKm.toFixed(1) : "34.5"}{" "}
            <span className="text-xs font-normal text-neutral-500">KM</span>
          </div>
          <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> Akumulasi rute aktif
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <div className="text-xs text-neutral-500 font-medium">
            Jumlah Trip Perjalanan
          </div>
          <div className="text-xl font-bold text-neutral-900 mt-1">
            {trips.length || 2} Trip
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Rata-rata 42 km/h
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <div className="text-xs text-neutral-500 font-medium">
            Kejadian Overspeed
          </div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {overspeedCount}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Batas: 80 km/h
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
          <div className="text-xs text-neutral-500 font-medium">
            Berhenti Lama (&gt; 3 Jam)
          </div>
          <div className="text-xl font-bold text-neutral-800 mt-1">
            {longStopCount}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Posisi kontak mati
          </div>
        </div>
      </div>

      {/* 3. Route Trail & History Replay Map */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm">
              Rekam Jejak Rute Perjalanan (Telemetry Trail)
            </h4>
            <p className="text-xs text-neutral-400">
              Visualisasi rute GPS, titik perhentian, dan rekaman kecepatan
              perjalanan unit.
            </p>
          </div>

          <div className="flex bg-neutral-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setTimeRange("TODAY")}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === "TODAY"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setTimeRange("YESTERDAY")}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === "YESTERDAY"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              Kemarin
            </button>
            <button
              onClick={() => setTimeRange("7DAYS")}
              className={`px-3 py-1 rounded-md transition-colors ${
                timeRange === "7DAYS"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500"
              }`}
            >
              7 Hari Terakhir
            </button>
          </div>
        </div>

        <VehicleGPSHistoryMap
          vehiclePlate={vehicle.plateNumber}
          vehicleModel={`${vehicle.brand} ${vehicle.model}`}
          startDate={
            timeRange === "TODAY" ? "Hari ini 00:00" : "7 hari terakhir"
          }
          endDate="Sekarang"
          baseCoordinates={{
            lat: vehicle.latitude || -6.2255,
            lng: vehicle.longitude || 106.8095,
          }}
        />
      </div>

      {/* 4. Operational Alerts for this vehicle */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Riwayat Insiden & Peringatan Operasional ({alerts.length})
          </h4>
        </div>

        {alerts.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-80" />
            Tidak ada catatan peringatan operasional untuk unit ini.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        alt.severity === "CRITICAL"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="font-semibold text-neutral-900 text-xs">
                      {alt.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        alt.status === "OPEN"
                          ? "bg-red-50 text-red-700"
                          : alt.status === "ACKNOWLEDGED"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {alt.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {alt.description}
                  </p>
                  {alt.resolutionNote && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                      Resolusi: {alt.resolutionNote}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {alt.status === "OPEN" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-amber-700 border-amber-300"
                      onClick={() => handleAcknowledge(alt.id)}
                    >
                      Tanggapi
                    </Button>
                  )}
                  {alt.status !== "RESOLVED" && (
                    <Button
                      size="sm"
                      className="h-7 text-xs bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => handleResolve(alt.id)}
                    >
                      Selesaikan
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
