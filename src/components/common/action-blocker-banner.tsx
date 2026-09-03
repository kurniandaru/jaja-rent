"use client";

import * as React from "react";
import { ActionBlockerReason } from "@/lib/types/business-core";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface ActionBlockerBannerProps {
  blocker: ActionBlockerReason;
  actionTitle?: string;
  className?: string;
}

export function ActionBlockerBanner({
  blocker,
  actionTitle,
  className = "",
}: ActionBlockerBannerProps) {
  if (blocker.canPerform) {
    return (
      <div
        className={`p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs ${className}`}
      >
        <div className="flex items-center gap-2 font-bold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Seluruh Prasyarat Bisnis Terpenuhi (Ready)</span>
        </div>
        <p className="mt-1 text-[11px] text-emerald-700">
          Aksi {actionTitle || blocker.actionName} siap dijalankan tanpa kendala
          regulasi atau validasi.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl bg-amber-50/80 border border-amber-300 text-neutral-900 text-xs shadow-xs ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1 w-full">
          <div className="flex items-center justify-between">
            <strong className="font-bold text-amber-900 text-xs">
              Tidak Dapat Menjalankan: {actionTitle || blocker.actionName}
            </strong>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono">
              REQUIREMENTS BLOCKED
            </span>
          </div>
          <p className="text-[11px] text-amber-800">
            {blocker.errorMessage ||
              "Beberapa prasyarat validasi sistem belum terpenuhi:"}
          </p>

          {/* Detailed Check Requirements */}
          <div className="mt-2.5 pt-2 border-t border-amber-200/80 space-y-1.5">
            {(blocker.requiredChecks || []).map((req, idx) => (
              <div
                key={idx}
                className={`flex items-start justify-between gap-2 p-1.5 rounded-md text-[11px] font-medium ${
                  req.passed
                    ? "bg-emerald-100/50 text-emerald-900"
                    : "bg-rose-100/60 text-rose-950 font-bold"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {req.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  )}
                  <span>{req.label}</span>
                </div>
                {req.detail && (
                  <span
                    className={`text-[10px] font-mono shrink-0 ${
                      req.passed
                        ? "text-emerald-700"
                        : "text-rose-700 underline"
                    }`}
                  >
                    {req.detail}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
