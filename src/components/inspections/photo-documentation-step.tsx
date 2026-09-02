"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PhotoDocumentation } from "@/lib/types/inspection";
import {
  Camera,
  FileCheck2,
  AlertOctagon,
  X,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

interface PhotoDocumentationStepProps {
  photos: PhotoDocumentation;
  onChangePhotos: (photos: PhotoDocumentation) => void;
}

const SAMPLE_PHOTO_STOCK = [
  "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1597687210367-a4915552d890?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=600&auto=format&fit=crop&q=80",
];

export function PhotoDocumentationStep({
  photos,
  onChangePhotos,
}: PhotoDocumentationStepProps) {
  const handleUploadPhoto = (key: keyof PhotoDocumentation, customUrl?: string) => {
    const url =
      customUrl ||
      SAMPLE_PHOTO_STOCK[Math.floor(Math.random() * SAMPLE_PHOTO_STOCK.length)];
    onChangePhotos({
      ...photos,
      [key]: url,
    });
  };

  const handleRemovePhoto = (key: keyof PhotoDocumentation) => {
    const updated = { ...photos };
    delete updated[key];
    onChangePhotos(updated);
  };

  const renderPhotoCard = (
    title: string,
    key: keyof PhotoDocumentation,
    subtitle?: string,
    isRequired: boolean = false
  ) => {
    const currentPhotoUrl = photos[key] as string | undefined;

    return (
      <div className="border border-neutral-200/90 rounded-xl p-3 bg-white flex flex-col justify-between hover:border-neutral-300 transition-all shadow-2xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-xs text-neutral-900 flex items-center gap-1.5">
              {title}
              {isRequired && <span className="text-rose-500">*</span>}
            </span>
            {currentPhotoUrl && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Terunggah
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] text-neutral-400 mb-2 leading-tight">
              {subtitle}
            </p>
          )}
        </div>

        {/* Photo Box */}
        <div className="mt-2">
          {currentPhotoUrl ? (
            <div className="relative group rounded-lg overflow-hidden border border-neutral-200 aspect-video bg-neutral-100">
              <img
                src={currentPhotoUrl}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUploadPhoto(key)}
                  className="p-1.5 rounded-full bg-white/90 hover:bg-white text-neutral-900 shadow-md text-xs font-bold"
                  title="Ganti Foto"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(key)}
                  className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-md"
                  title="Hapus Foto"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleUploadPhoto(key)}
              className="border-2 border-dashed border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/80 rounded-lg aspect-video flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all bg-neutral-50/40"
            >
              <div className="p-2 rounded-full bg-neutral-100 text-neutral-500 mb-1.5">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-bold text-neutral-700">
                Ambil / Upload Foto
              </span>
              <span className="text-[9px] text-neutral-400 mt-0.5">
                Klik untuk mengunggah file gambar
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Vehicle Standard 6 Angles */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-neutral-900 text-white">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-neutral-900">
                1. Dokumentasi Foto Standar Kendaraan (6 Sisi Utama)
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Foto kendaraan secara menyeluruh untuk bukti visual kondisi fisik sebelum serah terima.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {renderPhotoCard("Depan Kanan (Right Front)", "rightFront", "Sudut 45 derajat bagian depan kanan", true)}
            {renderPhotoCard("Depan Kiri (Left Front)", "leftFront", "Sudut 45 derajat bagian depan kiri", true)}
            {renderPhotoCard("Belakang Kanan (Right Rear)", "rightRear", "Sudut 45 derajat bagian belakang kanan", true)}
            {renderPhotoCard("Belakang Kiri (Left Rear)", "leftRear", "Sudut 45 derajat bagian belakang kiri", true)}
            {renderPhotoCard("Dashboard & Kabin Depan", "dashboard", "Tampilan speedometer, setir, dan konsol tengah", true)}
            {renderPhotoCard("Ruang Mesin (Engine Bay)", "engine", "Kondisi kompartemen mesin dan kabel-kabel", true)}
          </div>
        </CardContent>
      </Card>

      {/* 2. Legal Documents Photos */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-purple-100 text-purple-800">
              <FileCheck2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-neutral-900">
                2. Foto Dokumen Legalitas Kendaraan
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Foto dokumen asli STNK dan BPKB yang masih berlaku.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderPhotoCard("Foto STNK (Lembar Pajak & Identitas)", "stnk", "Pastikan plat dan tanggal pajak terbaca jelas", true)}
            {renderPhotoCard("Foto BPKB / Faktur Pembelian", "bpkb", "Halaman identitas pemilik dan nomor rangka", false)}
          </div>
        </CardContent>
      </Card>

      {/* 3. Damage Detail Photos */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-amber-100 text-amber-800">
              <AlertOctagon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-neutral-900">
                3. Foto Detail Kerusakan / Baret / Penyok Tambahan
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Foto close-up setiap titik baret, retak kaca, atau indikasi kerusakan sasis.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {renderPhotoCard("Detail Kerusakan Depan Kanan", "damageRightFront", "Close-up bumper/fender depan kanan")}
            {renderPhotoCard("Detail Kerusakan Depan Kiri", "damageLeftFront", "Close-up bumper/fender depan kiri")}
            {renderPhotoCard("Detail Kerusakan Belakang Kanan", "damageRightRear", "Close-up bodi/pintu belakang kanan")}
            {renderPhotoCard("Detail Kerusakan Belakang Kiri", "damageLeftRear", "Close-up bodi/pintu belakang kiri")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
