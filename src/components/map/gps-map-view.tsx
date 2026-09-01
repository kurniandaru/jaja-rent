"use client";

import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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
  const tileLayerRef = React.useRef<L.TileLayer | null>(null);
  const markersRef = React.useRef<{ [id: string]: L.Marker }>({});
  const [mapStyle, setMapStyle] = React.useState<"osm" | "voyager" | "hot">("osm");

  // Initialize Leaflet Map with free OpenStreetMap
  React.useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const container = mapContainerRef.current;

    // Center around Jabodetabek area
    const map = L.map(container, {
      center: [-6.2088, 106.8456],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initial 100% Free OpenStreetMap Layer
    const initialTile = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map);

    tileLayerRef.current = initialTile;
    mapInstanceRef.current = map;

    // Invalidate size to ensure proper tile grid rendering
    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    // ResizeObserver for responsive layout changes (like sidebar collapse)
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when mapStyle changes (all free OpenStreetMap variants)
  React.useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    if (mapStyle === "voyager") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>';
    } else if (mapStyle === "hot") {
      tileUrl = "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by Humanitarian OSM';
    }

    const newTile = L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = newTile;
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
      const isOff =
        v.ignition === "OFF" ||
        v.status === "OFFLINE" ||
        (v.rentalStatus as string) === "MAINTENANCE" ||
        (v.rentalStatus as string) === "DOCUMENT_HOLD";

      // Determine marker color and style class
      let bgStyle = "background-color: #22c55e; color: #ffffff;";
      let pulseClass = "marker-pulse-moving";
      let statusLabel = "Bergerak";
      let statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";

      if (isIdle) {
        bgStyle = "background-color: #3b82f6; color: #ffffff;";
        pulseClass = "marker-pulse-idle";
        statusLabel = "Idle / Standby";
        statusColor = "text-blue-700 bg-blue-50 border-blue-200";
      } else if (isOff) {
        bgStyle = "background-color: #ef4444; color: #ffffff;";
        pulseClass = "";
        statusLabel = (v.rentalStatus as string) === "MAINTENANCE" ? "Maintenance" : "Off / Parkir";
        statusColor = "text-rose-700 bg-rose-50 border-rose-200";
      }

      const iconHtml = `
        <div class="custom-vehicle-marker ${pulseClass}" style="${bgStyle} width: 38px; height: 38px; border: 2.5px solid #ffffff; border-radius: 9999px; position: relative;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
          ${
            isMoving
              ? `<span style="position: absolute; bottom: -3px; right: -3px; background: #111827; color: #4ade80; font-size: 9px; font-weight: 700; font-family: monospace; padding: 1px 4px; border-radius: 9999px; border: 1px solid #ffffff; line-height: 1;">${v.speed}k</span>`
              : ""
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-div-icon",
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -22],
      });

      const popupContent = `
        <div style="padding: 14px; min-width: 250px; max-width: 300px; font-family: sans-serif;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px; margin-bottom: 8px;">
            <div>
              <span style="font-size: 14px; font-weight: 700; color: #111827; display: block;">${v.plateNumber}</span>
              <span style="font-size: 11px; color: #6b7280; font-weight: 500;">${v.model}</span>
            </div>
            <span class="${statusColor}" style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; border-width: 1px; border-style: solid;">
              ${statusLabel}
            </span>
          </div>

          <div style="font-size: 11px; color: #4b5563; line-height: 1.6;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #9ca3af;">Kecepatan:</span>
              <strong style="color: #111827; font-family: monospace;">${v.speed} km/jam</strong>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="color: #9ca3af;">Kontak:</span>
              <strong style="color: ${v.ignition === "ON" ? "#16a34a" : "#6b7280"};">${v.ignition}</strong>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="color: #9ca3af;">Odometer:</span>
              <strong style="color: #1f2937; font-family: monospace;">${formatNumber(v.odometer)} KM</strong>
            </div>

            <div style="border-top: 1px solid #f3f4f6; margin-top: 6px; padding-top: 6px;">
              <span style="color: #9ca3af; font-size: 9px; text-transform: uppercase; font-weight: 700; display: block;">Pengguna:</span>
              <strong style="color: #111827; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${v.customerName || "Standby di Pool"}</strong>
            </div>

            <div style="margin-top: 4px;">
              <span style="color: #9ca3af; font-size: 9px; text-transform: uppercase; font-weight: 700; display: block;">Pemilik Unit:</span>
              <span style="color: #374151; font-weight: 600;">${v.ownership}</span>
            </div>
          </div>

          <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10px; color: #9ca3af;">${v.lastUpdate}</span>
            <a href="/fleet/${v.plateNumber.replace(/\s+/g, "-")}" style="font-size: 11px; color: #0f172a; font-weight: 700; text-decoration: none;">
              Detail Unit &rarr;
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
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-neutral-100 overflow-hidden flex flex-col">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-0 min-h-[450px]" />

      {/* Floating Map Controls Top Right */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        {/* Style Switcher (Free OpenStreetMap styles) */}
        <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-neutral-200/80 p-1 flex items-center gap-1">
          <button
            onClick={() => setMapStyle("osm")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mapStyle === "osm"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            OSM Standar
          </button>
          <button
            onClick={() => setMapStyle("voyager")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mapStyle === "voyager"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            Light
          </button>
          <button
            onClick={() => setMapStyle("hot")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              mapStyle === "hot"
                ? "bg-neutral-900 text-white shadow-xs"
                : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
            }`}
          >
            Humanitarian
          </button>
        </div>

        {/* Fit All Button */}
        {visibleVehicleIds.size > 0 && (
          <button
            onClick={handleFitAll}
            className="bg-white/95 hover:bg-white backdrop-blur-md text-neutral-800 hover:text-neutral-900 text-xs font-bold px-3 py-2 rounded-lg shadow-md border border-neutral-200/80 flex items-center gap-1.5 transition-all self-end cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            Fit Semua Unit ({visibleVehicleIds.size})
          </button>
        )}
      </div>

      {/* Floating Helper Notification when 0 units are checked */}
      {visibleVehicleIds.size === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-neutral-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg text-xs font-medium flex items-center gap-2 border border-neutral-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Centang kendaraan di panel kiri untuk menampilkan pin armada di peta
        </div>
      )}

      {/* Map Legend Overlay Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-lg p-2.5 shadow-md flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs"></span>
          <span className="font-semibold text-neutral-700 text-[11px]">Bergerak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shadow-xs"></span>
          <span className="font-semibold text-neutral-700 text-[11px]">Idle</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-xs"></span>
          <span className="font-semibold text-neutral-700 text-[11px]">Off / Maint</span>
        </div>
      </div>
    </div>
  );
}
