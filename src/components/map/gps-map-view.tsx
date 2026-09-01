"use client";

import * as React from "react";
import L from "leaflet";
import { GPSTelemetry } from "@/lib/types/operations";
import { formatNumber } from "@/lib/utils";

interface GPSMapViewProps {
  vehicles: (GPSTelemetry & {
    brand?: string;
    driverName?: string;
    ownership?: string;
    contractNumber?: string;
  })[];
  visibleVehicleIds: Set<string>;
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
}

export function GPSMapView({
  vehicles,
  visibleVehicleIds,
  selectedVehicleId,
  onSelectVehicle,
}: GPSMapViewProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const markersRef = React.useRef<{ [id: string]: L.Marker }>({});
  const [mapStyle, setMapStyle] = React.useState<"voyager" | "osm" | "dark">("voyager");

  // Initialize Leaflet Map
  React.useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center around Jakarta Metropolitan Area
    const map = L.map(mapContainerRef.current, {
      center: [-6.2088, 106.8456],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapStyle changes
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    let attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';

    if (mapStyle === "osm") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';
    } else if (mapStyle === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
  }, [mapStyle]);

  // Update Markers based on visible vehicles
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers that are no longer visible
    Object.keys(markersRef.current).forEach((id) => {
      if (!visibleVehicleIds.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Add or update markers for visible vehicles
    vehicles.forEach((v) => {
      if (!visibleVehicleIds.has(v.vehicleId)) return;

      const isMoving = v.speed > 0 && v.ignition === "ON";
      const isIdle = (v.speed === 0 && v.ignition === "ON") || v.rentalStatus === "AVAILABLE";
      const isOff = v.ignition === "OFF" || v.status === "OFFLINE" || (v.rentalStatus as string) === "MAINTENANCE" || (v.rentalStatus as string) === "DOCUMENT_HOLD";

      // Determine marker color and style class
      let bgColor = "bg-emerald-500 text-white";
      let pulseClass = "marker-pulse-moving";
      let statusLabel = "Bergerak";
      let statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

      if (isIdle) {
        bgColor = "bg-blue-500 text-white";
        pulseClass = "marker-pulse-idle";
        statusLabel = "Idle / Standby";
        statusColor = "text-blue-700 bg-blue-50 border-blue-200";
      } else if (isOff) {
        bgColor = "bg-rose-500 text-white";
        pulseClass = "";
        statusLabel = (v.rentalStatus as string) === "MAINTENANCE" ? "Maintenance" : "Off / Parkir";
        statusColor = "text-rose-700 bg-rose-50 border-rose-200";
      }

      const iconHtml = `
        <div class="custom-vehicle-marker relative ${bgColor} ${pulseClass} w-9 h-9 flex items-center justify-center rounded-full border-2 border-white font-bold text-[11px] shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
          ${
            isMoving
              ? `<span class="absolute -bottom-1 -right-1 bg-black text-emerald-400 text-[9px] font-mono px-1 py-0.2 rounded-full font-bold border border-white/80">${v.speed}k</span>`
              : ""
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-div-icon",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
      });

      const popupContent = `
        <div class="p-4 text-neutral-900 min-w-[260px] max-w-[320px] font-sans">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100">
            <div>
              <span class="text-sm font-bold text-neutral-900 tracking-tight block">${v.plateNumber}</span>
              <span class="text-xs text-neutral-500 font-medium">${v.model}</span>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}">
              ${statusLabel}
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex items-center justify-between text-neutral-600">
              <span class="text-neutral-400">Kecepatan:</span>
              <span class="font-mono font-bold text-neutral-900">${v.speed} km/jam</span>
            </div>

            <div class="flex items-center justify-between text-neutral-600">
              <span class="text-neutral-400">Status Kontak (Ignition):</span>
              <span class="font-semibold ${v.ignition === "ON" ? "text-emerald-600" : "text-neutral-500"}">${v.ignition}</span>
            </div>

            <div class="flex items-center justify-between text-neutral-600">
              <span class="text-neutral-400">Odometer:</span>
              <span class="font-mono font-semibold text-neutral-800">${formatNumber(v.odometer)} KM</span>
            </div>

            <div class="pt-1.5 border-t border-neutral-100">
              <span class="text-neutral-400 block text-[10px] uppercase font-semibold">Pengguna / Klien:</span>
              <span class="font-semibold text-neutral-900 block truncate">${v.customerName || "Standby di Pool Jaja"}</span>
            </div>

            <div>
              <span class="text-neutral-400 block text-[10px] uppercase font-semibold">Lokasi Terkini:</span>
              <span class="text-neutral-700 block text-[11px] leading-snug">${v.address}, ${v.city}</span>
            </div>
          </div>

          <div class="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between">
            <span class="text-[10px] text-neutral-400">Updated: ${v.lastUpdate}</span>
            <a href="/fleet/${v.plateNumber.replace(/\s+/g, "-")}" class="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
              Lihat Unit &rarr;
            </a>
          </div>
        </div>
      `;

      if (markersRef.current[v.vehicleId]) {
        // Update existing marker
        const marker = markersRef.current[v.vehicleId];
        marker.setLatLng([v.latitude, v.longitude]);
        marker.setIcon(customIcon);
        marker.setPopupContent(popupContent);
      } else {
        // Create new marker
        const marker = L.marker([v.latitude, v.longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(popupContent);
        marker.on("click", () => {
          onSelectVehicle(v.vehicleId);
        });
        markersRef.current[v.vehicleId] = marker;
      }
    });
  }, [vehicles, visibleVehicleIds, onSelectVehicle]);

  // Pan to selected vehicle when selectedVehicleId changes
  React.useEffect(() => {
    if (!selectedVehicleId || !mapInstanceRef.current) return;
    const targetVeh = vehicles.find((v) => v.vehicleId === selectedVehicleId);
    if (targetVeh && visibleVehicleIds.has(selectedVehicleId)) {
      mapInstanceRef.current.flyTo([targetVeh.latitude, targetVeh.longitude], 15, {
        animate: true,
        duration: 1.2,
      });

      const marker = markersRef.current[selectedVehicleId];
      if (marker) {
        setTimeout(() => marker.openPopup(), 400);
      }
    }
  }, [selectedVehicleId, vehicles, visibleVehicleIds]);

  // Fit all visible markers button handler
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const visibleCoords: [number, number][] = vehicles
      .filter((v) => visibleVehicleIds.has(v.vehicleId))
      .map((v) => [v.latitude, v.longitude]);

    if (visibleCoords.length > 0) {
      const bounds = L.latLngBounds(visibleCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-neutral-100 overflow-hidden">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls Top Right */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* Style Switcher */}
        <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md border border-neutral-200/80 p-1 flex items-center gap-1">
          <button
            onClick={() => setMapStyle("voyager")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mapStyle === "voyager"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setMapStyle("osm")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mapStyle === "osm"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setMapStyle("dark")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              mapStyle === "dark"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            Dark
          </button>
        </div>

        {/* Fit All Button */}
        <button
          onClick={handleFitAll}
          className="bg-white/90 hover:bg-white backdrop-blur-md text-neutral-800 hover:text-neutral-900 text-xs font-bold px-3 py-2 rounded-lg shadow-md border border-neutral-200/80 flex items-center gap-1.5 transition-all self-end"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
          Fit Semua Unit ({visibleVehicleIds.size})
        </button>
      </div>

      {/* Map Legend Overlay Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur-md border border-neutral-200/80 rounded-lg p-2.5 shadow-md flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
          <span className="font-medium text-neutral-700">Bergerak (Moving)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs"></span>
          <span className="font-medium text-neutral-700">Idle / Standby</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span>
          <span className="font-medium text-neutral-700">Off / Maintenance</span>
        </div>
      </div>
    </div>
  );
}
