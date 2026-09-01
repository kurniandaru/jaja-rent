import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Deterministic Indonesian Rupiah formatting to prevent SSR/Client hydration mismatches.
 * e.g., 1850000 -> "Rp 1.850.000"
 */
export function formatRupiah(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) return "Rp 0";
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp ${formatted}`;
}

/**
 * Deterministic number formatting with Indonesian thousand separator (dot)
 * e.g., 45210 -> "45.210"
 */
export function formatNumber(value: number): string {
  if (typeof value !== "number" || isNaN(value)) return "0";
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const MONTH_NAMES_ID = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * Deterministic date formatter: YYYY-MM-DD -> "01 Sep 2026"
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const parts = dateString.split("-");
  if (parts.length < 3) return dateString;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = MONTH_NAMES_ID[monthIdx] || parts[1];
  return `${day < 10 ? "0" + day : day} ${monthName} ${year}`;
}

/**
 * Deterministic short date formatter: YYYY-MM-DD -> "01 Sep"
 */
export function formatShortDate(dateString: string): string {
  if (!dateString) return "-";
  const parts = dateString.split("-");
  if (parts.length < 2) return dateString;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2] ? parseInt(parts[2], 10) : 1;
  const monthName = MONTH_NAMES_ID[monthIdx] || parts[1];
  return `${day < 10 ? "0" + day : day} ${monthName}`;
}
