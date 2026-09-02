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
import { CustomerDocument, DocumentVerificationStatus } from "@/lib/types/customer";
import { verifyCustomerDocument } from "@/lib/data/customers";
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  User,
} from "lucide-react";

interface KycDocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  document: CustomerDocument | null;
  onDocumentUpdated: () => void;
}

export function KycDocumentViewer({
  open,
  onOpenChange,
  customerId,
  customerName,
  document,
  onDocumentUpdated,
}: KycDocumentViewerProps) {
  const [verifierName, setVerifierName] = React.useState("Rudi Hartono (QC Lead)");
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!document) return null;

  const handleAction = async (status: DocumentVerificationStatus) => {
    setIsSubmitting(true);
    await verifyCustomerDocument(
      customerId,
      document.id,
      status,
      verifierName,
      rejectionReason || undefined
    );
    setIsSubmitting(false);
    onOpenChange(false);
    onDocumentUpdated();
  };

  const isVerified = document.verificationStatus === "VERIFIED";
  const isRejected = document.verificationStatus === "REJECTED";
  const isNeedRevision = document.verificationStatus === "NEED_REVISION";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl bg-white border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Audit Dokumen KYC: {document.documentName}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Periksa keabsahan berkas legalitas customer <strong>{customerName}</strong> ({customerId}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Metadata Box */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Jenis Dokumen</span>
              <strong className="text-neutral-900 font-semibold">{document.documentName}</strong>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Nomor Dokumen</span>
              <strong className="font-mono text-neutral-900">{document.documentNumber || "-"}</strong>
            </div>
            {document.expiryDate && (
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Masa Berlaku</span>
                <span className="font-mono text-neutral-800">{document.expiryDate}</span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase block">Status Verifikasi</span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${
                  isVerified
                    ? "bg-emerald-100 text-emerald-800"
                    : isRejected
                    ? "bg-rose-100 text-rose-800"
                    : isNeedRevision
                    ? "bg-amber-100 text-amber-800"
                    : "bg-neutral-200 text-neutral-700"
                }`}
              >
                {document.verificationStatus}
              </span>
            </div>
          </div>

          {/* Document Preview Box */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-100/70 text-center space-y-2">
            <div className="py-8 space-y-2 text-neutral-400">
              <FileText className="h-10 w-10 mx-auto text-neutral-300" />
              <p className="font-semibold text-neutral-700">Berkas Terlampir: {document.fileName || "Dokumen_KYC.pdf"}</p>
              <p className="text-[11px] text-neutral-400">File dokumen digital terenkripsi di server aman Jaja Rent.</p>
            </div>
          </div>

          {/* Verification Audit Fields */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Petugas Verifikator / Inspector QC
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                <Input
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="pl-8.5 h-8.5 text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">
                Catatan Verifikasi / Alasan Penolakan (Jika Ada)
              </label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Tuliskan catatan evaluasi atau alasan revisi/penolakan berkas..."
                rows={2}
                className="text-xs"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Batal
            </Button>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleAction("NEED_REVISION")}
                className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Minta Revisi
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleAction("REJECTED")}
                className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white gap-1"
              >
                <XCircle className="h-3.5 w-3.5" />
                Tolak Dokumen
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={isSubmitting}
                onClick={() => handleAction("VERIFIED")}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verifikasi Valid (Approve)
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
