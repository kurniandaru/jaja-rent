"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Shield,
  Clock,
  User,
  ArrowRight,
  RefreshCw,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AuditLogEntry } from "@/lib/types/business-core";
import { queryAuditLogs } from "@/lib/services/audit-service";

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedEntity, setSelectedEntity] = React.useState("ALL");
  const [selectedActor, setSelectedActor] = React.useState("ALL");
  const [isLoading, setIsLoading] = React.useState(true);

  // Selected Log for Diff Modal
  const [selectedLog, setSelectedLog] = React.useState<AuditLogEntry | null>(
    null,
  );
  const [isDiffModalOpen, setIsDiffModalOpen] = React.useState(false);

  const loadLogs = React.useCallback(async () => {
    setIsLoading(true);
    const data = await queryAuditLogs({
      search: searchQuery,
      entityType: selectedEntity,
      actorName: selectedActor,
    });
    setLogs(data);
    setIsLoading(false);
  }, [searchQuery, selectedEntity, selectedActor]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Unique list of actors for filter dropdown
  const uniqueActors = React.useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) {
      if (l.actorName) set.add(l.actorName);
    }
    return Array.from(set);
  }, [logs]);

  const handleOpenDiff = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setIsDiffModalOpen(true);
  };

  const getEntityBadgeStyle = (entity: string) => {
    switch (entity) {
      case "RESERVATION":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "RENTAL":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "VEHICLE":
      case "ALLOCATION":
        return "bg-cyan-50 text-cyan-800 border-cyan-200";
      case "PAYMENT":
      case "SETTLEMENT":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "MAINTENANCE":
      case "DAMAGE":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "INSPECTION":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "CUSTOMER":
      case "DOCUMENT":
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Audit Logs & Enterprise System Trail
            </h1>
            <span className="text-[10px] bg-neutral-900 text-white font-mono px-2 py-0.5 rounded-full font-bold uppercase">
              Immutable
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Pusat rekaman seluruh mutasi data, otorisasi peran, dan riwayat aksi
            operasional sistem Jaja Rent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            Segarkan Log
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="shadow-2xs border-neutral-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Keyword Search */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Cari aksi, entity ID, nama aktor, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Entity Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-700 focus:outline-hidden focus:ring-1 focus:ring-neutral-950 font-medium"
            >
              <option value="ALL">Semua Entitas (All Entities)</option>
              <option value="RESERVATION">RESERVATION</option>
              <option value="ALLOCATION">ALLOCATION</option>
              <option value="RENTAL">RENTAL</option>
              <option value="VEHICLE">VEHICLE</option>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="INSPECTION">INSPECTION</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="DAMAGE">DAMAGE</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="SETTLEMENT">SETTLEMENT</option>
            </select>
          </div>

          {/* Actor Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedActor}
              onChange={(e) => setSelectedActor(e.target.value)}
              className="w-full h-9 rounded-md border border-neutral-200 bg-white px-3 text-xs text-neutral-700 focus:outline-hidden focus:ring-1 focus:ring-neutral-950 font-medium"
            >
              <option value="ALL">Semua Aktor Operator</option>
              {uniqueActors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="shadow-2xs border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50/80">
              <TableRow>
                <TableHead className="w-32 text-xs font-bold text-neutral-700">
                  Waktu (UTC)
                </TableHead>
                <TableHead className="text-xs font-bold text-neutral-700">
                  Aktor Pelaksana
                </TableHead>
                <TableHead className="text-xs font-bold text-neutral-700">
                  Entitas Target
                </TableHead>
                <TableHead className="text-xs font-bold text-neutral-700">
                  Aksi Operasional
                </TableHead>
                <TableHead className="text-xs font-bold text-neutral-700">
                  Catatan & Keterangan
                </TableHead>
                <TableHead className="w-28 text-right text-xs font-bold text-neutral-700">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-xs text-neutral-500"
                  >
                    Tidak ditemukan rekaman audit log sesuai filter yang
                    dipilih.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="hover:bg-neutral-50/70 transition-colors"
                  >
                    <TableCell className="text-[11px] font-mono text-neutral-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
                        <span className="text-xs font-semibold text-neutral-900">
                          {log.actorName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getEntityBadgeStyle(
                            log.entityType,
                          )}`}
                        >
                          {log.entityType}
                        </span>
                        <span className="text-xs font-mono font-medium text-neutral-700">
                          {log.entityId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-neutral-600 max-w-xs truncate">
                      {log.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="subtle"
                        size="xs"
                        onClick={() => handleOpenDiff(log)}
                        className="gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                      >
                        <Eye className="h-3 w-3" />
                        Diff State
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Readable JSON Diff Modal (Section 10) */}
      <Dialog open={isDiffModalOpen} onOpenChange={setIsDiffModalOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Shield className="h-4 w-4 text-neutral-700" />
              Detail Audit Log & Perubahan Status ({selectedLog?.id})
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Perbandingan kondisi data sebelum (*old state*) dan sesudah (*new
              state*) dieksekusi.
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-2">
              {/* Meta information summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase">
                    Aktor
                  </span>
                  <strong className="text-neutral-900 font-semibold">
                    {selectedLog.actorName}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase">
                    Aksi
                  </span>
                  <strong className="text-neutral-900 font-mono">
                    {selectedLog.action}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase">
                    Entitas
                  </span>
                  <strong className="text-neutral-900">
                    {selectedLog.entityType} ({selectedLog.entityId})
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-400 block uppercase">
                    Waktu
                  </span>
                  <strong className="text-neutral-900 font-mono text-[11px]">
                    {new Date(selectedLog.createdAt).toLocaleTimeString(
                      "id-ID",
                    )}{" "}
                    WIB
                  </strong>
                </div>
              </div>

              {selectedLog.notes && (
                <div className="p-2.5 rounded-md bg-blue-50/60 border border-blue-200 text-xs text-blue-950 font-medium">
                  <strong>Keterangan:</strong> {selectedLog.notes}
                </div>
              )}

              {/* Side-by-Side Readable Diff Viewer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Before (Old State) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 pb-1 border-b border-rose-200">
                    <span className="text-rose-700 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Sebelumnya (Old State)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-rose-50/40 border border-rose-200 text-xs font-mono text-neutral-800 overflow-x-auto max-h-60">
                    {selectedLog.oldData ? (
                      <pre className="text-[11px] whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.oldData, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-neutral-400 italic text-[11px]">
                        (Tidak ada data sebelumnya / Initial record)
                      </span>
                    )}
                  </div>
                </div>

                {/* After (New State) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-700 pb-1 border-b border-emerald-200">
                    <span className="text-emerald-700 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Sesudahnya (New State)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-md bg-emerald-50/40 border border-emerald-200 text-xs font-mono text-neutral-800 overflow-x-auto max-h-60">
                    {selectedLog.newData ? (
                      <pre className="text-[11px] whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.newData, null, 2)}
                      </pre>
                    ) : (
                      <span className="text-neutral-400 italic text-[11px]">
                        (Tidak ada data baru)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-neutral-200 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDiffModalOpen(false)}
              className="text-xs"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
