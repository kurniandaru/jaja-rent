"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DigitalInspectionRecord,
  InspectionItem,
} from "@/lib/types/inspection";
import { getDigitalInspectionById } from "@/lib/data/inspections";
import { getGradeColor } from "@/lib/inspections/inspection-calculator";
import { formatNumber } from "@/lib/utils";
import {
  Car,
  ShieldCheck,
  ShieldAlert,
  Armchair,
  Wrench,
  Layers,
  Gauge,
  Camera,
  ArrowLeft,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function InspectionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [inspection, setInspection] =
    React.useState<DigitalInspectionRecord | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDetail() {
      if (id) {
        const data = await getDigitalInspectionById(id);
        setInspection(data);
      }
      setLoading(false);
    }
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-neutral-500 text-xs">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <span>Memuat data hasil inspeksi...</span>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="p-3 bg-rose-50 text-rose-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900">
          Data Inspeksi Tidak Ditemukan
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Nomor inspeksi{" "}
          <code className="font-mono text-neutral-800">{id}</code> tidak
          terdaftar di sistem.
        </p>
        <Link href="/operations/inspections">
          <Button variant="outline" size="sm" className="text-xs gap-1.5 mt-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Inspeksi
          </Button>
        </Link>
      </div>
    );
  }

  const { grades, vehicleSpecs } = inspection;
  const overallConfig = getGradeColor(grades.overallGrade);

  // Issues items
  const allItems: InspectionItem[] = [
    ...(inspection.exteriorItems || []),
    ...(inspection.interiorItems || []),
    ...(inspection.mechanicalItems || []),
    ...(inspection.frameItems || []),
  ];
  const issuesList = allItems.filter(
    (i) => i.grade === "C" || i.grade === "D" || i.grade === "E",
  );
  const testDriveIssues = (inspection.testDriveItems || []).filter(
    (td) => td.status === "ISSUE",
  );

  // Photos
  const photoEntries = Object.entries(inspection.photos || {}).filter(
    ([_, val]) => Boolean(val),
  );

  // Group items by category for the structured tables
  const categoriesList = [
    {
      title: "1. Komponen Eksterior Bodi & Panel",
      icon: Car,
      items: inspection.exteriorItems || [],
      grade: grades.exteriorGrade,
    },
    {
      title: "2. Komponen Interior & Kabin",
      icon: Armchair,
      items: inspection.interiorItems || [],
      grade: grades.interiorGrade,
    },
    {
      title: "3. Komponen Mesin & Mekanikal",
      icon: Wrench,
      items: inspection.mechanicalItems || [],
      grade: grades.mechanicalGrade,
    },
    {
      title: "4. Komponen Rangka & Sasis (Struktur Utama)",
      icon: Layers,
      items: inspection.frameItems || [],
      grade: grades.frameGrade,
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div className="flex items-center gap-3">
          <Link href="/operations/inspections">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <ArrowLeft className="h-4 w-4 text-neutral-600" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                {inspection.id}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  inspection.status === "COMPLETED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {inspection.status}
              </span>
              <span className="text-xs text-neutral-500 font-medium">
                Digital Vehicle Inspection Record
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-1">
              Hasil Laporan Inspeksi Kendaraan Digital
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs gap-1.5 font-semibold"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak / PDF
          </Button>

          <Link
            href={`/fleet/${vehicleSpecs?.plateNumber?.replace(/\s+/g, "-")}`}
          >
            <Button
              size="sm"
              className="text-xs gap-1.5 bg-neutral-900 text-white font-bold"
            >
              <Car className="h-3.5 w-3.5" />
              Lihat Detail Unit
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Grade Summary Banner */}
      <Card className="border-neutral-200/80 shadow-md overflow-hidden bg-white">
        <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-100">
          <div className="flex items-center gap-5">
            {/* Big Grade Box */}
            <div
              className={`flex flex-col items-center justify-center h-24 w-24 rounded-2xl border-2 shadow-sm shrink-0 ${overallConfig.bg} ${overallConfig.border} ${overallConfig.text}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                Overall Grade
              </span>
              <span className="text-4xl font-extrabold tracking-tight">
                {grades.overallGrade}
              </span>
              <span className="text-[9px] font-semibold text-neutral-600">
                {grades.scorePercentage}% Skor
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                  {vehicleSpecs?.brand} {vehicleSpecs?.model} (
                  {vehicleSpecs?.series})
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800">
                  {overallConfig.label}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Diinspeksi oleh <strong>{inspection.inspectorName}</strong> pada{" "}
                {inspection.inspectionDate} &middot; Odometer:{" "}
                <strong>
                  {formatNumber(inspection.inspectionOdometer)} KM
                </strong>
              </p>

              {/* Status Recommendation */}
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">
                  Rekomendasi Operasional:
                </span>
                {inspection.recommendedVehicleStatus === "MAINTENANCE" ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    MAINTENANCE (Harus masuk bengkel / perbaikan)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    AVAILABLE (Lolos standar & siap disewakan)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-3 gap-2.5 text-center shrink-0">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Total Item
              </span>
              <span className="text-xl font-bold text-neutral-900 block mt-0.5">
                {grades.totalItems}
              </span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">
                Masalah Ditemukan
              </span>
              <span className="text-xl font-bold text-amber-700 block mt-0.5">
                {issuesList.length + testDriveIssues.length}
              </span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">
                Foto Terlampir
              </span>
              <span className="text-xl font-bold text-blue-700 block mt-0.5">
                {photoEntries.length}
              </span>
            </div>
          </div>
        </div>

        {/* Category Grade Tiles */}
        <div className="p-4 sm:p-5 bg-neutral-50/60 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Car className="h-3.5 w-3.5 text-neutral-400" />
                Eksterior
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${getGradeColor(grades.exteriorGrade).badge}`}
              >
                Grade {grades.exteriorGrade}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {(inspection.exteriorItems || []).length} komponen
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Armchair className="h-3.5 w-3.5 text-neutral-400" />
                Interior
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${getGradeColor(grades.interiorGrade).badge}`}
              >
                Grade {grades.interiorGrade}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {(inspection.interiorItems || []).length} komponen
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Wrench className="h-3.5 w-3.5 text-neutral-400" />
                Mesin & Mekanikal
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${getGradeColor(grades.mechanicalGrade).badge}`}
              >
                Grade {grades.mechanicalGrade}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {(inspection.mechanicalItems || []).length} komponen
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-neutral-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-neutral-400" />
                Sasis & Rangka
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${getGradeColor(grades.frameGrade).badge}`}
              >
                Grade {grades.frameGrade}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {(inspection.frameItems || []).length} komponen
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-neutral-200/80 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5 text-neutral-400" />
                Test Drive
              </span>
              <span
                className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                  grades.testDriveStatus === "NORMAL"
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {grades.testDriveStatus === "NORMAL" ? "Normal" : "Ada Isu"}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              8 pengujian
            </span>
          </div>
        </div>
      </Card>

      {/* Main Tabs Detail (Issues, Checklist Tables, Test Drive, Photos) */}
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="bg-neutral-100 p-1 border border-neutral-200/80">
          <TabsTrigger
            value="checklist"
            className="text-xs font-semibold gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Checklist Lengkap ({allItems.length})
          </TabsTrigger>
          <TabsTrigger value="issues" className="text-xs font-semibold gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            Temuan Masalah ({issuesList.length + testDriveIssues.length})
          </TabsTrigger>
          <TabsTrigger
            value="testdrive"
            className="text-xs font-semibold gap-1.5"
          >
            <Gauge className="h-3.5 w-3.5 text-blue-600" />
            Hasil Test Drive (8)
          </TabsTrigger>
          <TabsTrigger value="photos" className="text-xs font-semibold gap-1.5">
            <Camera className="h-3.5 w-3.5 text-purple-600" />
            Foto Dokumentasi ({photoEntries.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CHECKLIST LENGKAP GROUPED BY TABLES */}
        <TabsContent value="checklist" className="mt-4 space-y-6">
          {categoriesList.map((cat, catIdx) => (
            <Card key={catIdx} className="border-neutral-200/80 shadow-xs">
              <CardHeader className="p-4 border-b border-neutral-100 flex flex-row items-center justify-between bg-neutral-50/60">
                <div className="flex items-center gap-2">
                  <cat.icon className="h-4.5 w-4.5 text-neutral-700" />
                  <CardTitle className="text-sm font-bold text-neutral-900">
                    {cat.title}
                  </CardTitle>
                </div>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${getGradeColor(cat.grade || "A").badge}`}
                >
                  Grade {cat.grade} ({cat.items.length} Item)
                </span>
              </CardHeader>

              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="text-xs">
                      <TableHead className="w-12 font-bold text-center">
                        No
                      </TableHead>
                      <TableHead className="font-bold">
                        Item Pemeriksaan
                      </TableHead>
                      <TableHead className="font-bold">
                        Standar Kondisi
                      </TableHead>
                      <TableHead className="w-24 font-bold text-center">
                        Grade
                      </TableHead>
                      <TableHead className="font-bold">
                        Catatan & Temuan Inspector
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cat.items.map((item, idx) => {
                      const isDefect =
                        item.grade === "C" ||
                        item.grade === "D" ||
                        item.grade === "E";
                      return (
                        <TableRow
                          key={item.id}
                          className={`text-xs hover:bg-neutral-50/60 ${
                            isDefect ? "bg-amber-50/30" : ""
                          }`}
                        >
                          <TableCell className="text-center font-mono font-bold text-neutral-400">
                            {idx + 1}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-0.5">
                              <strong className="text-neutral-900 block font-semibold">
                                {item.nameId}
                              </strong>
                              {item.name && (
                                <span className="text-[10px] text-neutral-400 block font-mono">
                                  {item.name}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-neutral-600 text-[11px]">
                            Standar OEM & Bebas Kerusakan
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-block font-bold px-2.5 py-0.5 rounded text-xs ${
                                getGradeColor(item.grade || "A").badge
                              }`}
                            >
                              Grade {item.grade || "A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {item.note ? (
                              <span className="text-[11px] text-rose-800 font-medium">
                                {item.note}
                              </span>
                            ) : (
                              <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Baik / Normal
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TAB 2: ISSUES & FINDINGS */}
        <TabsContent value="issues" className="mt-4">
          <Card className="border-neutral-200/80 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100">
              <CardTitle className="text-sm font-bold text-neutral-900">
                Temuan Masalah & Catatan Perbaikan (
                {issuesList.length + testDriveIssues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {issuesList.length === 0 && testDriveIssues.length === 0 ? (
                <div className="p-8 text-center text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-600" />
                  <p className="font-bold text-sm">
                    Tidak Ditemukan Masalah Signifikan
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Seluruh komponen kendaraan memenuhi standar kualitas Grade
                    A/B dan siap beroperasi.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 text-xs">
                  {issuesList.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              getGradeColor(item.grade || "C").badge
                            }`}
                          >
                            Grade {item.grade}
                          </span>
                          <span className="font-bold text-neutral-900">
                            {item.nameId}
                          </span>
                          <span className="text-[10px] text-neutral-400">
                            ({item.category})
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-neutral-600 mt-1 text-[11px] pl-2.5 border-l-2 border-amber-400">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {testDriveIssues.map((td) => (
                    <div
                      key={td.id}
                      className="py-3 flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold px-1.5 py-0.2 rounded text-[10px] bg-rose-600 text-white">
                            Test Drive Issue
                          </span>
                          <span className="font-bold text-neutral-900">
                            {td.nameId}
                          </span>
                        </div>
                        {td.note && (
                          <p className="text-neutral-600 mt-1 text-[11px] pl-2.5 border-l-2 border-rose-400">
                            {td.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: TEST DRIVE */}
        <TabsContent value="testdrive" className="mt-4">
          <Card className="border-neutral-200/80 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100">
              <CardTitle className="text-sm font-bold text-neutral-900">
                Hasil Uji Jalan Dinamis (8 Parameter)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-neutral-50/80">
                  <TableRow className="text-xs">
                    <TableHead className="w-12 font-bold text-center">
                      No
                    </TableHead>
                    <TableHead className="font-bold">
                      Parameter Uji Jalan
                    </TableHead>
                    <TableHead className="font-bold text-center w-28">
                      Status
                    </TableHead>
                    <TableHead className="font-bold">
                      Catatan Pengujian
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(inspection.testDriveItems || []).map((td, idx) => (
                    <TableRow
                      key={td.id}
                      className="text-xs hover:bg-neutral-50/60"
                    >
                      <TableCell className="text-center font-mono font-bold text-neutral-500">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-neutral-900">
                        {td.nameId}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            td.status === "NORMAL"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {td.status === "NORMAL" ? "NORMAL ✓" : "ADA ISU ⚠"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-neutral-600 text-[11px]">
                          {td.note ||
                            "Performa responsif dan bekerja normal tanpa kendala."}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: PHOTOS */}
        <TabsContent value="photos" className="mt-4">
          <Card className="border-neutral-200/80 shadow-xs">
            <CardHeader className="p-4 border-b border-neutral-100">
              <CardTitle className="text-sm font-bold text-neutral-900">
                Galeri Foto Dokumentasi Fisik & Legalitas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {photoEntries.length === 0 ? (
                <div className="p-8 text-center text-neutral-400 text-xs">
                  Tidak ada foto yang dilampirkan pada inspeksi ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photoEntries.map(([label, url]) => (
                    <div
                      key={label}
                      className="border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                    >
                      <div className="aspect-video relative bg-neutral-100">
                        <img
                          src={url as string}
                          alt={label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2.5 border-t border-neutral-100">
                        <span className="font-bold text-xs text-neutral-800 uppercase tracking-tight block">
                          {label.replace(/([A-Z])/g, " $1")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
