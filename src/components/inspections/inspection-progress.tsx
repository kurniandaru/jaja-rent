"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepDef {
  id: number;
  title: string;
  shortTitle: string;
  icon: React.ElementType;
  isCompleted: boolean;
  hasIssues?: boolean;
  uninspectedCount?: number;
}

interface InspectionProgressProps {
  currentStep: number;
  onStepClick: (stepId: number) => void;
  steps: StepDef[];
  completionPercentage: number;
}

export function InspectionProgress({
  currentStep,
  onStepClick,
  steps,
  completionPercentage,
}: InspectionProgressProps) {
  return (
    <div className="w-full bg-white border-b border-neutral-200/80 sticky top-14 z-20 shadow-2xs">
      {/* Mobile progress bar header */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-100 sm:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-900">
            Step {currentStep} dari {steps.length}:
          </span>
          <span className="text-xs font-medium text-neutral-600">
            {steps.find((s) => s.id === currentStep)?.title}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-primary">
          {completionPercentage}%
        </span>
      </div>

      {/* Full Step Bar (Horizontal scrollable on tablet / desktop) */}
      <div className="px-3 sm:px-6 py-2.5 overflow-x-auto">
        <div className="flex items-center min-w-max gap-1 sm:gap-2">
          {steps.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = step.isCompleted;
            const isPast = step.id < currentStep;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div
                    className={cn(
                      "h-0.5 w-3 sm:w-6 rounded transition-colors shrink-0",
                      isPast || isCompleted ? "bg-emerald-500" : "bg-neutral-200"
                    )}
                  />
                )}

                <button
                  type="button"
                  onClick={() => onStepClick(step.id)}
                  className={cn(
                    "group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer border",
                    isActive
                      ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                      : isCompleted
                      ? "bg-emerald-50/80 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70"
                      : "bg-neutral-50 text-neutral-600 border-neutral-200/80 hover:bg-neutral-100 hover:text-neutral-900"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 transition-colors",
                      isActive
                        ? "bg-white text-neutral-900"
                        : isCompleted
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-200 text-neutral-700"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-3 w-3 stroke-[3]" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
                    <span className="hidden md:inline">{step.title}</span>
                    <span className="md:hidden">{step.shortTitle}</span>
                  </div>

                  {step.hasIssues && (
                    <span
                      title="Ditemukan masalah pada step ini"
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isActive ? "bg-amber-400" : "bg-amber-500"
                      )}
                    />
                  )}

                  {!isCompleted &&
                    step.uninspectedCount !== undefined &&
                    step.uninspectedCount > 0 && (
                      <span
                        className={cn(
                          "text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold",
                          isActive
                            ? "bg-neutral-800 text-neutral-300"
                            : "bg-neutral-200 text-neutral-600"
                        )}
                      >
                        {step.uninspectedCount}
                      </span>
                    )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Subtle Progress Bar underneath */}
      <div className="w-full bg-neutral-100 h-1">
        <div
          className="bg-emerald-500 h-1 transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
}
