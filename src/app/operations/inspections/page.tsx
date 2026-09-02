"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { DigitalInspectionRecord, InspectionGrade } from "@/lib/types/inspection";
import { getDigitalInspections } from "@/lib/data/inspections";
import { getGradeColor } from "@/lib/inspections/inspection-calculator";
import { formatNumber } from "@/lib/utils";
import {
  ClipboardCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function DigitalInspectionsListPage() {
  const router = useRouter();
  const [inspections, setInspections] = React.useState<DigitalInspectionRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "COMPLETED" | "DRAFT">("ALL");
  const [gradeFilter, setGradeFilter] = React.useState<"ALL" | InspectionGrade>("ALL");

  React.useEffect(() => {
    async function loadData() {
      const data = await getDigitalInspections();
      setInspections(data);
    }
    loadData();
  }, []);

  const filtered = inspections.filter((i) => {
    const s = search.toLowerCase();
    const matchesSearch =
      i.id.toLowerCase().includes(s) ||
      i.vehicleSpecs.plateNumber.toLowerCase().includes(s) ||
      i.vehicleSpecs.brand.toLowerCase().includes(s) ||
      i.vehicleSpecs.model.toLowerCase().includes(s) ||
      i.inspectorName.toLowerCase().includes(s);

    let matchesStatus = true;
    if (statusFilter !== "ALL") {
      matchesStatus = i.status === statusFilter;
    }

    let matchesGrade = true;
    if (gradeFilter !== "ALL") {
      matchesGrade = i.grades?.overallGrade === gradeFilter;
    }

    return matchesSearch && matchesStatus && matchesGrade;
  });

  const totalCompleted = inspections.filter((i) => i.status === "COMPLETED").length;
  const totalDraft = inspections.filter((i) => i.status === "DRAFT").length;
  const totalNeedsMaint = inspections.filter(
    (i) => i.recommendedVehicleStatus === "MAINTENANCE"
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Inspeksi Kendaraan
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Kelola dan pantau seluruh riwayat audit kondisi fisik, mesin, sasis, dan kelayakan armada secara digital.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/operations/inspections/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm gap-2 font-bold shadow-xs">
              <Plus className="h-4 w-4" />
              + Buat Inspeksi
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Total Inspeksi
              </span>
              <ClipboardCheck className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">
                {inspections.length}
              </span>
              <span className="text-xs text-neutral-500">riwayat tercatat</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Inspeksi Selesai
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {totalCompleted}
              </span>
              <span className="text-xs text-neutral-500">unit tervalidasi</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Draft Tersimpan
              </span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">
                {totalDraft}
              </span>
              <span className="text-xs text-neutral-500">belum submit</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Perlu Maintenance
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-600">
                {totalNeedsMaint}
              </span>
              <span className="text-xs text-neutral-500">rekomendasi servis</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-900">
              Daftar Riwayat Inspeksi Kendaraan
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Klik pada baris tabel untuk melihat detail audit checklist, lembar nilai, dan dokumentasi foto.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Cari no. inspeksi, plat, inspector..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8.5 h-8.5 text-xs bg-neutral-50/70"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
            >
              <option value="ALL">Status: Semua</option>
              <option value="COMPLETED">Completed</option>
              <option value="DRAFT">Draft</option>
            </select>

            {/* Grade Filter */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value as any)}
              className="h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-900 cursor-pointer"
            >
              <option value="ALL">Grade: Semua</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
              <option value="D">Grade D</option>
              <option value="E">Grade E</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50/80 text-neutral-600">
              <TableRow className="border-b border-neutral-200/80 hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  No. Inspeksi
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Kendaraan
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  No. Polisi
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Inspector
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Tanggal
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider font-mono">
                  KM
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Overall Grade
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-32 text-center text-neutral-500 text-sm"
                  >
                    Tidak ada data inspeksi yang sesuai dengan filter pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, idx) => {
                  const gradeInfo = getGradeColor(item.grades?.overallGrade || "A");
                  const isDraft = item.status === "DRAFT";

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => router.push(`/operations/inspections/${item.id}`)}
                      className="border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    >
                      {/* No */}
                      <TableCell className="text-center font-medium text-neutral-500 text-xs">
                        {idx + 1}
                      </TableCell>

                      {/* No Inspeksi */}
                      <TableCell className="font-mono font-semibold text-blue-600 hover:underline text-xs">
                        {item.id}
                      </TableCell>

                      {/* Kendaraan */}
                      <TableCell>
                        <div className="font-semibold text-neutral-900 text-xs">
                          {item.vehicleSpecs?.brand} {item.vehicleSpecs?.model}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {item.vehicleSpecs?.series} ({item.vehicleSpecs?.year})
                        </div>
                      </TableCell>

                      {/* No Polisi */}
                      <TableCell>
                        <span className="font-mono font-bold text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-900 border border-neutral-200/60">
                          {item.vehicleSpecs?.plateNumber}
                        </span>
                      </TableCell>

                      {/* Inspector */}
                      <TableCell className="text-neutral-800 text-xs font-medium">
                        {item.inspectorName}
                      </TableCell>

                      {/* Tanggal */}
                      <TableCell className="text-neutral-600 text-xs font-mono">
                        {item.inspectionDate}
                      </TableCell>

                      {/* KM */}
                      <TableCell className="font-mono text-neutral-900 text-xs font-semibold">
                        {formatNumber(item.inspectionOdometer)}
                      </TableCell>

                      {/* Overall Grade */}
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md font-bold text-xs shadow-2xs ${gradeInfo.badge}`}
                        >
                          Grade {item.grades?.overallGrade || "A"}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            isDraft
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="text-right pr-6">
                        <Link
                          href={`/operations/inspections/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Lihat Detail
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
