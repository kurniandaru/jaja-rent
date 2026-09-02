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
import { mockAgreementVersions } from "@/lib/mock-data/agreements";
import { recordAgreementAcceptance } from "@/lib/data/customers";
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  User,
  Check,
  AlertCircle,
} from "lucide-react";

interface AgreementAcceptanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  customerType: "INDIVIDUAL" | "CORPORATE";
  onAgreementAccepted: () => void;
}

export function AgreementAcceptanceModal({
  open,
  onOpenChange,
  customerId,
  customerName,
  customerType,
  onAgreementAccepted,
}: AgreementAcceptanceModalProps) {
  const isIndividual = customerType === "INDIVIDUAL";
  const targetType = isIndividual ? "B2C_RENTAL_TERMS" : "B2B_MASTER_SERVICE_AGREEMENT";

  const agreement =
    mockAgreementVersions.find((a) => a.agreementType === targetType && a.isActive) ||
    mockAgreementVersions[0];

  const [acceptedClauseIds, setAcceptedClauseIds] = React.useState<string[]>([]);
  const [signerName, setSignerName] = React.useState(customerName);
  const [signerRole, setSignerRole] = React.useState(
    isIndividual ? "Penyewa Perorangan" : "Head of General Affairs & Procurement (Authorized PIC)"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (customerName) setSignerName(customerName);
    setAcceptedClauseIds([]);
  }, [customerName, open]);

  const toggleClause = (id: string) => {
    setAcceptedClauseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (acceptedClauseIds.length === agreement.clauses.length) {
      setAcceptedClauseIds([]);
    } else {
      setAcceptedClauseIds(agreement.clauses.map((c: any) => c.id));
    }
  };

  const allRequiredChecked = agreement.clauses
    .filter((c: any) => c.isRequired)
    .every((c: any) => acceptedClauseIds.includes(c.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequiredChecked) return;

    setIsSubmitting(true);
    await recordAgreementAcceptance(customerId, {
      customerId,
      agreementId: agreement.id,
      agreementType: agreement.agreementType,
      agreementVersion: agreement.version,
      acceptedBy: signerName,
      acceptedByRole: signerRole,
      ipAddress: "182.253.44.12",
      userAgent: "Jaja Rent Platform Web Client",
      status: "ACCEPTED",
      acceptedClauses: acceptedClauseIds,
      digitalConsentNote: `Disetujui secara sadar oleh ${signerName} (${signerRole}) mematuhi seluruh klausul v${agreement.version}.`,
    });

    setIsSubmitting(false);
    onOpenChange(false);
    onAgreementAccepted();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-2xl bg-white border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Persetujuan Syarat & Ketentuan Sewa (Agreement Acceptance)
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Penyewa wajib menyetujui versi klausul hukum terkini sebelum diizinkan membuat reservasi atau rental aktif.
          </DialogDescription>
        </DialogHeader>

        {/* Agreement Hero Banner */}
        <div className="p-3.5 rounded-xl bg-neutral-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded">
                Versi {agreement.version}
              </span>
              <span className="text-[10px] text-neutral-300">
                Efektif: {agreement.effectiveDate}
              </span>
            </div>
            <h4 className="font-bold text-sm text-white mt-1">{agreement.title}</h4>
            <p className="text-[11px] text-neutral-300 mt-0.5">{agreement.summary}</p>
          </div>
          <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0 hidden sm:block" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Action Header */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-neutral-800 text-xs">
              Klausul Perjanjian Wajib ({acceptedClauseIds.length}/{agreement.clauses.length} Disetujui):
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              {acceptedClauseIds.length === agreement.clauses.length
                ? "Batal Pilih Semua"
                : "Centang Semua Klausul"}
            </button>
          </div>

          {/* Clause Checkbox Cards */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {agreement.clauses.map((clause: any) => {
              const isChecked = acceptedClauseIds.includes(clause.id);
              return (
                <div
                  key={clause.id}
                  onClick={() => toggleClause(clause.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                    isChecked
                      ? "bg-emerald-50/40 border-emerald-300 shadow-2xs"
                      : "bg-white border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div
                    className={`h-4.5 w-4.5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                      isChecked
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-neutral-300 bg-white"
                    }`}
                  >
                    {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>

                  <div className="space-y-0.5">
                    <strong className="text-neutral-900 block font-semibold text-xs">
                      {clause.title}
                    </strong>
                    <p className="text-neutral-600 text-[11px] leading-relaxed">
                      {clause.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Signer Identity Box */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
            <span className="font-bold text-neutral-900 text-xs block">
              Identitas Pihak Yang Menyetujui (Audit Log)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Nama Penandatangan / PIC <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="pl-8.5 h-8 text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-600 block mb-1">
                  Jabatan / Wewenang
                </label>
                <Input
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
              </div>
            </div>
            <p className="text-[10px] text-neutral-400">
              Sistem akan merekam timestamp dan IP Address sebagai bukti legalitas persetujuan elektronik.
            </p>
          </div>

          {!allRequiredChecked && (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-amber-800 text-[11px]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Harap centang dan setujui seluruh klausul wajib sebelum melanjutkan.</span>
            </div>
          )}

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
              disabled={!allRequiredChecked || isSubmitting}
              className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : `Setujui & Rekam Agreement v${agreement.version}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
