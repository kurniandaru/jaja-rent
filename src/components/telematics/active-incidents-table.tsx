"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  Car,
  User,
  CheckCircle2,
  Check,
  X,
  ExternalLink,
  Search,
} from "lucide-react";
import type {
  OperationalAlertRecord,
  AlertSeverity,
} from "@/lib/types/operational-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActiveIncidentsTableProps {
  alerts: OperationalAlertRecord[];
  onAcknowledge: (alertId: string, note?: string) => Promise<void>;
  onResolve: (alertId: string, resolutionNote: string) => Promise<void>;
}

export function ActiveIncidentsTable({
  alerts,
  onAcknowledge,
  onResolve,
}: ActiveIncidentsTableProps) {
  const [filterSeverity, setFilterSeverity] = React.useState<
    "ALL" | AlertSeverity
  >("ALL");
  const [search, setSearch] = React.useState("");
  const [selectedAlertForAction, setSelectedAlertForAction] = React.useState<{
    alert: OperationalAlertRecord;
    action: "ACKNOWLEDGE" | "RESOLVE";
  } | null>(null);
  const [actionNote, setActionNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const filtered = React.useMemo(() => {
    return alerts.filter((a) => {
      if (filterSeverity !== "ALL" && a.severity !== filterSeverity)
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.vehiclePlate && a.vehiclePlate.toLowerCase().includes(q)) ||
          (a.customerName && a.customerName.toLowerCase().includes(q)) ||
          (a.driverName && a.driverName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [alerts, filterSeverity, search]);

  const handleConfirmAction = async () => {
    if (!selectedAlertForAction) return;
    setIsSubmitting(true);
    try {
      if (selectedAlertForAction.action === "ACKNOWLEDGE") {
        await onAcknowledge(selectedAlertForAction.alert.id, actionNote);
      } else {
        await onResolve(
          selectedAlertForAction.alert.id,
          actionNote || "Insiden telah diselesaikan oleh operator.",
        );
      }
      setSelectedAlertForAction(null);
      setActionNote("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
      {/* Header & Filters */}
      <div className="p-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50/50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h3 className="font-semibold text-neutral-900 text-sm">
            Active Incidents & Alerts ({filtered.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari plat, insiden, penyewa..."
              className="pl-9 h-9 text-xs w-52 bg-white"
            />
          </div>

          <div className="flex bg-neutral-200/70 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilterSeverity("ALL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === "ALL"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterSeverity("CRITICAL")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === "CRITICAL"
                  ? "bg-red-600 text-white shadow-sm"
                  : "text-neutral-600"
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterSeverity("WARNING")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterSeverity === "WARNING"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-neutral-600"
              }`}
            >
              Warning
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-600">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Severity / Tipe</th>
              <th className="py-3 px-4">Kendaraan</th>
              <th className="py-3 px-4">Konteks Rental & Supir</th>
              <th className="py-3 px-4">Deskripsi Kejadian</th>
              <th className="py-3 px-4">Status & Waktu</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                  Tidak ada insiden operasional aktif saat ini. Seluruh armada
                  berjalan tertib.
                </td>
              </tr>
            ) : (
              filtered.map((alert) => {
                const isCritical = alert.severity === "CRITICAL";
                return (
                  <tr
                    key={alert.id}
                    className={`hover:bg-neutral-50/80 transition-colors ${
                      isCritical ? "bg-red-50/30" : ""
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCritical
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <span className="font-semibold text-neutral-800">
                          {alert.alertType.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5 text-neutral-400" />
                        <Link
                          href={`/fleet/${alert.vehicleId}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {alert.vehiclePlate || alert.vehicleId}
                        </Link>
                      </div>
                      {alert.speed !== undefined && alert.speed > 0 && (
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          Kecepatan:{" "}
                          <span className="font-semibold text-neutral-900">
                            {alert.speed} km/h
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="text-neutral-900 font-medium truncate max-w-[160px]">
                        {alert.customerName || "Pool Standby"}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                        <User className="w-3 h-3" />
                        <span className="truncate max-w-[140px]">
                          {alert.driverName || "Self-Drive"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-neutral-900 line-clamp-1">
                        {alert.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                        {alert.description}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            alert.status === "OPEN"
                              ? "bg-red-500 animate-pulse"
                              : alert.status === "ACKNOWLEDGED"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                        />
                        <span className="font-semibold text-neutral-800 text-[11px]">
                          {alert.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(alert.startedAt).toLocaleTimeString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {alert.status === "OPEN" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs px-2 text-amber-700 hover:bg-amber-50 border-amber-300"
                            onClick={() =>
                              setSelectedAlertForAction({
                                alert,
                                action: "ACKNOWLEDGE",
                              })
                            }
                          >
                            Tanggapi
                          </Button>
                        )}
                        {alert.status !== "RESOLVED" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="h-7 text-xs px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() =>
                              setSelectedAlertForAction({
                                alert,
                                action: "RESOLVE",
                              })
                            }
                          >
                            Selesaikan
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Action Modal */}
      {selectedAlertForAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h4 className="font-semibold text-neutral-900 text-sm">
                {selectedAlertForAction.action === "ACKNOWLEDGE"
                  ? "Tanggapi Insiden Operasional"
                  : "Selesaikan Insiden Operasional"}
              </h4>
              <button
                onClick={() => setSelectedAlertForAction(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100 text-xs">
                <div className="font-semibold text-neutral-900">
                  {selectedAlertForAction.alert.title}
                </div>
                <div className="text-neutral-500 mt-1">
                  Unit:{" "}
                  <span className="font-medium text-neutral-800">
                    {selectedAlertForAction.alert.vehiclePlate}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  {selectedAlertForAction.action === "ACKNOWLEDGE"
                    ? "Catatan Respon Operator:"
                    : "Catatan Resolusi / Tindakan Mitigasi:"}
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={
                    selectedAlertForAction.action === "ACKNOWLEDGE"
                      ? "Contoh: Sudah menghubungi supir dan meminta kurangi kecepatan..."
                      : "Contoh: Unit sudah kembali ke jalur aman dan peringatan diterima supir..."
                  }
                  className="w-full text-xs p-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedAlertForAction(null)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                size="sm"
                className={`text-xs ${
                  selectedAlertForAction.action === "ACKNOWLEDGE"
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                onClick={handleConfirmAction}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Konfirmasi Tindakan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
