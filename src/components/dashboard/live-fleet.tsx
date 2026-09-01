"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Navigation,
  Radio,
  MapPin,
  Car,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Compass,
} from "lucide-react";
import { mockGPSTelemetry } from "@/lib/data";

export function LiveFleet() {
  const router = useRouter();
  const [filter, setFilter] = React.useState<
    "ALL" | "B2C" | "B2B" | "AVAILABLE" | "RENTED" | "MAINTENANCE"
  >("ALL");
  const [selectedVehicleId, setSelectedVehicleId] = React.useState<string>(
    mockGPSTelemetry[0]?.vehicleId || "",
  );

  const filteredList = mockGPSTelemetry.filter((v) => {
    if (filter === "ALL") return true;
    if (filter === "B2C") return v.businessType === "B2C";
    if (filter === "B2B") return v.businessType === "B2B";
    if (filter === "AVAILABLE") return v.rentalStatus === "AVAILABLE";
    if (filter === "RENTED") return v.rentalStatus === "RENTED";
    if (filter === "MAINTENANCE") return v.rentalStatus === "MAINTENANCE";
    return true;
  });

  const activeVehicle =
    mockGPSTelemetry.find((v) => v.vehicleId === selectedVehicleId) ||
    mockGPSTelemetry[0];

  return (
    <Card className="border-neutral-200">
      <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-700">
            <Radio className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base font-semibold text-neutral-900">
                Live Fleet Tracking
              </CardTitle>
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                Active GPS
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Real-time telemetry and geofence status across Greater Jakarta &
              West Java
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/operations/gps">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Maximize2 className="h-3.5 w-3.5" />
              Full Screen Map
            </Button>
          </Link>
        </div>
      </CardHeader>

      {/* Filter Tabs */}
      <div className="px-4 py-2 bg-neutral-50/70 border-b border-neutral-100 flex flex-wrap gap-1.5 text-xs">
        {(
          ["ALL", "B2C", "B2B", "AVAILABLE", "RENTED", "MAINTENANCE"] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              filter === tab
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:bg-neutral-200/70"
            }`}
          >
            {tab === "ALL" ? "All Units" : tab}
          </button>
        ))}
      </div>

      <CardContent className="p-0 grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">
        {/* Mock Map Canvas Area */}
        <div className="lg:col-span-7 bg-neutral-900 text-white relative overflow-hidden flex flex-col justify-between p-4 min-h-[260px] lg:min-h-0">
          {/* Stylized Map Grid & Terrain Effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Map City Labels & Roads simulation */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top expressway line */}
            <div className="absolute top-1/4 left-0 right-0 h-[2px] bg-neutral-700/60 rotate-6" />
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-neutral-700/60 -rotate-3" />
            <div className="absolute left-1/3 top-0 bottom-0 w-[2px] bg-neutral-700/60 rotate-12" />

            <span className="absolute top-6 left-8 text-[11px] font-mono tracking-widest text-neutral-500 uppercase">
              Jabodetabek &middot; Zone A
            </span>
            <span className="absolute top-12 left-1/4 text-[10px] text-neutral-600 font-semibold uppercase">
              Jakarta Pusat
            </span>
            <span className="absolute bottom-16 left-12 text-[10px] text-neutral-600 font-semibold uppercase">
              Jakarta Selatan / SCBD
            </span>
            <span className="absolute bottom-10 right-12 text-[10px] text-neutral-600 font-semibold uppercase">
              Bekasi Industrial
            </span>
            <span className="absolute top-10 right-16 text-[10px] text-neutral-600 font-semibold uppercase">
              Tangerang Airport
            </span>
          </div>

          {/* Interactive Vehicle Markers on Map */}
          <div className="relative w-full h-full min-h-[220px]">
            {filteredList.map((veh, idx) => {
              const isSelected = veh.vehicleId === selectedVehicleId;
              // Map simulated coordinates to percentages
              const topPositions = [45, 25, 38, 55, 20, 68, 62, 30];
              const leftPositions = [35, 22, 42, 60, 15, 40, 20, 75];
              const top = topPositions[idx % topPositions.length];
              const left = leftPositions[idx % leftPositions.length];

              return (
                <button
                  key={veh.vehicleId}
                  onClick={() => setSelectedVehicleId(veh.vehicleId)}
                  style={{ top: `${top}%`, left: `${left}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold transition-all transform hover:scale-110 z-10 ${
                    isSelected
                      ? "bg-white text-neutral-900 shadow-xl ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900 z-20"
                      : veh.status === "ONLINE"
                        ? "bg-neutral-800/90 text-neutral-200 border border-neutral-700 hover:bg-neutral-700"
                        : "bg-rose-950/80 text-rose-300 border border-rose-800"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      veh.status === "ONLINE"
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-rose-500"
                    }`}
                  />
                  <span>{veh.plateNumber}</span>
                  {isSelected && (
                    <span className="text-[9px] px-1 bg-neutral-900 text-white rounded">
                      {veh.speed} km/h
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Vehicle Map Floating Overlay */}
          {activeVehicle && (
            <div className="relative z-20 bg-neutral-950/90 border border-neutral-800 rounded-md p-3 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {activeVehicle.plateNumber}
                  </span>
                  <span className="text-neutral-400 text-xs">
                    {activeVehicle.model}
                  </span>
                  <StatusBadge status={activeVehicle.status} />
                </div>
                <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                  <MapPin className="h-3 w-3 text-neutral-500" />
                  <span>{activeVehicle.address}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-neutral-300 font-mono text-xs">
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">
                    Speed
                  </span>
                  <span className="font-bold text-white">
                    {activeVehicle.speed} km/h
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase">
                    Heading
                  </span>
                  <span className="font-bold text-white">
                    {activeVehicle.heading}
                  </span>
                </div>
                <Link href={`/fleet/${activeVehicle.vehicleId}`}>
                  <Button
                    size="xs"
                    variant="secondary"
                    className="gap-1 text-[11px]"
                  >
                    Vehicle Detail <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Side Vehicle List */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-neutral-200 flex flex-col max-h-[380px] bg-white">
          <div className="p-3 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between text-xs font-semibold text-neutral-600">
            <span>Live Telemetry Feed ({filteredList.length})</span>
            <span className="text-[10px] text-neutral-400 uppercase">
              Auto-sync 5s
            </span>
          </div>

          <div className="overflow-y-auto divide-y divide-neutral-100 flex-1">
            {filteredList.map((veh) => {
              const isSelected = veh.vehicleId === selectedVehicleId;
              return (
                <div
                  key={veh.vehicleId}
                  onClick={() => setSelectedVehicleId(veh.vehicleId)}
                  className={`p-3 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                    isSelected
                      ? "bg-neutral-100/90 border-l-4 border-neutral-900 pl-2.5"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-neutral-900">
                        {veh.plateNumber}
                      </span>
                      <span className="text-[11px] text-neutral-500 truncate">
                        {veh.model}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-700 font-medium truncate">
                      {veh.customerName || "Available in Pool"}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                      <span className="truncate">{veh.city}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-medium">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          veh.status === "ONLINE"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-rose-500"
                        }`}
                      />
                      <span
                        className={
                          veh.status === "ONLINE"
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }
                      >
                        {veh.status === "ONLINE" ? "Online" : "Offline"}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {veh.lastUpdate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
