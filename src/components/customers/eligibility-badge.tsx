"use client";

import * as React from "react";
import { RentalEligibilityResult } from "@/lib/types/customer";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EligibilityBadgeProps {
  eligibility: RentalEligibilityResult;
  showModalOnClick?: boolean;
  size?: "sm" | "md" | "lg";
}

export function EligibilityBadge({
  eligibility,
  showModalOnClick = true,
  size = "md",
}: EligibilityBadgeProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const isEligible = eligibility.isEligible;
  const isBlocked = eligibility.status === "BLOCKED";
  const isIncomplete = eligibility.status === "DOCUMENT_INCOMPLETE";

  const badgeStyle = isEligible
    ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80"
    : isBlocked
    ? "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100/80"
    : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/80";

  const Icon = isEligible ? ShieldCheck : isBlocked ? ShieldX : ShieldAlert;

  const sizeStyle =
    size === "sm"
      ? "text-[10px] px-2 py-0.5 gap-1"
      : size === "lg"
      ? "text-xs px-3 py-1.5 gap-2"
      : "text-[11px] px-2.5 py-1 gap-1.5";

  return (
    <>
      <button
        type="button"
        onClick={() => showModalOnClick && setIsOpen(true)}
        className={`inline-flex items-center font-bold rounded-full border transition-all cursor-pointer select-none ${badgeStyle} ${sizeStyle}`}
      >
        <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        <span>
          {isEligible
            ? "RENTAL ELIGIBLE"
            : isIncomplete
            ? "KYC INCOMPLETE"
            : "RENTAL BLOCKED"}
        </span>
      </button>

      {/* Detail Diagnostic Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md sm:max-w-lg bg-white border border-neutral-200">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Icon
                className={`h-5 w-5 ${
                  isEligible
                    ? "text-emerald-600"
                    : isBlocked
                    ? "text-rose-600"
                    : "text-amber-600"
                }`}
              />
              {eligibility.summaryTitle}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              {eligibility.summaryMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto pr-1">
            {/* Blocking / Incomplete checks if any */}
            {eligibility.blockingChecks.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  Kendala Yang Menghalangi ({eligibility.blockingChecks.length}):
                </span>
                <div className="space-y-1.5">
                  {eligibility.blockingChecks.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-rose-900 flex items-start gap-2"
                    >
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">{item.label}</strong>
                        <p className="text-[11px] text-rose-700 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passed checks */}
            {eligibility.passedChecks.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Kriteria Yang Memenuhi Syarat ({eligibility.passedChecks.length}):
                </span>
                <div className="space-y-1.5">
                  {eligibility.passedChecks.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-emerald-950 flex items-start gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">{item.label}</strong>
                        <p className="text-[11px] text-emerald-700 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Dicek pada: {new Date(eligibility.checkedAt).toLocaleString("id-ID")}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="text-xs"
            >
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
