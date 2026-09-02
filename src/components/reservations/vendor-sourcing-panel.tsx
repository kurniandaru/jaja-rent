"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AddQuotationModal } from "./add-quotation-modal";
import { VendorQuotation, NegotiationTerms } from "@/lib/types/sourcing";
import { addVendorQuotation, updateQuotationStatus } from "@/lib/data/reservations";
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  Plus,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface VendorSourcingPanelProps {
  reservationId: string;
  vehicleType: string;
  requiredQuantity: number;
  quotations: VendorQuotation[];
  negotiationTerms?: NegotiationTerms;
  onRefresh: () => void;
}

export function VendorSourcingPanel({
  reservationId,
  vehicleType,
  requiredQuantity,
  quotations = [],
  negotiationTerms,
  onRefresh,
}: VendorSourcingPanelProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const handleAddQuotation = async (
    quoteData: Omit<VendorQuotation, "id" | "reservationId" | "submittedDate">
  ) => {
    await addVendorQuotation(reservationId, quoteData);
    onRefresh();
  };

  const handleUpdateStatus = async (
    quoteId: string,
    status: "ACCEPTED" | "REJECTED" | "NEGOTIATING"
  ) => {
    await updateQuotationStatus(reservationId, quoteId, status);
    onRefresh();
  };

  const acceptedQuotes = quotations.filter((q) => q.status === "ACCEPTED");
  const acceptedQuantity = acceptedQuotes.reduce((acc, q) => acc + q.quantity, 0);

  return (
    <div className="space-y-4">
      {/* Sourcing Header Card */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-neutral-900 text-white shadow-xs">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-neutral-900">
                  Vendor Sourcing & Quotations ({quotations.length})
                </CardTitle>
                <span
                  className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                    acceptedQuantity >= requiredQuantity
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  Terpenuhi: {acceptedQuantity}/{requiredQuantity} Unit
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Bandingkan biaya vendor, harga sewa customer, dan estimasi margin kotor sebelum kontrak B2B diterbitkan.
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            + Tambah Penawaran Vendor
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          {quotations.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-xs border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-neutral-300" />
              <p className="font-semibold text-neutral-700">Belum ada penawaran vendor yang dicatat</p>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Klik tombol &quot;+ Tambah Penawaran Vendor&quot; di atas untuk memasukkan penawaran harga dari mitra vendor.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quotations.map((quote) => {
                const isAccepted = quote.status === "ACCEPTED";
                const isRejected = quote.status === "REJECTED";
                const marginPct =
                  quote.customerPricePerMonth > 0
                    ? Math.round((quote.grossMarginPerUnit / quote.customerPricePerMonth) * 100)
                    : 0;

                return (
                  <div
                    key={quote.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isAccepted
                        ? "bg-emerald-50/40 border-emerald-300 shadow-xs"
                        : isRejected
                        ? "bg-neutral-50/60 border-neutral-200 opacity-60"
                        : "bg-white border-neutral-200/90 shadow-2xs hover:border-neutral-300"
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-100">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 font-semibold block">
                          {quote.id}
                        </span>
                        <h4 className="font-bold text-sm text-neutral-900 mt-0.5">
                          {quote.vendorName}
                        </h4>
                        <span className="text-xs text-neutral-600 font-medium">
                          {quote.vehicleModel} &middot; <strong>{quote.quantity} Unit</strong> ({quote.rentalPeriodMonths} Bulan)
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isAccepted
                            ? "bg-emerald-600 text-white"
                            : isRejected
                            ? "bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>

                    {/* Financial Comparison Box */}
                    <div className="py-3 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                        <span className="text-[10px] text-neutral-400 block">Vendor Cost</span>
                        <strong className="font-mono text-neutral-800 text-[11px] block mt-0.5">
                          {formatCurrency(quote.vendorCostPerMonth)}
                        </strong>
                      </div>

                      <div className="p-2 rounded-lg bg-neutral-50 border border-neutral-100">
                        <span className="text-[10px] text-neutral-400 block">Customer Price</span>
                        <strong className="font-mono text-neutral-900 text-[11px] block mt-0.5">
                          {formatCurrency(quote.customerPricePerMonth)}
                        </strong>
                      </div>

                      <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-800">
                        <span className="text-[10px] font-semibold block text-emerald-600">Gross Margin</span>
                        <strong className="font-mono font-bold text-[11px] block mt-0.5">
                          +{formatCurrency(quote.grossMarginPerUnit)} ({marginPct}%)
                        </strong>
                      </div>
                    </div>

                    {/* Features & SLA */}
                    <div className="text-[11px] text-neutral-600 space-y-1 pb-3">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {quote.maintenanceIncluded ? "Termasuk Servis" : "Tanpa Servis"} &middot;{" "}
                          {quote.insuranceIncluded ? "All-Risk Insurance" : "Tanpa Asuransi"} &middot;{" "}
                          {quote.replacementUnitGuaranteed ? "Garansi Pengganti" : "Tanpa Pengganti"}
                        </span>
                      </div>
                      <p className="text-neutral-500 italic text-[10px] pl-5">
                        &quot;{quote.slaDescription}&quot;
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between">
                      <span className="text-[10px] text-neutral-400">
                        Diajukan: {quote.submittedDate}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {!isAccepted && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(quote.id, "ACCEPTED")}
                            className="h-7 text-[11px] font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Terima Penawaran
                          </Button>
                        )}

                        {!isRejected && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(quote.id, "REJECTED")}
                            className="h-7 text-[11px] text-rose-600 border-neutral-200 hover:bg-rose-50"
                          >
                            Tolak
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Negotiation Summary if available */}
          {negotiationTerms && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-950 space-y-2">
              <div className="flex items-center justify-between font-bold text-sm text-blue-900">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Kesepakatan Negosiasi Akhir (Basis Kontrak B2B)
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {negotiationTerms.durationMonths} Bulan
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-blue-700">Harga Sepakat ke Customer:</span>
                  <strong className="block font-mono text-sm">{formatCurrency(negotiationTerms.proposedCustomerPrice)} / bln</strong>
                </div>
                <div>
                  <span className="text-[11px] text-blue-700">Biaya Vendor Rata-rata:</span>
                  <strong className="block font-mono text-sm">{formatCurrency(negotiationTerms.agreedVendorCost)} / bln</strong>
                </div>
                <div>
                  <span className="text-[11px] text-blue-700">Estimasi Margin Profit Jaja:</span>
                  <strong className="block font-mono text-sm text-emerald-700">+{formatCurrency(negotiationTerms.expectedMargin)} / bln</strong>
                </div>
              </div>
              {negotiationTerms.notes && (
                <p className="text-[11px] text-blue-800 pt-1 border-t border-blue-200/60">
                  <strong>Catatan:</strong> {negotiationTerms.notes}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AddQuotationModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        reservationId={reservationId}
        defaultVehicleType={vehicleType}
        defaultQuantity={requiredQuantity}
        onQuotationAdded={handleAddQuotation}
      />
    </div>
  );
}
