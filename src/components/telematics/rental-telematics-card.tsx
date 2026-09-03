"use client";

import * as React from "react";
import Link from "next/link";
import {
  Radio,
  Car,
  MapPin,
  Activity,
  AlertTriangle,
  User,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import type { RentalRecord } from "@/lib/types/rental";
import type { OperationalAlertRecord } from "@/lib/types/operational-alert";
import { queryOperationalAlerts } from "@/lib/services/operational-alert-service";

interface RentalTelematicsCardProps {
  rental: RentalRecord;
}

export function RentalTelematicsCard({ rental }: RentalTelematicsCardProps) {
  const [alerts, setAlerts] = React.useState<OperationalAlertRecord[]>([]);

  React.useEffect(() => {
    async function loadAlerts() {
      const all = await queryOperationalAlerts({
        vehicleId: rental.vehicleId,
      });
      setAlerts(all);
    }
    loadAlerts();
  }, [rental.vehicleId]);

  const activeAlerts = alerts.filter(
    (a) => a.status === "OPEN" || a.status === "ACKNOWLEDGED",
  );

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-neutral-100 gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-neutral-900 text-sm">
            Live Vehicle Telematics & Tracking
          </h3>
        </div>

        <Link
          href={`/fleet/${rental.vehicleId}`}
          className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
        >
          Lihat Profil Lengkap Armada <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <Car className="w-3.5 h-3.5 text-neutral-400" />
            Unit Kendaraan
          </div>
          <div className="font-bold text-neutral-900 mt-1">
            {rental.vehiclePlate}
          </div>
          <div className="text-xs text-neutral-500">{rental.vehicleModel}</div>
        </div>

        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-neutral-400" />
            Pengemudi / Penyewa
          </div>
          <div className="font-bold text-neutral-900 mt-1">
            {rental.driverName || rental.customerName}
          </div>
          <div className="text-xs text-neutral-500">
            {rental.withDriver
              ? "Supir Jaja Ditugaskan"
              : "Self-Drive (Pelanggan)"}
          </div>
        </div>

        <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
          <div className="text-[11px] text-neutral-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" />
            Status Insiden & Kepatuhan
          </div>
          <div className="mt-1">
            {activeAlerts.length > 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> {activeAlerts.length}{" "}
                Insiden Aktif
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Tertib / Tanpa Pelanggaran
              </span>
            )}
          </div>
        </div>
      </div>

      {activeAlerts.length > 0 && (
        <div className="p-3 bg-red-50/60 rounded-lg border border-red-100 text-xs space-y-1.5">
          <div className="font-semibold text-red-900 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            Peringatan Berlangsung:
          </div>
          {activeAlerts.map((a) => (
            <div
              key={a.id}
              className="text-red-700 flex items-center justify-between"
            >
              <span>
                &bull; {a.title} ({a.speed ? `${a.speed} km/h` : "Zona Khusus"})
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200/70 text-red-900">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
