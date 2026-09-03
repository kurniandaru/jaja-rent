// ==============================================================================
// Security & Sensitive Data Protection Service (Phase 3)
// Masking, File Upload Hardening, and Rate Protection
// ==============================================================================

import type { AuthenticatedUserContext } from "../types/rbac.ts";
import { can } from "./authorization-service.ts";

/**
 * Mask National Identity Number (NIK)
 * 3275012345670001 -> 3275********0001
 */
export function maskIdentityNumber(nik?: string | null): string {
  if (!nik) return "-";
  const clean = nik.trim();
  if (clean.length < 8) return "********";
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  const mask = "*".repeat(Math.max(4, clean.length - 8));
  return `${start}${mask}${end}`;
}

/**
 * Mask Phone Number
 * 081234567890 -> 0812****7890
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "-";
  const clean = phone.trim();
  if (clean.length < 7) return "08******";
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  return `${start}****${end}`;
}

/**
 * Mask Financial / Credit Card / Bank Account
 * 1234567890123456 -> ************3456
 */
export function maskFinancialNumber(num?: string | null): string {
  if (!num) return "-";
  const clean = num.trim();
  if (clean.length < 4) return "****";
  const end = clean.slice(-4);
  return `${"*".repeat(Math.max(4, clean.length - 4))}${end}`;
}

/**
 * Automatically mask sensitive fields of an object based on user permissions
 */
export function maskSensitiveObject<T extends Record<string, any>>(
  data: T,
  user?: AuthenticatedUserContext | null,
): T {
  const canViewSensitiveCust = can(user, "customer.view_sensitive");
  const canViewSensitivePay = can(user, "payment.view_sensitive");
  const canViewSensitiveAudit = can(user, "audit.view_sensitive");

  const cloned = JSON.parse(JSON.stringify(data));

  // Customer PII
  if (!canViewSensitiveCust) {
    if ("identityNumber" in cloned && cloned.identityNumber) {
      cloned.identityNumber = maskIdentityNumber(cloned.identityNumber);
    }
    if ("identity_number" in cloned && cloned.identity_number) {
      cloned.identity_number = maskIdentityNumber(cloned.identity_number);
    }
    if ("nik" in cloned && cloned.nik) {
      cloned.nik = maskIdentityNumber(cloned.nik);
    }
    if ("drivingLicenseNumber" in cloned && cloned.drivingLicenseNumber) {
      cloned.drivingLicenseNumber = maskIdentityNumber(
        cloned.drivingLicenseNumber,
      );
    }
    if ("phone" in cloned && cloned.phone) {
      cloned.phone = maskPhoneNumber(cloned.phone);
    }
  }

  // Payment PII
  if (!canViewSensitivePay) {
    if ("accountNumber" in cloned && cloned.accountNumber) {
      cloned.accountNumber = maskFinancialNumber(cloned.accountNumber);
    }
    if ("paymentReference" in cloned && cloned.paymentReference) {
      cloned.paymentReference = maskFinancialNumber(cloned.paymentReference);
    }
  }

  // Audit / Internal Technical PII
  if (!canViewSensitiveAudit) {
    if ("ipAddress" in cloned && cloned.ipAddress) {
      cloned.ipAddress = "192.168.***.***";
    }
    if ("ip_address" in cloned && cloned.ip_address) {
      cloned.ip_address = "192.168.***.***";
    }
  }

  return cloned;
}

/**
 * File Upload Security Validation (Section 38)
 */
export const ALLOWED_DOCUMENT_MIMES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateFileUpload(file: {
  name: string;
  sizeBytes: number;
  mimeType: string;
}): { isValid: boolean; error?: string; safeFilename?: string } {
  // 1. MIME check
  if (!ALLOWED_DOCUMENT_MIMES.includes(file.mimeType.toLowerCase())) {
    return {
      isValid: false,
      error: `Format berkas '${file.mimeType}' tidak diizinkan. Hanya PDF, JPEG, PNG, dan WEBP yang diperbolehkan.`,
    };
  }

  // 2. Size limit
  if (file.sizeBytes > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (file.sizeBytes / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `Ukuran berkas (${sizeMb} MB) melebihi batas maksimum 5 MB.`,
    };
  }

  // 3. Safe Filename Sanitization (prevent directory traversal / command injection)
  const safeFilename = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".");

  return {
    isValid: true,
    safeFilename,
  };
}

/**
 * Simple In-Memory Rate Limiter (Section 39)
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60000,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}
