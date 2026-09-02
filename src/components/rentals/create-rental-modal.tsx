"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import {
  ReservationRecord,
  RentalRecord,
  RentalType,
} from "@/lib/types/rental";
import { mockVehicles } from "@/lib/data";
import { saveRental } from "@/lib/data/rentals";
import { saveReservation } from "@/lib/data/reservations";
import { formatCurrency } from "@/lib/utils";
import {
  Car,
  CheckCircle2,
  User,
  Building2,
  Calendar,
  MapPin,
  Sparkles,
} from "lucide-react";

interface CreateRentalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation?: ReservationRecord;
  contractId?: string;
  corporateCustomerName?: string;
}

export function CreateRentalModal({
  open,
  onOpenChange,
  reservation,
  contractId,
  corporateCustomerName,
}: CreateRentalModalProps) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = React.useState(
    reservation?.b2cRequirement?.vehicleId ||
      mockVehicles[0]?.id ||
      "B-1234-XYZ",
  );
  const [startDate, setStartDate] = React.useState(
    reservation?.b2cRequirement?.startDate ||
      reservation?.b2bRequirement?.startDate ||
      new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = React.useState(
    reservation?.b2cRequirement?.endDate ||
      new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  );
  const [pickupLocation, setPickupLocation] = React.useState(
    reservation?.b2cRequirement?.pickupLocation || "Hub Pool Sudirman, Jakarta",
  );
  const [dropoffLocation, setDropoffLocation] = React.useState(
    reservation?.b2cRequirement?.dropoffLocation ||
      "Hub Pool Sudirman, Jakarta",
  );
  const [withDriver, setWithDriver] = React.useState(
    reservation?.b2cRequirement?.withDriver ||
      reservation?.b2bRequirement?.withDriver ||
      false,
  );
  const [ratePerPeriod, setRatePerPeriod] = React.useState(
    reservation?.b2cRequirement?.dailyRate || 6800000,
  );
  const [totalAmount, setTotalAmount] = React.useState(
    reservation?.b2cRequirement?.estimatedTotal || 6800000,
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const selectedVehicle =
    mockVehicles.find((v) => v.id === vehicleId) || mockVehicles[0];
  const type: RentalType = reservation?.type || (contractId ? "B2B" : "B2C");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const rentalId = `RNT-${type}-2026-${Date.now().toString().slice(-4)}`;

    const newRental: RentalRecord = {
      id: rentalId,
      type,
      reservationId: reservation?.id,
      contractId,
      customerId: reservation?.customerId || "CORP-001",
      customerName:
        reservation?.customerName || corporateCustomerName || "Customer",
      customerPhone: reservation?.customerPhone,
      customerEmail: reservation?.customerEmail,
      customerType: type === "B2C" ? "INDIVIDUAL" : "CORPORATE",
      vehicleId: selectedVehicle.id,
      vehiclePlate: selectedVehicle.plateNumber,
      vehicleModel: `${selectedVehicle.brand} ${selectedVehicle.model}`,
      vehicleOwnership: selectedVehicle.ownership,
      vendorId: selectedVehicle.vendorId,
      vendorName: selectedVehicle.vendorName,
      withDriver,
      driverName: withDriver ? "Budi Santoso (Jaja Driver)" : undefined,
      startDate,
      endDate,
      durationText: type === "B2C" ? "3 Hari" : "12 Bulan",
      pickupLocation,
      dropoffLocation,
      ratePerPeriod: Number(ratePerPeriod),
      totalAmount: Number(totalAmount),
      paymentStatus: type === "B2C" ? "PAID" : "INVOICED",
      status: "READY_FOR_DELIVERY", // Created and waiting for delivery & handover
      delivery: {
        scheduledDate: startDate,
        scheduledTime: "08:30 WIB",
        deliveryLocation: pickupLocation,
        deliveredBy: withDriver ? "Budi Santoso (Driver)" : "Petugas Dispatch",
        recipientName:
          reservation?.customerName || corporateCustomerName || "PIC",
        recipientPhone: reservation?.customerPhone || "+62 812-0000-0000",
        status: "SCHEDULED",
      },
      handover: {
        isHandedOver: false,
      },
      inspection: {
        grade: "A",
        status: "PASSED",
        issuesCount: 0,
      },
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    await saveRental(newRental);

    // If converted from reservation, update reservation status to CONVERTED
    if (reservation) {
      await saveReservation({
        ...reservation,
        status: "CONVERTED",
        rentalId: newRental.id,
      });
    }

    setIsSubmitting(false);
    onOpenChange(false);
    router.push(`/operations/rentals/${newRental.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg bg-white border border-neutral-200">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Terbitkan Transaksi Rental Operasional
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Konversi reservasi booking / kontrak menjadi transaksi rental aktual
            dengan status awal <strong>Ready for Delivery</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400">
              Penyewa
            </span>
            <div className="font-bold text-sm text-neutral-900">
              {reservation?.customerName || corporateCustomerName} ({type})
            </div>
            {reservation && (
              <span className="text-[11px] text-neutral-500 block">
                Ref Reservasi:{" "}
                <strong className="font-mono">{reservation.id}</strong>
              </span>
            )}
            {contractId && (
              <span className="text-[11px] text-neutral-500 block">
                Ref Kontrak: <strong className="font-mono">{contractId}</strong>
              </span>
            )}
          </div>

          <div>
            <label className="font-semibold text-neutral-700 block mb-1">
              Unit Kendaraan yang Ditugaskan{" "}
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full h-9 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              {mockVehicles
                .filter((v) =>
                  type === "B2C" ? v.ownership === "JAJA_OWNED" : true,
                )
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.brand} {v.model} (
                    {v.ownership === "JAJA_OWNED"
                      ? "Jaja Owned"
                      : "Vendor Owned"}
                    )
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8.5 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Tanggal Selesai
              </label>
              <Input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Lokasi Pick-up
              </label>
              <Input
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="h-8.5 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Lokasi Drop-off
              </label>
              <Input
                value={dropoffLocation}
                onChange={(e) => setDropoffLocation(e.target.value)}
                className="h-8.5 text-xs"
              />
            </div>
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
              className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting
                ? "Memproses..."
                : "Buat Rental & Jadwalkan Delivery"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
