"use client";

import * as React from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface VehicleGPSHistoryMapProps {
  vehiclePlate: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  baseCoordinates: { lat: number; lng: number };
}

export function VehicleGPSHistoryMap({
  vehiclePlate,
  vehicleModel,
  startDate,
  endDate,
  baseCoordinates,
}: VehicleGPSHistoryMapProps) {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<L.Map | null>(null);
  const polylineRef = React.useRef<L.Polyline | null>(null);
  const markersGroupRef = React.useRef<L.LayerGroup | null>(null);

  // Generate realistic route waypoints around base coordinates
  const waypoints = React.useMemo(() => {
    const lat0 = baseCoordinates.lat || -6.2255;
    const lng0 = baseCoordinates.lng || 106.8095;

    // Simulated historical route trail points
    return [
      { lat: lat0 - 0.045, lng: lng0 - 0.035, time: "08:15", speed: 0, label: "Titik Berangkat (Pool Jaja SCBD)" },
      { lat: lat0 - 0.032, lng: lng0 - 0.022, time: "08:42", speed: 45, label: "Jl. Jend. Sudirman (Lancar)" },
      { lat: lat0 - 0.015, lng: lng0 + 0.010, time: "09:10", speed: 58, label: "Tol Dalam Kota Kuningan" },
      { lat: lat0 + 0.012, lng: lng0 + 0.035, time: "09:35", speed: 65, label: "Tol Cawang - Cikampek KM 5" },
      { lat: lat0 + 0.030, lng: lng0 + 0.065, time: "10:15", speed: 20, label: "Kawasan Industri MM2100" },
      { lat: lat0 + 0.028, lng: lng0 + 0.062, time: "11:45", speed: 0, label: "Parkir Klien PT ABC Indonesia" },
      { lat: lat0 + 0.010, lng: lng0 + 0.040, time: "14:20", speed: 52, label: "Tol Jakarta - Cikampek KM 12" },
      { lat: lat0 - 0.020, lng: lng0 + 0.015, time: "15:05", speed: 38, label: "Jl. Gatot Subroto" },
      { lat: lat0 - 0.040, lng: lng0 - 0.025, time: "15:40", speed: 25, label: "Kawasan SCBD Lot 8" },
      { lat: lat0, lng: lng0, time: "16:15", speed: 0, label: "Posisi Terkini (Parkir Standby)" },
    ];
  }, [baseCoordinates.lat, baseCoordinates.lng]);

  React.useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy previous map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const container = mapContainerRef.current;
    const centerLat = baseCoordinates.lat || -6.2255;
    const centerLng = baseCoordinates.lng || 106.8095;

    const map = L.map(container, {
      center: [centerLat, centerLng],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Free OSM tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = layerGroup;

    // Draw route polyline
    const latLngs = waypoints.map((w) => [w.lat, w.lng] as [number, number]);
    const routeLine = L.polyline(latLngs, {
      color: "#2563eb",
      weight: 5,
      opacity: 0.85,
      lineCap: "round",
      lineJoin: "round",
      dashArray: "1, 8",
    }).addTo(map);

    polylineRef.current = routeLine;

    // Add Start Marker (Green)
    const startPoint = waypoints[0];
    const startIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="background-color: #10b981; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
          START
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([startPoint.lat, startPoint.lng], { icon: startIcon })
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 11px; line-height: 1.4;">
          <strong style="color: #10b981;">Titik Mulai Perjalanan</strong><br/>
          <span>${startPoint.label}</span><br/>
          <span style="color: #666;">Waktu: ${startDate} ${startPoint.time} WIB</span>
        </div>`
      )
      .addTo(layerGroup);

    // Add End / Current Marker (Blue pulsing)
    const endPoint = waypoints[waypoints.length - 1];
    const endIcon = L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div style="background-color: #2563eb; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; box-shadow: 0 4px 8px rgba(37,99,235,0.5); border: 2px solid white;">
          FINISH
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    L.marker([endPoint.lat, endPoint.lng], { icon: endIcon })
      .bindPopup(
        `<div style="font-family: sans-serif; font-size: 11px; line-height: 1.4;">
          <strong style="color: #2563eb;">Posisi Terakhir (${vehiclePlate})</strong><br/>
          <span>${endPoint.label}</span><br/>
          <span style="color: #666;">Waktu: ${endDate} ${endPoint.time} WIB</span>
        </div>`
      )
      .addTo(layerGroup);

    // Add intermediate waypoints
    waypoints.slice(1, waypoints.length - 1).forEach((wp, idx) => {
      const dotIcon = L.divIcon({
        className: "custom-dot",
        html: `<div style="background: white; border: 2px solid #2563eb; width: 10px; height: 10px; border-radius: 50%;"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });

      L.marker([wp.lat, wp.lng], { icon: dotIcon })
        .bindPopup(
          `<div style="font-family: sans-serif; font-size: 10px;">
            <strong>Waypoint #${idx + 1}</strong> (${wp.time})<br/>
            ${wp.label}<br/>
            Kecepatan: ${wp.speed} km/h
          </div>`
        )
        .addTo(layerGroup);
    });

    // Fit map bounds to polyline
    map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [startDate, endDate, waypoints, vehiclePlate, baseCoordinates.lat, baseCoordinates.lng]);

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border border-neutral-200 shadow-2xs">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Trajectory Legend Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-neutral-200/80 shadow-md text-xs space-y-1.5 max-w-xs pointer-events-auto">
        <div className="flex items-center justify-between gap-2">
          <strong className="text-neutral-900 font-bold">{vehiclePlate}</strong>
          <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
            Trajectory Map
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 truncate">{vehicleModel}</p>
        <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-600 font-mono">
          <span>{startDate}</span>
          <span>&rarr;</span>
          <span>{endDate}</span>
        </div>
      </div>
    </div>
  );
}

export default VehicleGPSHistoryMap;
