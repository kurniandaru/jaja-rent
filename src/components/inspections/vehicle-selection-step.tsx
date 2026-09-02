"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VehicleMasterSpecs } from "@/lib/types/inspection";
import { Vehicle } from "@/lib/types/fleet";
import { mockVehicles } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import {
  Car,
  Search,
  CheckCircle2,
  Calendar,
  MapPin,
  Gauge,
  User,
  FileText,
  Info,
} from "lucide-react";

interface VehicleSelectionStepProps {
  selectedVehicle: VehicleMasterSpecs | null;
  onSelectVehicle: (specs: VehicleMasterSpecs) => void;
  inspectorName: string;
  onChangeInspectorName: (val: string) => void;
  inspectionDate: string;
  onChangeInspectionDate: (val: string) => void;
  inspectionLocation: string;
  onChangeInspectionLocation: (val: string) => void;
  inspectionOdometer: number;
  onChangeInspectionOdometer: (val: number) => void;
  inspectorNotes: string;
  onChangeInspectorNotes: (val: string) => void;
}

export function VehicleSelectionStep({
  selectedVehicle,
  onSelectVehicle,
  inspectorName,
  onChangeInspectorName,
  inspectionDate,
  onChangeInspectionDate,
  inspectionLocation,
  onChangeInspectionLocation,
  inspectionOdometer,
  onChangeInspectionOdometer,
  inspectorNotes,
  onChangeInspectorNotes,
}: VehicleSelectionStepProps) {
  const [search, setSearch] = React.useState("");

  const filteredVehicles = mockVehicles.filter((v) => {
    const s = search.toLowerCase();
    return (
      v.plateNumber.toLowerCase().includes(s) ||
      v.brand.toLowerCase().includes(s) ||
      v.model.toLowerCase().includes(s) ||
      v.vin.toLowerCase().includes(s)
    );
  });

  const handleChooseVehicle = (v: Vehicle) => {
    const specs: VehicleMasterSpecs = {
      vehicleId: v.id,
      plateNumber: v.plateNumber,
      brand: v.brand,
      model: v.model.split(" ")[0] || v.model,
      series: v.model.split(" ").slice(1).join(" ") || "Standard",
      engineCapacityCc: v.fuelType === "Diesel" ? 2393 : 1496,
      vehicleType: v.seatCapacity > 5 ? "MPV / Minibus" : "Sedan / Hatchback",
      transmission: v.transmission,
      year: v.year,
      lastOdometer: v.odometer,
      color: v.color,
      bodyModel: "Passenger Car",
      fuelType: v.fuelType,
      vinChassisNumber: v.vin,
      engineNumber: v.engineNumber,
      taxExpiryDate: "2026-11-20",
      ownership:
        v.ownership === "JAJA_OWNED"
          ? "PT Jaja Rent Indonesia (Jaja-Owned)"
          : `${v.vendorName || "Mitra Vendor"} (Vendor-Owned)`,
    };

    onSelectVehicle(specs);
    if (!inspectionOdometer || inspectionOdometer === 0) {
      onChangeInspectionOdometer(v.odometer);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Searchable Vehicle Selector */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-2">
                <Car className="h-4.5 w-4.5 text-primary" />
                Pilih Kendaraan yang Akan Diinspeksi
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Cari berdasarkan nomor polisi, tipe, atau nomor rangka (VIN).
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Cari Plat B 1234 XYZ / Avanza..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8.5 h-8.5 text-xs bg-neutral-50/70"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5">
          {/* Quick Select Carousel / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto p-1">
            {filteredVehicles.slice(0, 9).map((v) => {
              const isSelected = selectedVehicle?.vehicleId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => handleChooseVehicle(v)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : "bg-white hover:bg-neutral-50 border-neutral-200/80 text-neutral-900"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm tracking-tight font-mono">
                        {v.plateNumber}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      )}
                    </div>
                    <div
                      className={`text-[11px] truncate mt-0.5 ${
                        isSelected ? "text-neutral-300" : "text-neutral-500"
                      }`}
                    >
                      {v.brand} {v.model} &middot; {v.year}
                    </div>
                    <div
                      className={`text-[10px] mt-1 ${
                        isSelected ? "text-neutral-400" : "text-neutral-400"
                      }`}
                    >
                      {v.ownership === "JAJA_OWNED" ? "Jaja Owned" : "Vendor Owned"} &middot; {formatNumber(v.odometer)} KM
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold shrink-0 transition-colors ${
                      isSelected
                        ? "bg-white text-neutral-900"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {isSelected ? "Terpilih" : "Pilih"}
                  </button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Auto-Populated Read-Only Master Vehicle Specs */}
      {selectedVehicle ? (
        <Card className="border-neutral-200/80 shadow-xs bg-neutral-50/50">
          <CardHeader className="p-4 sm:p-5 border-b border-neutral-200/80 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-primary" />
                  Data Master Kendaraan (Read-Only)
                </CardTitle>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Informasi teknis dan legalitas ditarik otomatis dari database armada Jaja-Rent.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Terverifikasi
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Nomor Polisi
                </span>
                <span className="font-mono font-bold text-sm text-neutral-900 block mt-0.5">
                  {selectedVehicle.plateNumber}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Merek & Model
                </span>
                <span className="font-semibold text-neutral-900 block mt-0.5">
                  {selectedVehicle.brand} {selectedVehicle.model}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Seri / Varian
                </span>
                <span className="font-semibold text-neutral-800 block mt-0.5 truncate">
                  {selectedVehicle.series}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Tahun / Transmisi
                </span>
                <span className="font-semibold text-neutral-800 block mt-0.5">
                  {selectedVehicle.year} &middot; {selectedVehicle.transmission}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Kapasitas Mesin (CC)
                </span>
                <span className="font-semibold text-neutral-800 block mt-0.5">
                  {selectedVehicle.engineCapacityCc} CC ({selectedVehicle.fuelType})
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Warna Bodi
                </span>
                <span className="font-semibold text-neutral-800 block mt-0.5">
                  {selectedVehicle.color}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  KM Terakhir Tercatat
                </span>
                <span className="font-mono font-bold text-neutral-900 block mt-0.5">
                  {formatNumber(selectedVehicle.lastOdometer)} KM
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Masa Berlaku Pajak
                </span>
                <span className="font-semibold text-neutral-800 block mt-0.5">
                  {selectedVehicle.taxExpiryDate}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs col-span-2">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Nomor Rangka (VIN / Chassis)
                </span>
                <span className="font-mono font-semibold text-neutral-900 block mt-0.5 text-xs truncate">
                  {selectedVehicle.vinChassisNumber}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-neutral-200/70 shadow-2xs col-span-2">
                <span className="text-neutral-400 uppercase text-[10px] font-semibold block">
                  Nomor Mesin & Kepemilikan
                </span>
                <span className="font-mono font-semibold text-neutral-900 block mt-0.5 text-xs truncate">
                  {selectedVehicle.engineNumber} &middot; {selectedVehicle.ownership}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="p-8 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50 text-center text-neutral-400 text-xs">
          <Info className="h-6 w-6 mx-auto mb-2 text-neutral-400" />
          Silakan pilih unit kendaraan di atas untuk memuat spesifikasi master otomatis.
        </div>
      )}

      {/* 3. Inspection-Specific Editable Fields */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100">
          <CardTitle className="text-sm sm:text-base font-bold text-neutral-900 flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-primary" />
            Informasi Pelaksanaan Inspeksi
          </CardTitle>
          <p className="text-xs text-neutral-500 mt-0.5">
            Lengkapi data petugas pemeriksa, lokasi pool, dan angka odometer terkini saat inspeksi.
          </p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Nama Inspector <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  value={inspectorName}
                  onChange={(e) => onChangeInspectorName(e.target.value)}
                  placeholder="Nama petugas inspeksi"
                  className="pl-8.5 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Tanggal Inspeksi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => onChangeInspectionDate(e.target.value)}
                  className="pl-8.5 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Lokasi Pool / Hub <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  value={inspectionLocation}
                  onChange={(e) => onChangeInspectionLocation(e.target.value)}
                  placeholder="Contoh: Pool Sudirman / Dispatch Hub"
                  className="pl-8.5 h-9 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                KM Saat Inspeksi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  type="number"
                  value={inspectionOdometer || ""}
                  onChange={(e) => onChangeInspectionOdometer(Number(e.target.value))}
                  placeholder="Angka odometer saat ini"
                  className="pl-8.5 h-9 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">
              Catatan Awal Petugas
            </label>
            <Textarea
              value={inspectorNotes}
              onChange={(e) => onChangeInspectorNotes(e.target.value)}
              placeholder="Catatan umum atau latar belakang inspeksi (misal: Inspeksi berkala 6 bulan / serah terima klien B2B)..."
              rows={3}
              className="text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
