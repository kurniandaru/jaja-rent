"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Camera,
  Layers,
  Car,
  Armchair,
  Wrench,
  ShieldCheck,
  Calendar,
  User,
  ZoomIn,
  Download,
} from "lucide-react";

export interface VehiclePhotoItem {
  id: string;
  url: string;
  category: "EXTERIOR" | "INTERIOR" | "ENGINE_FRAME" | "HANDOVER" | "DEFECT";
  title: string;
  inspectionId: string;
  inspectionDate: string;
  inspectorName: string;
  notes?: string;
}

interface VehiclePhotoGalleryProps {
  vehiclePlate: string;
  vehicleModel: string;
  photos: VehiclePhotoItem[];
}

export function VehiclePhotoGallery({
  vehiclePlate,
  vehicleModel,
  photos,
}: VehiclePhotoGalleryProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("ALL");
  const [previewPhoto, setPreviewPhoto] = React.useState<VehiclePhotoItem | null>(null);

  const categories = [
    { id: "ALL", label: "Semua Foto", count: photos.length },
    {
      id: "EXTERIOR",
      label: "Eksterior Bodi",
      count: photos.filter((p) => p.category === "EXTERIOR").length,
    },
    {
      id: "INTERIOR",
      label: "Interior & Kabin",
      count: photos.filter((p) => p.category === "INTERIOR").length,
    },
    {
      id: "ENGINE_FRAME",
      label: "Mesin & Kolong",
      count: photos.filter((p) => p.category === "ENGINE_FRAME").length,
    },
    {
      id: "HANDOVER",
      label: "Serah Terima BAST",
      count: photos.filter((p) => p.category === "HANDOVER").length,
    },
  ];

  const filteredPhotos = photos.filter((p) => {
    if (selectedCategory === "ALL") return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-semibold">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-neutral-900 text-white shadow-2xs font-bold"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        <span className="text-xs text-neutral-500 font-medium">
          Menampilkan {filteredPhotos.length} foto inspeksi
        </span>
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white border border-neutral-200 text-neutral-400 text-xs">
          <Camera className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
          Belum ada dokumentasi foto pada kategori ini.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setPreviewPhoto(photo)}
              className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-900 aspect-4/3 cursor-pointer shadow-2xs hover:shadow-md transition-all"
            >
              {/* Photo Image */}
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay Gradient & Badges */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute top-2 left-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs border border-white/20">
                  {photo.category}
                </span>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1 rounded-full bg-white/80 text-neutral-900">
                  <ZoomIn className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-2 left-2 right-2 text-white text-left">
                <strong className="block text-xs font-semibold truncate">
                  {photo.title}
                </strong>
                <div className="flex items-center justify-between text-[10px] text-neutral-300 mt-0.5 font-mono">
                  <span>{photo.inspectionDate}</span>
                  <span className="truncate max-w-[80px]">{photo.inspectionId}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      <Dialog open={Boolean(previewPhoto)} onOpenChange={(open) => !open && setPreviewPhoto(null)}>
        <DialogContent className="max-w-md sm:max-w-2xl bg-white border border-neutral-200">
          {previewPhoto && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-neutral-900 flex items-center justify-between">
                  <span>{previewPhoto.title}</span>
                  <span className="font-mono text-xs text-neutral-500 font-normal">
                    {previewPhoto.inspectionId}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500">
                  {vehiclePlate} &middot; {vehicleModel} &middot; Tanggal: {previewPhoto.inspectionDate}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2">
                <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 max-h-[420px] flex items-center justify-center">
                  <img
                    src={previewPhoto.url}
                    alt={previewPhoto.title}
                    className="max-h-[420px] w-auto object-contain mx-auto"
                  />
                </div>

                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Kategori Foto</span>
                    <strong className="text-neutral-900">{previewPhoto.category}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block">Inspector QC</span>
                    <strong className="text-neutral-900">{previewPhoto.inspectorName}</strong>
                  </div>
                  {previewPhoto.notes && (
                    <div className="col-span-2 pt-1 border-t border-neutral-200/60">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block">Catatan Temuan</span>
                      <p className="text-neutral-700 text-[11px]">{previewPhoto.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

