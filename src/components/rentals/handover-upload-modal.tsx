"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VehicleHandover } from "@/lib/types/rental";
import { confirmVehicleHandover } from "@/lib/data/rentals";
import {
  FileCheck2,
  Upload,
  Camera,
  CheckCircle2,
  Calendar,
  MapPin,
  User,
  Gauge,
  Fuel,
} from "lucide-react";

interface HandoverUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rentalId: string;
  customerName: string;
  plateNumber: string;
  defaultLocation?: string;
  onHandoverConfirmed: () => void;
}

export function HandoverUploadModal({
  open,
  onOpenChange,
  rentalId,
  customerName,
  plateNumber,
  defaultLocation = "Lokasi Customer",
  onHandoverConfirmed,
}: HandoverUploadModalProps) {
  const [handoverDate, setHandoverDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [handoverTime, setHandoverTime] = React.useState("10:00 WIB");
  const [location, setLocation] = React.useState(defaultLocation);
  const [handedBy, setHandedBy] = React.useState("Petugas Dispatch Jaja");
  const [receivedBy, setReceivedBy] = React.useState(customerName);
  const [odometerAtHandover, setOdometerAtHandover] = React.useState(45200);
  const [fuelLevelPercent, setFuelLevelPercent] = React.useState(100);
  const [notes, setNotes] = React.useState("Unit diserahkan dalam kondisi bersih, STNK dan kunci asli lengkap.");

  const [documentUrl, setDocumentUrl] = React.useState<string>(
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80"
  );
  const [photos, setPhotos] = React.useState<string[]>([
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
  ]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const handoverData: Partial<VehicleHandover> = {
      isHandedOver: true,
      handoverDate,
      handoverTime,
      location,
      handedBy,
      receivedBy,
      odometerAtHandover: Number(odometerAtHandover),
      fuelLevelPercent: Number(fuelLevelPercent),
      notes,
      documentName: `BAST_${rentalId}_${plateNumber.replace(/\s+/g, "")}.pdf`,
      documentUrl,
      photos,
      confirmedAt: new Date().toISOString(),
    };

    await confirmVehicleHandover(rentalId, handoverData);
    setIsSubmitting(false);
    onOpenChange(false);
    onHandoverConfirmed();
  };

  const handleSimulatePhotoUpload = () => {
    const sample =
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80";
    setPhotos((prev) => [...prev, sample]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl bg-white border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-emerald-600" />
            Upload Bukti Serah Terima Kendaraan (BAST)
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Sesuai Standard Operasional, rental baru akan berstatus <strong>ACTIVE</strong> setelah Bukti Serah Terima dan foto kondisi fisik di-upload.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Unit & Customer Header */}
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">No. Rental & Unit</span>
              <strong className="text-xs text-neutral-900 font-mono">{rentalId} &middot; {plateNumber}</strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Penyewa / PIC</span>
              <span className="text-xs font-semibold text-neutral-800">{customerName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Tanggal Serah Terima <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  type="date"
                  required
                  value={handoverDate}
                  onChange={(e) => setHandoverDate(e.target.value)}
                  className="pl-8.5 h-8.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Waktu Serah Terima
              </label>
              <Input
                value={handoverTime}
                onChange={(e) => setHandoverTime(e.target.value)}
                placeholder="Contoh: 09:30 WIB"
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Diserahkan Oleh (Petugas Jaja) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  required
                  value={handedBy}
                  onChange={(e) => setHandedBy(e.target.value)}
                  className="pl-8.5 h-8.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Diterima Oleh (Penyewa / PIC) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  required
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="pl-8.5 h-8.5 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Odometer Saat Diserahkan (KM)
              </label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  type="number"
                  value={odometerAtHandover}
                  onChange={(e) => setOdometerAtHandover(Number(e.target.value))}
                  className="pl-8.5 h-8.5 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Kondisi Bahan Bakar (% BBM)
              </label>
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={fuelLevelPercent}
                  onChange={(e) => setFuelLevelPercent(Number(e.target.value))}
                  className="pl-8.5 h-8.5 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Lokasi Serah Terima
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Alamat serah terima..."
                className="pl-8.5 h-8.5 text-xs"
              />
            </div>
          </div>

          {/* Document & Photo Attachment Section */}
          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-3">
            <span className="font-bold text-neutral-900 block flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-primary" />
              File Dokumen BAST & Foto Dokumentasi
            </span>

            {/* Document preview */}
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-white">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <div>
                  <span className="font-bold text-xs text-neutral-800 block">
                    BAST_{rentalId}.pdf
                  </span>
                  <span className="text-[10px] text-neutral-400">Dokumen Digital Terverifikasi</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Terlampir
              </span>
            </div>

            {/* Photos */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-neutral-600">
                  Foto Fisik Kendaraan saat Diserahkan ({photos.length}):
                </span>
                <button
                  type="button"
                  onClick={handleSimulatePhotoUpload}
                  className="text-[10px] font-bold text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Camera className="h-3 w-3" />
                  + Tambah Foto
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {photos.map((url, idx) => (
                  <div key={idx} className="h-14 w-14 rounded-md overflow-hidden border border-neutral-200 bg-white">
                    <img src={url} alt="Foto Serah Terima" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">Catatan Tambahan</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-xs"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="sm"
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : "Konfirmasi BAST & Aktifkan Rental"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
