"use client";

import * as React from "react";
import { InspectionGrade } from "@/lib/types/inspection";
import { cn } from "@/lib/utils";

interface GradeSelectorProps {
  value?: InspectionGrade;
  onChange: (grade: InspectionGrade) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const GRADES: {
  grade: InspectionGrade;
  label: string;
  desc: string;
  activeClass: string;
  hoverClass: string;
}[] = [
  {
    grade: "A",
    label: "A",
    desc: "Sangat Baik",
    activeClass: "bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold",
    hoverClass: "hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300",
  },
  {
    grade: "B",
    label: "B",
    desc: "Baik",
    activeClass: "bg-teal-600 text-white border-teal-600 shadow-sm font-bold",
    hoverClass: "hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300",
  },
  {
    grade: "C",
    label: "C",
    desc: "Cukup",
    activeClass: "bg-amber-500 text-white border-amber-500 shadow-sm font-bold",
    hoverClass: "hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300",
  },
  {
    grade: "D",
    label: "D",
    desc: "Kurang Baik",
    activeClass: "bg-orange-500 text-white border-orange-500 shadow-sm font-bold",
    hoverClass: "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300",
  },
  {
    grade: "E",
    label: "E",
    desc: "Buruk / Rusak",
    activeClass: "bg-rose-600 text-white border-rose-600 shadow-sm font-bold",
    hoverClass: "hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300",
  },
];

export function GradeSelector({
  value,
  onChange,
  disabled = false,
  size = "md",
}: GradeSelectorProps) {
  return (
    <div className="inline-flex items-center rounded-lg bg-neutral-100 p-1 border border-neutral-200/80 gap-1 select-none">
      {GRADES.map((item) => {
        const isSelected = value === item.grade;

        return (
          <button
            key={item.grade}
            type="button"
            disabled={disabled}
            onClick={() => onChange(item.grade)}
            title={`${item.grade} - ${item.desc}`}
            className={cn(
              "flex items-center justify-center rounded-md border text-center transition-all cursor-pointer font-semibold",
              size === "sm" && "h-7 min-w-[28px] px-2 text-xs",
              size === "md" && "h-8.5 min-w-[34px] px-2.5 text-xs sm:text-sm",
              size === "lg" && "h-10 min-w-[42px] px-3.5 text-sm sm:text-base",
              isSelected
                ? item.activeClass
                : cn(
                    "border-transparent bg-transparent text-neutral-600",
                    item.hoverClass
                  ),
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
