"use client";

import * as React from "react";
import { RentalStatus } from "@/lib/types/rental";
import {
  CalendarCheck,
  PackageCheck,
  Truck,
  FileCheck2,
  Car,
  RotateCcw,
  CheckCircle2,
  Check,
} from "lucide-react";

interface RentalStatusStepperProps {
  currentStatus: RentalStatus;
}

const STAGES: {
  status: RentalStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}[] = [
  { status: "RESERVED", label: "1. Reserved", shortLabel: "Reserved", icon: CalendarCheck },
  { status: "READY_FOR_DELIVERY", label: "2. Ready Delivery", shortLabel: "Ready", icon: PackageCheck },
  { status: "DELIVERY", label: "3. Delivery", shortLabel: "Delivery", icon: Truck },
  { status: "HANDOVER", label: "4. Handover BAST", shortLabel: "Handover", icon: FileCheck2 },
  { status: "ACTIVE", label: "5. Active Rental", shortLabel: "Active", icon: Car },
  { status: "RETURN", label: "6. Return Process", shortLabel: "Return", icon: RotateCcw },
  { status: "COMPLETED", label: "7. Completed", shortLabel: "Done", icon: CheckCircle2 },
];

export function RentalStatusStepper({ currentStatus }: RentalStatusStepperProps) {
  const currentIndex = STAGES.findIndex((s) => s.status === currentStatus);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="w-full bg-white border border-neutral-200/80 rounded-xl p-3 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between overflow-x-auto gap-1">
        {STAGES.map((stage, idx) => {
          const isPassed = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const Icon = stage.icon;

          return (
            <React.Fragment key={stage.status}>
              {idx > 0 && (
                <div
                  className={`h-0.5 w-4 sm:w-8 shrink-0 rounded transition-colors ${
                    isPassed ? "bg-emerald-500" : "bg-neutral-200"
                  }`}
                />
              )}

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 select-none border transition-all ${
                  isCurrent
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                    : isPassed
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-neutral-50 text-neutral-400 border-neutral-200/70"
                }`}
              >
                <div
                  className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isCurrent
                      ? "bg-white text-neutral-900"
                      : isPassed
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {isPassed ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : idx + 1}
                </div>

                <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                <span className="hidden sm:inline">{stage.label}</span>
                <span className="sm:hidden">{stage.shortLabel}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
