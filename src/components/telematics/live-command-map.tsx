"use client";

import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { activeGeofences } from "@/lib/services/gps-event-engine";

export interface LiveCommandVehicle {
  vehicleId: string;
  plateNumber: string;
  model: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: "MOVING" | "STOPPED" | "OFFLINE" | "ALERT";
  customerName?: string;
  driverName?: string;
  alertTitle?: string;
}

interface LiveCommandMapProps {
  vehicles: LiveCommandVehicle[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (id: string) => void;
}

export function LiveCommandMap({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
}: LiveCommandMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<{ [id: string]: L.Marker }>({});

  React.useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center around Greater Jakarta (Jabodetabek)
    const map = L.map(mapContainerRef.current, {
      center: [-6.2088, 106.8456],
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Render active geofences on map
    activeGeofences.forEach((gf) => {
      const isRestricted = gf.type === "RESTRICTED_AREA";
      L.circle([gf.latitude, gf.longitude], {
        color: isRestricted ? "#dc2626" : "#2563eb",
        fillColor: isRestricted ? "#fee2e2" : "#dbeafe",
        fillOpacity: 0.25,
        radius: gf.radiusMeters,
        weight: 2,
        dashArray: isRestricted ? "6, 6" : undefined,
      })
        .addTo(map)
        .bindPopup(
          `<div class="text-xs p-1"><strong>${gf.name}</strong><br/><span class="text-neutral-500">${gf.type} (Radius: ${gf.radiusMeters}m)</span></div>`,
        );
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update vehicle markers
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    vehicles.forEach((v) => {
      let pinColor = "#2563eb"; // Blue for stopped
      let statusLabel = "STOPPED";

      if (v.status === "ALERT") {
        pinColor = "#dc2626"; // Red for alert
        statusLabel = "ALERT";
      } else if (v.status === "MOVING") {
        pinColor = "#16a34a"; // Green for moving
        statusLabel = `${v.speed} km/h`;
      } else if (v.status === "OFFLINE") {
        pinColor = "#64748b"; // Slate for offline
        statusLabel = "OFFLINE";
      }

      const customIcon = L.divIcon({
        className: "custom-telematics-pin",
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background-color: ${pinColor}; color: white; font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.3); border: 2px solid white; white-space: nowrap;">
              ${statusLabel}
            </div>
            <div style="width: 12px; height: 12px; background-color: ${pinColor}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); margin-top: -3px;"></div>
          </div>
        `,
        iconSize: [60, 36],
        iconAnchor: [30, 32],
      });

      const marker = L.marker([v.latitude, v.longitude], {
        icon: customIcon,
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px; padding: 4px;">
          <div style="font-weight: bold; font-size: 13px; color: #1e293b;">${v.plateNumber}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${v.model}</div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 4px; display: grid; gap: 2px;">
            <div><strong>Kecepatan:</strong> ${v.speed} km/h</div>
            <div><strong>Penyewa:</strong> ${v.customerName || "-"}</div>
            <div><strong>Supir:</strong> ${v.driverName || "Self-Drive"}</div>
            ${v.alertTitle ? `<div style="color: #dc2626; font-weight: bold; margin-top: 4px;">⚠️ ${v.alertTitle}</div>` : ""}
          </div>
          <div style="margin-top: 8px; text-align: right;">
            <a href="/fleet/${v.vehicleId}" style="color: #2563eb; text-decoration: underline; font-weight: 500; font-size: 11px;">Buka Detail Unit &rarr;</a>
          </div>
        </div>
      `);

      if (onSelectVehicle) {
        marker.on("click", () => onSelectVehicle(v.vehicleId));
      }

      markersRef.current[v.vehicleId] = marker;
    });
  }, [vehicles, onSelectVehicle]);

  // Pan to selected vehicle if any
  React.useEffect(() => {
    if (!selectedVehicleId || !mapInstanceRef.current) return;
    const selected = vehicles.find((v) => v.vehicleId === selectedVehicleId);
    if (selected) {
      mapInstanceRef.current.panTo([selected.latitude, selected.longitude], {
        animate: true,
        duration: 0.8,
      });
      const marker = markersRef.current[selectedVehicleId];
      if (marker) marker.openPopup();
    }
  }, [selectedVehicleId, vehicles]);

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-neutral-200 shadow-sm z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Legend Badge */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-lg p-2.5 shadow-md z-[1000] text-[11px] flex flex-col gap-1.5 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
          <span>Bergerak (Moving)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          <span>Berhenti (Stopped/Idle)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600"></span>
          <span>Alert Aktif (Overspeed/Zone)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-500"></span>
          <span>GPS Offline</span>
        </div>
      </div>
    </div>
  );
}
