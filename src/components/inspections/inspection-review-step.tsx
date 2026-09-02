"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  VehicleMasterSpecs,
  InspectionItem,
  TestDriveItem,
  PhotoDocumentation,
  GradeSummary,
} from "@/lib/types/inspection";
import { getGradeColor } from "@/lib/inspections/inspection-calculator";
import { formatNumber } from "@/lib/utils";
import {
  CheckCircle2,
  AlertTriangle,
  Car,
  Armchair,
  Wrench,
  Layers,
  Gauge,
  User,
  Save,
  Send,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

interface InspectionReviewStepProps {
  vehicleSpecs: VehicleMasterSpecs | null;
  inspectorName: string;
  inspectionDate: string;
  inspectionLocation: string;
  inspectionOdometer: number;
  inspectorNotes: string;
  exteriorItems: InspectionItem[];
  interiorItems: InspectionItem[];
  mechanicalItems: InspectionItem[];
  frameItems: InspectionItem[];
  testDriveItems: TestDriveItem[];
  photos: PhotoDocumentation;
  grades: GradeSummary;
  onGoToStep: (stepId: number) => void;
  onSaveDraft: () => void;
  onSubmitInspection: () => void;
  isSubmitting?: boolean;
}

export function InspectionReviewStep({
  vehicleSpecs,
  inspectorName,
  inspectionDate,
  inspectionLocation,
  inspectionOdometer,
  inspectorNotes,
  exteriorItems,
  interiorItems,
  mechanicalItems,
  frameItems,
  testDriveItems,
  photos,
  grades,
  onGoToStep,
  onSaveDraft,
  onSubmitInspection,
  isSubmitting = false,
}: InspectionReviewStepProps) {
  const overallConfig = getGradeColor(grades.overallGrade);

  // Collect all issue items (Grade C, D, E)
  const allChecklistItems = [
    ...exteriorItems,
    ...interiorItems,
    ...mechanicalItems,
    ...frameItems,
  ];
  const issueItems = allChecklistItems.filter(
    (item) => item.grade === "C" || item.grade === "D" || item.grade === "E"
  );
  const testDriveIssues = testDriveItems.filter((item) => item.status === "ISSUE");

  // Count uploaded photos
  const uploadedPhotosCount = Object.values(photos).filter(Boolean).length;

  const isFormComplete = grades.ungradedItemsCount === 0 && Boolean(vehicleSpecs && inspectorName);

  return (
    <div className="space-y-6">
      {/* 1. Overall Grade Hero Banner */}
      <Card className="border-neutral-200/80 shadow-md overflow-hidden bg-white">
        <div className="p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-100">
          <div className="flex items-center gap-5">
            {/* Big Grade Badge */}
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
                <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
                  Hasil Rekapitulasi Digital Inspection
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-neutral-100 text-neutral-800">
                  Kondisi: {overallConfig.label}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                Nilai akhir dihitung otomatis berdasarkan pembobotan Mesin (30%), Sasis & Rangka (25%), Eksterior (25%), dan Interior (20%) dengan proteksi keselamatan.
              </p>

              {/* Status Recommendation Pill */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-medium">
                  Rekomendasi Status Armada:
                </span>
                {grades.overallGrade === "D" || grades.overallGrade === "E" || grades.issuesCount >= 5 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    MAINTENANCE (Perlu Perbaikan Bengkel)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    AVAILABLE (Siap Operasional / Disewakan)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center shrink-0">
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Total Komponen
              </span>
              <span className="text-xl font-bold text-neutral-900 block mt-0.5">
                {grades.totalItems}
              </span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">
                Total Masalah
              </span>
              <span className="text-xl font-bold text-amber-700 block mt-0.5">
                {grades.issuesCount}
              </span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">
                Foto Terupload
              </span>
              <span className="text-xl font-bold text-blue-700 block mt-0.5">
                {uploadedPhotosCount}
              </span>
            </div>
          </div>
        </div>

        {/* Category Scorecards Breakdown */}
        <div className="p-4 sm:p-5 bg-neutral-50/60 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* Exterior */}
          <div
            onClick={() => onGoToStep(2)}
            className="p-3 bg-white rounded-lg border border-neutral-200/80 hover:border-neutral-400 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Car className="h-3.5 w-3.5 text-neutral-400" />
                Eksterior
              </span>
              <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${getGradeColor(grades.exteriorGrade).badge}`}>
                Grade {grades.exteriorGrade}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {exteriorItems.length} komponen
            </span>
          </div>

          {/* Interior */}
          <div
            onClick={() => onGoToStep(3)}
            className="p-3 bg-white rounded-lg border border-neutral-200/80 hover:border-neutral-400 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Armchair className="h-3.5 w-3.5 text-neutral-400" />
                Interior
              </span>
              <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${getGradeColor(grades.interiorGrade).badge}`}>
                Grade {grades.interiorGrade}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {interiorItems.length} komponen
            </span>
          </div>

          {/* Mechanical */}
          <div
            onClick={() => onGoToStep(4)}
            className="p-3 bg-white rounded-lg border border-neutral-200/80 hover:border-neutral-400 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Wrench className="h-3.5 w-3.5 text-neutral-400" />
                Mesin & Transmisi
              </span>
              <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${getGradeColor(grades.mechanicalGrade).badge}`}>
                Grade {grades.mechanicalGrade}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {mechanicalItems.length} komponen
            </span>
          </div>

          {/* Frame */}
          <div
            onClick={() => onGoToStep(5)}
            className="p-3 bg-white rounded-lg border border-neutral-200/80 hover:border-neutral-400 transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-neutral-400" />
                Sasis & Rangka
              </span>
              <span className={`font-bold px-1.5 py-0.2 rounded text-[11px] ${getGradeColor(grades.frameGrade).badge}`}>
                Grade {grades.frameGrade}
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-1 block">
              {frameItems.length} komponen
            </span>
          </div>

          {/* Test Drive */}
          <div
            onClick={() => onGoToStep(6)}
            className="p-3 bg-white rounded-lg border border-neutral-200/80 hover:border-neutral-400 transition-all cursor-pointer shadow-2xs col-span-2 sm:col-span-1"
          >
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
              8 uji jalan
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Vehicle & Inspection Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vehicle Master Summary */}
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <Car className="h-4 w-4 text-primary" />
              Identitas Kendaraan
            </CardTitle>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Ubah Unit
            </button>
          </CardHeader>
          <CardContent className="p-4 text-xs space-y-2">
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Nomor Polisi:</span>
              <strong className="font-mono text-neutral-900">{vehicleSpecs?.plateNumber}</strong>
            </div>
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Merek & Model:</span>
              <span className="font-semibold text-neutral-800">{vehicleSpecs?.brand} {vehicleSpecs?.model} ({vehicleSpecs?.series})</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Tahun / Transmisi:</span>
              <span className="text-neutral-800">{vehicleSpecs?.year} &middot; {vehicleSpecs?.transmission}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Nomor Rangka (VIN):</span>
              <span className="font-mono text-[11px] text-neutral-700">{vehicleSpecs?.vinChassisNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Kepemilikan:</span>
              <span className="text-neutral-800 font-medium">{vehicleSpecs?.ownership}</span>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Metadata Summary */}
        <Card className="border-neutral-200/80 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              <User className="h-4 w-4 text-primary" />
              Data Pelaksanaan Inspeksi
            </CardTitle>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="text-[11px] font-bold text-primary hover:underline"
            >
              Edit Info
            </button>
          </CardHeader>
          <CardContent className="p-4 text-xs space-y-2">
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Petugas Inspector:</span>
              <strong className="text-neutral-900">{inspectorName || "-"}</strong>
            </div>
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Tanggal Inspeksi:</span>
              <span className="font-semibold text-neutral-800">{inspectionDate}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">Lokasi Pool:</span>
              <span className="text-neutral-800">{inspectionLocation || "-"}</span>
            </div>
            <div className="flex justify-between pb-1 border-b border-neutral-100">
              <span className="text-neutral-500">KM Saat Inspeksi:</span>
              <strong className="font-mono text-neutral-900">{formatNumber(inspectionOdometer)} KM</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Catatan Inspector:</span>
              <span className="text-neutral-700 italic truncate max-w-[200px]">{inspectorNotes || "Tidak ada catatan"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Detailed Issues List */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900">
                Daftar Masalah & Temuan Kerusakan ({issueItems.length + testDriveIssues.length})
              </CardTitle>
              <p className="text-[11px] text-neutral-500">
                Seluruh komponen dengan nilai Grade C, D, E atau indikasi masalah pada uji jalan.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {issueItems.length === 0 && testDriveIssues.length === 0 ? (
            <div className="p-6 text-center text-neutral-500 text-xs flex flex-col items-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
              <span className="font-bold text-neutral-800">
                Kondisi Sempurna / Tidak Ditemukan Masalah Kritis
              </span>
              <span className="text-[11px] text-neutral-400 mt-0.5">
                Seluruh komponen mendapat nilai Grade A atau B dan uji jalan normal.
              </span>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {/* Checklist Issues */}
              {issueItems.map((item) => (
                <div key={item.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${getGradeColor(item.grade || "C").badge}`}>
                        Grade {item.grade}
                      </span>
                      <span className="font-bold text-neutral-900">{item.nameId}</span>
                      <span className="text-neutral-400 text-[10px]">({item.category})</span>
                    </div>
                    {item.note && (
                      <p className="text-neutral-600 mt-1 text-[11px] pl-2 border-l-2 border-amber-300">
                        {item.note}
                      </p>
                    )}
                  </div>
                  {item.photos && item.photos.length > 0 && (
                    <span className="text-[10px] text-blue-600 font-semibold shrink-0">
                      {item.photos.length} Foto
                    </span>
                  )}
                </div>
              ))}

              {/* Test Drive Issues */}
              {testDriveIssues.map((td) => (
                <div key={td.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold px-1.5 py-0.2 rounded text-[10px] bg-rose-600 text-white">
                        Test Drive Issue
                      </span>
                      <span className="font-bold text-neutral-900">{td.nameId}</span>
                    </div>
                    {td.note && (
                      <p className="text-neutral-600 mt-1 text-[11px] pl-2 border-l-2 border-rose-300">
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

      {/* 4. Submission Validation Banner & Action Buttons */}
      {!isFormComplete && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-sm">
              Terdapat data yang belum lengkap!
            </span>
            <span className="block mt-0.5">
              Masih terdapat <strong>{grades.ungradedItemsCount}</strong> komponen yang belum dinilai, atau informasi unit kendaraan belum dipilih. Harap lengkapi sebelum melakukan submit final.
            </span>
          </div>
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => onGoToStep(6)}
          className="text-xs sm:text-sm gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Step Sebelumnya
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            className="text-xs sm:text-sm gap-2 border-neutral-300 hover:bg-neutral-100"
          >
            <Save className="h-4 w-4 text-neutral-600" />
            Simpan sebagai Draft
          </Button>

          <Button
            type="button"
            disabled={!isFormComplete || isSubmitting}
            onClick={onSubmitInspection}
            className="text-xs sm:text-sm gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Menyimpan...</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Hasil Inspeksi
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
