import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

export type PriorityType = "CRITICAL" | "WARNING" | "INFORMATIONAL";

interface PriorityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  priority: PriorityType | string;
  showIcon?: boolean;
}

export function PriorityBadge({
  priority,
  showIcon = true,
  className,
  ...props
}: PriorityBadgeProps) {
  const norm = priority.toUpperCase();

  if (norm === "CRITICAL") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 tracking-wider uppercase",
          className,
        )}
        {...props}
      >
        {showIcon && <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />}
        CRITICAL
      </span>
    );
  }

  if (norm === "WARNING") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-200 tracking-wider uppercase",
          className,
        )}
        {...props}
      >
        {showIcon && (
          <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
        )}
        WARNING
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 tracking-wider uppercase",
        className,
      )}
      {...props}
    >
      {showIcon && <Info className="w-3 h-3 text-blue-600 shrink-0" />}
      INFO
    </span>
  );
}

export function OwnershipBadge({
  ownership,
  className,
}: {
  ownership: "JAJA_OWNED" | "VENDOR_OWNED" | string;
  className?: string;
}) {
  const isJaja = ownership === "JAJA_OWNED" || ownership === "JAJA";
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border",
        isJaja
          ? "bg-neutral-900 text-neutral-50 border-neutral-800"
          : "bg-purple-50 text-purple-700 border-purple-200",
        className,
      )}
    >
      {isJaja ? "JAJA OWNED" : "VENDOR OWNED"}
    </span>
  );
}
