import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "AVAILABLE"
  | "RENTED"
  | "RESERVED"
  | "MAINTENANCE"
  | "INSPECTION"
  | "DOCUMENT_HOLD"
  | "INACTIVE"
  | "ACTIVE"
  | "COMPLETED"
  | "SCHEDULED"
  | "PASSED"
  | "FAILED"
  | "EXPIRING_SOON"
  | "EXPIRED"
  | "ONLINE"
  | "OFFLINE"
  | "IDLE"
  | "RETURNING"
  | "SHORTAGE";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType | string;
  showDot?: boolean;
  pulse?: boolean;
}

export function StatusBadge({
  status,
  showDot = true,
  pulse = false,
  className,
  ...props
}: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, "_");

  let styleClasses = "bg-neutral-100 text-neutral-700 border-neutral-200";
  let dotColor = "bg-neutral-400";
  const displayLabel = status.replace(/_/g, " ");

  switch (normalized) {
    case "AVAILABLE":
    case "PASSED":
    case "ONLINE":
      styleClasses = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      dotColor = "bg-emerald-500";
      break;

    case "ACTIVE":
    case "RENTED":
    case "IN_PROGRESS":
      styleClasses = "bg-blue-50 text-blue-700 border-blue-200/80";
      dotColor = "bg-blue-500";
      break;

    case "RESERVED":
    case "EXPIRING_SOON":
    case "WARNING":
    case "UPCOMING":
    case "RETURNING":
      styleClasses = "bg-amber-50 text-amber-800 border-amber-200/80";
      dotColor = "bg-amber-500";
      break;

    case "MAINTENANCE":
    case "FAILED":
    case "EXPIRED":
    case "SHORTAGE":
    case "CRITICAL":
    case "OFFLINE":
      styleClasses = "bg-rose-50 text-rose-700 border-rose-200/80";
      dotColor = "bg-rose-500";
      break;

    case "INSPECTION":
      styleClasses = "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      dotColor = "bg-indigo-500";
      break;

    case "DOCUMENT_HOLD":
    case "INACTIVE":
    case "COMPLETED":
    case "IDLE":
    default:
      styleClasses = "bg-neutral-100 text-neutral-600 border-neutral-200";
      dotColor = "bg-neutral-400";
      break;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border uppercase tracking-wider",
        styleClasses,
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            dotColor,
            pulse && "animate-ping"
          )}
        />
      )}
      {displayLabel}
    </span>
  );
}
