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
import { mockVendors } from "@/lib/data";
import { VendorQuotation } from "@/lib/types/sourcing";
import { formatCurrency } from "@/lib/utils";
import { Building2, Calculator, ShieldCheck } from "lucide-react";

interface AddQuotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservationId: string;
  defaultVehicleType?: string;
  defaultQuantity?: number;
  onQuotationAdded: (quote: Omit<VendorQuotation, "id" | "reservationId" | "submittedDate">) => void;
}

export function AddQuotationModal({
  open,
  onOpenChange,
  reservationId,
  defaultVehicleType = "Toyota Avanza 1.5 G",
  defaultQuantity = 5,
  onQuotationAdded,
}: AddQuotationModalProps) {
  const [vendorId, setVendorId] = React.useState(mockVendors[0]?.id || "VND-001");
  const [vehicleModel, setVehicleModel] = React.useState(defaultVehicleType);
  const [quantity, setQuantity] = React.useState(defaultQuantity);
  const [rentalPeriodMonths, setRentalPeriodMonths] = React.useState(12);

  const [vendorCost, setVendorCost] = React.useState(5500000);
  const [customerPrice, setCustomerPrice] = React.useState(6800000);

  const [maintenanceIncluded, setMaintenanceIncluded] = React.useState(true);
  const [insuranceIncluded, setInsuranceIncluded] = React.useState(true);
  const [driverIncluded, setDriverIncluded] = React.useState(false);
  const [replacementUnitGuaranteed, setReplacementUnitGuaranteed] = React.useState(true);

  const [slaDescription, setSlaDescription] = React.useState(
    "SLA Emergency perbaikan < 4 jam, garansi unit pengganti maks 6 jam."
  );
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    if (defaultVehicleType) setVehicleModel(defaultVehicleType);
    if (defaultQuantity) setQuantity(defaultQuantity);
  }, [defaultVehicleType, defaultQuantity]);

  const selectedVendor = mockVendors.find((v) => v.id === vendorId) || mockVendors[0];
  const grossMargin = customerPrice - vendorCost;
  const marginPercentage = customerPrice > 0 ? Math.round((grossMargin / customerPrice) * 100) : 0;
  const totalMonthlyGrossMargin = grossMargin * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onQuotationAdded({
      vendorId: selectedVendor.id,
      vendorName: selectedVendor.name,
      vehicleModel,
      quantity: Number(quantity),
      vendorCostPerMonth: Number(vendorCost),
      customerPricePerMonth: Number(customerPrice),
      grossMarginPerUnit: grossMargin,
      rentalPeriodMonths: Number(rentalPeriodMonths),
      maintenanceIncluded,
      insuranceIncluded,
      driverIncluded,
      replacementUnitGuaranteed,
      slaDescription,
      notes: notes || undefined,
      status: "PENDING",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl bg-white border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Tambah Penawaran Vendor (Sourcing Quotation)
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Catat rincian penawaran harga sewa vendor untuk membandingkan margin profit sebelum kontrak diterbitkan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Mitra Vendor <span className="text-rose-500">*</span>
              </label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {mockVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Model & Tipe Kendaraan <span className="text-rose-500">*</span>
              </label>
              <Input
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="Contoh: Toyota Avanza 1.5 G CVT 2024"
                className="h-8.5 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Jumlah Unit Ditawarkan
              </label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-8.5 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Durasi Kontrak (Bulan)
              </label>
              <Input
                type="number"
                min={1}
                value={rentalPeriodMonths}
                onChange={(e) => setRentalPeriodMonths(Number(e.target.value))}
                className="h-8.5 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Pricing & Margin Calculator Card */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-200">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-primary" />
                Kalkulasi Harga & Margin Profit B2B
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">per unit / bulan</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Biaya Sewa Vendor (Vendor Cost) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  step={50000}
                  value={vendorCost}
                  onChange={(e) => setVendorCost(Number(e.target.value))}
                  className="h-8.5 text-xs font-mono font-bold bg-white"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  {formatCurrency(vendorCost)}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Harga ke Customer (Customer Price) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  step={50000}
                  value={customerPrice}
                  onChange={(e) => setCustomerPrice(Number(e.target.value))}
                  className="h-8.5 text-xs font-mono font-bold bg-white text-emerald-700"
                />
                <span className="text-[10px] text-emerald-600 mt-0.5 block font-semibold">
                  {formatCurrency(customerPrice)}
                </span>
              </div>
            </div>

            {/* Calculated Gross Margin Output */}
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-800 font-semibold block">
                  Estimasi Gross Margin:
                </span>
                <span className="text-[10px] text-emerald-600">
                  Total {quantity} unit $\times$ {rentalPeriodMonths} bulan
                </span>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm text-emerald-700">
                  +{formatCurrency(grossMargin)} <span className="text-xs">({marginPercentage}%)</span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-emerald-800">
                  Total Profit: {formatCurrency(totalMonthlyGrossMargin * rentalPeriodMonths)}
                </span>
              </div>
            </div>
          </div>

          {/* SLA & Feature Checkboxes */}
          <div className="space-y-2">
            <span className="font-semibold text-neutral-700 block">
              Fasilitas yang Termasuk dalam Penawaran:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200 bg-white cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={maintenanceIncluded}
                  onChange={(e) => setMaintenanceIncluded(e.target.checked)}
                  className="rounded text-primary"
                />
                <span className="font-medium">Termasuk Maintenance</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200 bg-white cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={insuranceIncluded}
                  onChange={(e) => setInsuranceIncluded(e.target.checked)}
                  className="rounded text-primary"
                />
                <span className="font-medium">Termasuk Asuransi All-Risk</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200 bg-white cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={replacementUnitGuaranteed}
                  onChange={(e) => setReplacementUnitGuaranteed(e.target.checked)}
                  className="rounded text-primary"
                />
                <span className="font-medium">Garansi Unit Pengganti</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-neutral-200 bg-white cursor-pointer hover:bg-neutral-50">
                <input
                  type="checkbox"
                  checked={driverIncluded}
                  onChange={(e) => setDriverIncluded(e.target.checked)}
                  className="rounded text-primary"
                />
                <span className="font-medium">Termasuk Driver Vendor</span>
              </label>
            </div>
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Ketentuan SLA Perbaikan & Tanggap Darurat
            </label>
            <Input
              value={slaDescription}
              onChange={(e) => setSlaDescription(e.target.value)}
              placeholder="Contoh: SLA perbaikan maks 4 jam..."
              className="h-8.5 text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Catatan Negosiasi Tambahan
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan mengenai ketersediaan unit, kondisi NIK, atau diskon volume..."
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
              size="sm"
              className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              Simpan Penawaran Vendor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
