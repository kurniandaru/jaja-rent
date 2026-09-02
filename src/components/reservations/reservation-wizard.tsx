"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AddCustomerModal } from "@/components/customers/add-customer-modal";
import { IndividualCustomer, CorporateCustomer } from "@/lib/types/customer";
import {
  ReservationRecord,
  RentalType,
  B2CRequirement,
  B2BRequirement,
} from "@/lib/types/rental";
import {
  getIndividualCustomers,
  getCorporateCustomers,
} from "@/lib/data/customers";
import { mockVehicles } from "@/lib/data";
import { saveReservation } from "@/lib/data/reservations";
import { evaluateCustomerEligibility } from "@/lib/services/eligibility-engine";
import { EligibilityBadge } from "@/components/customers/eligibility-badge";
import { KycDocumentViewer } from "@/components/customers/kyc-document-viewer";
import { AgreementAcceptanceModal } from "@/components/customers/agreement-acceptance-modal";
import { CustomerDocument } from "@/lib/types/customer";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  User,
  Building2,
  Car,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Check,
  Save,
  Send,
} from "lucide-react";

export function ReservationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Customer Master Lists
  const [individualCustomers, setIndividualCustomers] = React.useState<
    IndividualCustomer[]
  >([]);
  const [corporateCustomers, setCorporateCustomers] = React.useState<
    CorporateCustomer[]
  >([]);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] =
    React.useState(false);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = React.useState(false);
  const [isDocViewerOpen, setIsDocViewerOpen] = React.useState(false);
  const [selectedDocToReview, setSelectedDocToReview] =
    React.useState<CustomerDocument | null>(null);

  // Wizard States
  const [rentalType, setRentalType] = React.useState<RentalType>("B2C");
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");

  const reloadCustomers = React.useCallback(async () => {
    const ind = await getIndividualCustomers();
    const corp = await getCorporateCustomers();
    setIndividualCustomers(ind);
    setCorporateCustomers(corp);
  }, []);

  // Step 2: B2C States
  const [selectedVehicleId, setSelectedVehicleId] = React.useState(
    mockVehicles[0]?.id || "B-1234-XYZ",
  );
  const [b2cStartDate, setB2cStartDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [b2cEndDate, setB2cEndDate] = React.useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
  );
  const [b2cDurationDays, setB2cDurationDays] = React.useState(3);
  const [b2cPickupLoc, setB2cPickupLoc] = React.useState(
    "Hub Pool Sudirman, Jakarta",
  );
  const [b2cDropoffLoc, setB2cDropoffLoc] = React.useState(
    "Hub Pool Sudirman, Jakarta",
  );
  const [b2cWithDriver, setB2cWithDriver] = React.useState(false);
  const [b2cDailyRate, setB2cDailyRate] = React.useState(550000);

  // Step 2: B2B States
  const [b2bVehicleType, setB2bVehicleType] = React.useState(
    "Toyota Avanza 1.5 G / Veloz",
  );
  const [b2bQuantity, setB2bQuantity] = React.useState(5);
  const [b2bStartDate, setB2bStartDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [b2bDurationMonths, setB2bDurationMonths] = React.useState(12);
  const [b2bCityLocation, setB2bCityLocation] = React.useState(
    "Jakarta & Jabodetabek",
  );
  const [b2bWithDriver, setB2bWithDriver] = React.useState(true);
  const [b2bWithMaintenance, setB2bWithMaintenance] = React.useState(true);
  const [b2bWithInsurance, setB2bWithInsurance] = React.useState(true);
  const [b2bBudgetMonthly, setB2bBudgetMonthly] = React.useState(6800000);
  const [notes, setNotes] = React.useState("");

  // Load customers
  React.useEffect(() => {
    async function load() {
      const ind = await getIndividualCustomers();
      const corp = await getCorporateCustomers();
      setIndividualCustomers(ind);
      setCorporateCustomers(corp);

      if (rentalType === "B2C" && ind.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(ind[0].id);
      } else if (
        rentalType === "B2B" &&
        corp.length > 0 &&
        !selectedCustomerId
      ) {
        setSelectedCustomerId(corp[0].id);
      }
    }
    load();
  }, [rentalType]);

  // Selected Customer details
  const selectedIndividual = individualCustomers.find(
    (c) => c.id === selectedCustomerId,
  );
  const selectedCorporate = corporateCustomers.find(
    (c) => c.id === selectedCustomerId,
  );
  const selectedVehicle = mockVehicles.find((v) => v.id === selectedVehicleId);
  const currentCustomer =
    rentalType === "B2C" ? selectedIndividual : selectedCorporate;
  const eligibility = currentCustomer
    ? evaluateCustomerEligibility(currentCustomer)
    : null;

  // Handle new customer created inline
  const handleCustomerCreated = async (newCust: {
    id: string;
    name: string;
    phone: string;
    type: "INDIVIDUAL" | "CORPORATE";
  }) => {
    await reloadCustomers();
    setRentalType(newCust.type === "INDIVIDUAL" ? "B2C" : "B2B");
    setSelectedCustomerId(newCust.id);
  };

  const handleB2cDaysChange = (days: number) => {
    setB2cDurationDays(days);
    const start = new Date(b2cStartDate);
    const end = new Date(start.getTime() + days * 86400000);
    setB2cEndDate(end.toISOString().split("T")[0]);
  };

  const calculateB2cTotal = () => {
    const base = b2cDailyRate * b2cDurationDays;
    const driverCost = b2cWithDriver ? 200000 * b2cDurationDays : 0;
    return base + driverCost;
  };

  const handleSubmit = async (status: "DRAFT" | "CONFIRMED" | "PENDING") => {
    setIsSubmitting(true);
    const reservationId = `RSV-2026-${rentalType}-${Date.now().toString().slice(-4)}`;

    const b2cReq: B2CRequirement | undefined =
      rentalType === "B2C"
        ? {
            vehicleId: selectedVehicle?.id,
            vehicleModel: selectedVehicle
              ? `${selectedVehicle.brand} ${selectedVehicle.model}`
              : "Toyota Avanza",
            plateNumber: selectedVehicle?.plateNumber,
            startDate: b2cStartDate,
            endDate: b2cEndDate,
            durationDays: b2cDurationDays,
            pickupLocation: b2cPickupLoc,
            dropoffLocation: b2cDropoffLoc,
            withDriver: b2cWithDriver,
            driverOption: b2cWithDriver ? "WITH_JAJA_DRIVER" : "SELF_DRIVE",
            dailyRate: b2cDailyRate,
            estimatedTotal: calculateB2cTotal(),
          }
        : undefined;

    const b2bReq: B2BRequirement | undefined =
      rentalType === "B2B"
        ? {
            vehicleType: b2bVehicleType,
            quantity: Number(b2bQuantity),
            startDate: b2bStartDate,
            durationMonths: Number(b2bDurationMonths),
            cityLocation: b2bCityLocation,
            withDriver: b2bWithDriver,
            withMaintenance: b2bWithMaintenance,
            withInsurance: b2bWithInsurance,
            targetBudgetPerUnitMonthly: Number(b2bBudgetMonthly),
            notes,
          }
        : undefined;

    const customerName =
      rentalType === "B2C"
        ? selectedIndividual?.name || "Customer"
        : selectedCorporate?.name || "Corporate Customer";

    const customerPhone =
      rentalType === "B2C"
        ? selectedIndividual?.phone || "+62 812-0000-0000"
        : selectedCorporate?.pic?.phone || "+62 812-0000-0000";

    const customerEmail =
      rentalType === "B2C"
        ? selectedIndividual?.email
        : selectedCorporate?.pic?.email;

    const record: ReservationRecord = {
      id: reservationId,
      type: rentalType,
      customerId: selectedCustomerId,
      customerName,
      customerPhone,
      customerEmail,
      customerType: rentalType === "B2C" ? "INDIVIDUAL" : "CORPORATE",
      b2cRequirement: b2cReq,
      b2bRequirement: b2bReq,
      vendorQuotations: [],
      status,
      notes,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    await saveReservation(record);
    setIsSubmitting(false);
    router.push(`/operations/reservations/${record.id}`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Wizard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
              New Reservation
            </span>
            <span className="text-xs font-bold text-primary">
              {rentalType === "B2C"
                ? "B2C Individual Booking"
                : "B2B Corporate Requirement"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Buat Reservasi Kendaraan
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/operations/reservations")}
          className="text-xs text-neutral-600"
        >
          Batal & Kembali
        </Button>
      </div>

      {/* 3 Steps Indicator */}
      <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4 max-w-2xl mx-auto">
        {[
          { id: 1, title: "1. Pilih Customer", desc: "B2C atau Corporate" },
          { id: 2, title: "2. Detail Kebutuhan", desc: "Unit, Durasi, Lokasi" },
          { id: 3, title: "3. Review & Submit", desc: "Konfirmasi Reservasi" },
        ].map((step, idx) => (
          <div
            key={step.id}
            onClick={() => setCurrentStep(step.id)}
            className={`flex items-center gap-2.5 cursor-pointer ${
              currentStep === step.id
                ? "text-neutral-900 font-bold"
                : currentStep > step.id
                  ? "text-emerald-700 font-semibold"
                  : "text-neutral-400"
            }`}
          >
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                currentStep === step.id
                  ? "bg-neutral-900 text-white shadow-xs"
                  : currentStep > step.id
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {currentStep > step.id ? (
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              ) : (
                step.id
              )}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs block">{step.title}</span>
              <span className="text-[10px] text-neutral-400 block font-normal">
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Customer Selection */}
      {currentStep === 1 && (
        <Card className="border-neutral-200/80 shadow-xs max-w-3xl mx-auto">
          <CardHeader className="p-4 sm:p-6 border-b border-neutral-100">
            <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <User className="h-4.5 w-4.5 text-primary" />
              Pilih Tipe Rental & Pelanggan
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tentukan apakah pemesanan diperuntukkan bagi customer individu
              (B2C) atau korporasi (B2B).
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-5">
            {/* Segmented B2C vs B2B Buttons */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-2">
                Model Bisnis Rental:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRentalType("B2C");
                    if (individualCustomers[0])
                      setSelectedCustomerId(individualCustomers[0].id);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    rentalType === "B2C"
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                      : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User
                      className={`h-4 w-4 ${rentalType === "B2C" ? "text-white" : "text-primary"}`}
                    />
                    <span className="font-bold text-sm">
                      B2C Rental (Perorangan)
                    </span>
                  </div>
                  <p
                    className={`text-xs ${rentalType === "B2C" ? "text-neutral-300" : "text-neutral-500"}`}
                  >
                    Rental harian/mingguan untuk pelanggan individu dengan unit
                    armada milik Jaja.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRentalType("B2B");
                    if (corporateCustomers[0])
                      setSelectedCustomerId(corporateCustomers[0].id);
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    rentalType === "B2B"
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                      : "bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building2
                      className={`h-4 w-4 ${rentalType === "B2B" ? "text-white" : "text-primary"}`}
                    />
                    <span className="font-bold text-sm">
                      B2B Rent-to-Rent (Korporat)
                    </span>
                  </div>
                  <p
                    className={`text-xs ${rentalType === "B2B" ? "text-neutral-300" : "text-neutral-500"}`}
                  >
                    Pengadaan armada jangka panjang korporat dengan sourcing
                    vendor & kontrak resmi.
                  </p>
                </button>
              </div>
            </div>

            {/* Customer Dropdown + Inline Add Customer button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  {rentalType === "B2C"
                    ? "Pilih Pelanggan Individu:"
                    : "Pilih Klien Perusahaan (Corporate):"}
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />+ Tambah Customer Baru
                </button>
              </div>

              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                {rentalType === "B2C"
                  ? individualCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.phone} (NIK: {c.nik})
                      </option>
                    ))
                  : corporateCustomers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — PIC: {c.pic?.name || "PIC"} ({c.pic?.phone || "-"})
                      </option>
                    ))}
              </select>
            </div>

            {/* Selected Customer Card Preview & Dynamic Eligibility Gate */}
            {currentCustomer && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 text-sm">
                          {rentalType === "B2C"
                            ? (currentCustomer as IndividualCustomer).name
                            : (currentCustomer as CorporateCustomer).name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                          {currentCustomer.status}
                        </span>
                      </div>
                      <p className="text-neutral-500 mt-0.5">
                        {rentalType === "B2C"
                          ? `${(currentCustomer as IndividualCustomer).phone} · ${(currentCustomer as IndividualCustomer).email}`
                          : `PIC: ${(currentCustomer as CorporateCustomer).pic?.name || "PIC"} · ${(currentCustomer as CorporateCustomer).pic?.phone || "-"}`}
                      </p>
                    </div>

                    {eligibility && (
                      <EligibilityBadge eligibility={eligibility} size="md" />
                    )}
                  </div>

                  {rentalType === "B2C" &&
                    (currentCustomer as IndividualCustomer).drivingInfo && (
                      <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between text-[11px] text-neutral-600">
                        <span>
                          SIM:{" "}
                          <strong>
                            {
                              (currentCustomer as IndividualCustomer)
                                .drivingInfo.licenseNumber
                            }
                          </strong>
                        </span>
                        <span>
                          Masa Berlaku:{" "}
                          <strong className="font-mono">
                            {
                              (currentCustomer as IndividualCustomer)
                                .drivingInfo.licenseExpiry
                            }
                          </strong>
                        </span>
                        <span>
                          Status SIM:{" "}
                          <strong className="text-emerald-700">
                            {
                              (currentCustomer as IndividualCustomer)
                                .drivingInfo.verificationStatus
                            }
                          </strong>
                        </span>
                      </div>
                    )}
                </div>

                {/* ELIGIBILITY GATE PANEL */}
                {eligibility && (
                  <>
                    {eligibility.isEligible ? (
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950 flex items-start gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-xs font-bold text-emerald-900">
                            Customer Siap Melakukan Sewa (Eligible ✓)
                          </strong>
                          <p className="text-[11px] text-emerald-800 mt-0.5">
                            Semua dokumen KYC telah terverifikasi sah, SIM masih
                            berlaku, dan syarat ketentuan sewa (T&C) versi
                            terkini telah disetujui.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-950 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <ShieldX className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-xs font-bold text-rose-900">
                              Akses Reservasi Dibatasi (Rental Blocked / KYC
                              Incomplete)
                            </strong>
                            <p className="text-[11px] text-rose-800 mt-0.5">
                              Customer belum dapat melanjutkan proses reservasi
                              karena ditemukan ketidaksesuaian berikut:
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1.5 pl-7">
                          {eligibility.blockingChecks.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 text-xs text-rose-900"
                            >
                              <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span>{item.detail}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pl-7 pt-1 flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => setIsAgreementModalOpen(true)}
                            className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white gap-1"
                          >
                            <FileCheck2 className="h-3.5 w-3.5" />
                            Setujui Agreement T&C v1.3
                          </Button>
                          {currentCustomer.documents &&
                            currentCustomer.documents[0] && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedDocToReview(
                                    currentCustomer.documents[0],
                                  );
                                  setIsDocViewerOpen(true);
                                }}
                                className="text-xs font-semibold gap-1 bg-white border-rose-300 text-rose-900 hover:bg-rose-100"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-rose-700" />
                                Audit Dokumen KYC
                              </Button>
                            )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Requirements */}
      {currentStep === 2 && (
        <Card className="border-neutral-200/80 shadow-xs max-w-3xl mx-auto">
          <CardHeader className="p-4 sm:p-6 border-b border-neutral-100">
            <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Car className="h-4.5 w-4.5 text-primary" />
              {rentalType === "B2C"
                ? "Detail Pemesanan Kendaraan B2C"
                : "Spesifikasi Kebutuhan Armada B2B"}
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Lengkapi tanggal sewa, preferensi pengemudi, lokasi serah terima,
              dan detail operasional.
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
            {rentalType === "B2C" ? (
              <>
                {/* B2C Vehicle Selection */}
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Pilih Unit Kendaraan Ready (Jaja-Owned):
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => {
                      setSelectedVehicleId(e.target.value);
                      const veh = mockVehicles.find(
                        (v) => v.id === e.target.value,
                      );
                      if (veh) {
                        setB2cDailyRate(
                          veh.fuelType === "Diesel" ? 1050000 : 550000,
                        );
                      }
                    }}
                    className="w-full h-9 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    {mockVehicles
                      .filter((v) => v.ownership === "JAJA_OWNED")
                      .map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.plateNumber} — {v.brand} {v.model} ({v.year})
                          &middot; {formatNumber(v.odometer)} KM
                        </option>
                      ))}
                  </select>
                </div>

                {/* Dates & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Tanggal Mulai Sewa
                    </label>
                    <Input
                      type="date"
                      value={b2cStartDate}
                      onChange={(e) => setB2cStartDate(e.target.value)}
                      className="h-8.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Durasi Sewa (Hari)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={b2cDurationDays}
                      onChange={(e) =>
                        handleB2cDaysChange(Number(e.target.value))
                      }
                      className="h-8.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Tanggal Pengembalian
                    </label>
                    <Input
                      type="date"
                      value={b2cEndDate}
                      onChange={(e) => setB2cEndDate(e.target.value)}
                      className="h-8.5 text-xs bg-neutral-50"
                    />
                  </div>
                </div>

                {/* Locations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Lokasi Serah Terima / Pick-up
                    </label>
                    <Input
                      value={b2cPickupLoc}
                      onChange={(e) => setB2cPickupLoc(e.target.value)}
                      placeholder="Contoh: Pool Sudirman / Hotel Mulia Senayan"
                      className="h-8.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Lokasi Pengembalian / Drop-off
                    </label>
                    <Input
                      value={b2cDropoffLoc}
                      onChange={(e) => setB2cDropoffLoc(e.target.value)}
                      placeholder="Contoh: Pool Sudirman / Bandara Soetta"
                      className="h-8.5 text-xs"
                    />
                  </div>
                </div>

                {/* Driver Option */}
                <div className="p-3 rounded-lg border border-neutral-200 bg-neutral-50 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-900">
                    <input
                      type="checkbox"
                      checked={b2cWithDriver}
                      onChange={(e) => setB2cWithDriver(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span>Sewa Beserta Driver Jaja (+Rp 200.000 / hari)</span>
                  </label>
                  <span className="text-[11px] text-neutral-500 block pl-6">
                    {b2cWithDriver
                      ? "Driver profesional Jaja-Rent akan mengemudikan kendaraan selama masa sewa."
                      : "Self-drive (Lepas Kunci). Customer wajib menyertakan foto KTP & SIM A aktif."}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* B2B Requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Kategori / Tipe Unit yang Diminta{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={b2bVehicleType}
                      onChange={(e) => setB2bVehicleType(e.target.value)}
                      placeholder="Contoh: Toyota Avanza 1.5 G / Innova Zenix"
                      className="h-8.5 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Jumlah Unit Armada{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={b2bQuantity}
                      onChange={(e) => setB2bQuantity(Number(e.target.value))}
                      className="h-8.5 text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Tanggal Mulai Operasional
                    </label>
                    <Input
                      type="date"
                      value={b2bStartDate}
                      onChange={(e) => setB2bStartDate(e.target.value)}
                      className="h-8.5 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Durasi Kontrak (Bulan)
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={b2bDurationMonths}
                      onChange={(e) =>
                        setB2bDurationMonths(Number(e.target.value))
                      }
                      className="h-8.5 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Target Budget Customer / Unit
                    </label>
                    <Input
                      type="number"
                      step={100000}
                      value={b2bBudgetMonthly}
                      onChange={(e) =>
                        setB2bBudgetMonthly(Number(e.target.value))
                      }
                      className="h-8.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Area Lokasi Operasional
                  </label>
                  <Input
                    value={b2bCityLocation}
                    onChange={(e) => setB2bCityLocation(e.target.value)}
                    placeholder="Contoh: Jabodetabek, Bandung, atau Kawasan Industri Cikarang"
                    className="h-8.5 text-xs"
                  />
                </div>

                {/* B2B Inclusions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-white cursor-pointer hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={b2bWithMaintenance}
                      onChange={(e) => setB2bWithMaintenance(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span className="font-medium">Termasuk Maintenance</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-white cursor-pointer hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={b2bWithInsurance}
                      onChange={(e) => setB2bWithInsurance(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span className="font-medium">Termasuk Asuransi</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-200 bg-white cursor-pointer hover:bg-neutral-50">
                    <input
                      type="checkbox"
                      checked={b2bWithDriver}
                      onChange={(e) => setB2bWithDriver(e.target.checked)}
                      className="rounded text-primary"
                    />
                    <span className="font-medium">Termasuk Driver</span>
                  </label>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Catatan Kebutuhan Khusus
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan spesifikasi bodi, tahun NIK minimal, atau jadwal bertahap..."
                    rows={2}
                    className="text-xs"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {currentStep === 3 && (
        <Card className="border-neutral-200/80 shadow-xs max-w-3xl mx-auto">
          <CardHeader className="p-4 sm:p-6 border-b border-neutral-100">
            <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
              Review Data Reservasi Sebelum Disimpan
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Periksa kembali kelengkapan informasi pemesanan. Reservasi ini
              dapat disimpan sebagai Draft atau diterbitkan langsung.
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
            {/* Customer Summary */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                1. Pelanggan ({rentalType})
              </span>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nama Customer:</span>
                <strong className="text-neutral-900">
                  {rentalType === "B2C"
                    ? selectedIndividual?.name
                    : selectedCorporate?.name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Nomor Telepon:</span>
                <span className="font-mono text-neutral-800">
                  {rentalType === "B2C"
                    ? selectedIndividual?.phone
                    : selectedCorporate?.pic?.phone}
                </span>
              </div>
            </div>

            {/* Requirement Summary */}
            {rentalType === "B2C" ? (
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  2. Kebutuhan Unit & Periode Sewa
                </span>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Kendaraan:</span>
                  <strong className="text-neutral-900">
                    {selectedVehicle?.brand} {selectedVehicle?.model} (
                    {selectedVehicle?.plateNumber})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Periode Sewa:</span>
                  <span className="text-neutral-800">
                    {b2cStartDate} s/d {b2cEndDate} ({b2cDurationDays} Hari)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Layanan Driver:</span>
                  <span className="font-semibold text-neutral-800">
                    {b2cWithDriver
                      ? "Dengan Driver Jaja"
                      : "Self-Drive (Lepas Kunci)"}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-sm">
                  <span>Estimasi Total Biaya Sewa:</span>
                  <span className="text-emerald-700 font-mono">
                    {formatCurrency(calculateB2cTotal())}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  2. Kebutuhan Pengadaan Armada Korporat
                </span>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tipe Kendaraan:</span>
                  <strong className="text-neutral-900">{b2bVehicleType}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Jumlah Unit:</span>
                  <strong className="font-mono text-neutral-900">
                    {b2bQuantity} Unit
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Durasi Kontrak:</span>
                  <span className="text-neutral-800">
                    {b2bDurationMonths} Bulan (Mulai {b2bStartDate})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Area Operasional:</span>
                  <span className="text-neutral-800">{b2bCityLocation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Paket Termasuk:</span>
                  <span className="font-semibold text-neutral-800">
                    {b2bWithMaintenance ? "Maintenance ✓ " : ""}
                    {b2bWithInsurance ? "Asuransi ✓ " : ""}
                    {b2bWithDriver ? "Driver ✓" : ""}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between max-w-3xl mx-auto pt-4 border-t border-neutral-200">
        <Button
          type="button"
          variant="outline"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>

        {currentStep === 1 && (
          <Button
            type="button"
            disabled={!eligibility?.isEligible}
            onClick={() => setCurrentStep(2)}
            className={`text-xs font-bold gap-1.5 ${
              eligibility?.isEligible
                ? "bg-neutral-900 text-white hover:bg-neutral-800"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            Lanjut ke Kebutuhan Sewa
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {currentStep === 2 && (
          <Button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="text-xs font-bold gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Review & Ringkasan
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}

        {currentStep === 3 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleSubmit("DRAFT")}
              className="text-xs gap-1.5 border-neutral-300"
            >
              <Save className="h-3.5 w-3.5 text-neutral-600" />
              Simpan Draft
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit("CONFIRMED")}
              className="text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Menyimpan..." : "Submit Reservasi"}
            </Button>
          </div>
        )}
      </div>

      {/* Inline Customer Registration Modal */}
      <AddCustomerModal
        open={isAddCustomerModalOpen}
        onOpenChange={setIsAddCustomerModalOpen}
        defaultType={rentalType === "B2C" ? "INDIVIDUAL" : "CORPORATE"}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* KYC Document Viewer Modal */}
      {currentCustomer && (
        <KycDocumentViewer
          open={isDocViewerOpen}
          onOpenChange={setIsDocViewerOpen}
          customerId={currentCustomer.id}
          customerName={
            rentalType === "B2C"
              ? (currentCustomer as IndividualCustomer).name
              : (currentCustomer as CorporateCustomer).name
          }
          document={selectedDocToReview}
          onDocumentUpdated={async () => {
            await reloadCustomers();
          }}
        />
      )}

      {/* Agreement Acceptance Modal */}
      {currentCustomer && (
        <AgreementAcceptanceModal
          open={isAgreementModalOpen}
          onOpenChange={setIsAgreementModalOpen}
          customerId={currentCustomer.id}
          customerName={
            rentalType === "B2C"
              ? (currentCustomer as IndividualCustomer).name
              : (currentCustomer as CorporateCustomer).name
          }
          customerType={rentalType === "B2C" ? "INDIVIDUAL" : "CORPORATE"}
          onAgreementAccepted={async () => {
            await reloadCustomers();
          }}
        />
      )}
    </div>
  );
}
