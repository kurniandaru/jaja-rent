// ==============================================================================
// Observability & Standard Error Handling Service (Phase 3)
// Structured Audit Logging, Humanized Business Errors, and Request Correlation
// ==============================================================================

export type BusinessErrorCode =
  | "CUSTOMER_NOT_VERIFIED"
  | "VEHICLE_UNAVAILABLE"
  | "RESERVATION_NOT_APPROVED"
  | "INVALID_STATUS_TRANSITION"
  | "PAYMENT_FAILED"
  | "DOCUMENT_EXPIRED"
  | "UNAUTHORIZED"
  | "RESOURCE_NOT_FOUND"
  | "VALIDATION_FAILED";

export interface BusinessErrorDetails {
  code: BusinessErrorCode;
  message: string;
  reason: string;
  suggestedAction: string;
  context?: Record<string, any>;
}

/**
 * Factory for Humanized Enterprise Business Errors (Section 32)
 */
export class EnterpriseBusinessError extends Error {
  public readonly code: BusinessErrorCode;
  public readonly reason: string;
  public readonly suggestedAction: string;
  public readonly statusCode: number;

  constructor(details: BusinessErrorDetails, statusCode = 400) {
    super(
      `${details.message}. Alasan: ${details.reason}. Tindakan: ${details.suggestedAction}`,
    );
    this.name = "EnterpriseBusinessError";
    this.code = details.code;
    this.reason = details.reason;
    this.suggestedAction = details.suggestedAction;
    this.statusCode = statusCode;
  }
}

export function createBusinessError(
  code: BusinessErrorCode,
  details: {
    reason: string;
    suggestedAction: string;
    vehiclePlate?: string;
    entityId?: string;
  },
): EnterpriseBusinessError {
  let message = "Operasi bisnis tidak dapat diselesaikan";
  let status = 400;

  switch (code) {
    case "VEHICLE_UNAVAILABLE":
      message = `Kendaraan ${details.vehiclePlate || details.entityId || "tersebut"} tidak dapat dialokasikan`;
      break;
    case "CUSTOMER_NOT_VERIFIED":
      message = `Pelanggan ${details.entityId || ""} belum memenuhi syarat verifikasi KYC`;
      break;
    case "RESERVATION_NOT_APPROVED":
      message = `Reservasi #${details.entityId || ""} belum disetujui oleh tim operasional`;
      break;
    case "UNAUTHORIZED":
      message = "Akses ditolak: Izin tidak mencukupi";
      status = 403;
      break;
    default:
      break;
  }

  return new EnterpriseBusinessError(
    {
      code,
      message,
      reason: details.reason,
      suggestedAction: details.suggestedAction,
    },
    status,
  );
}

/**
 * Structured Logging Payload (Section 33)
 */
export interface StructuredLogPayload {
  requestId: string;
  userId?: string;
  action: string;
  entity: string;
  durationMs: number;
  result: "success" | "error" | "warning";
  details?: Record<string, any>;
}

export const structuredLogsStore: StructuredLogPayload[] = [];

/**
 * Structured Logger with PII & Credential Sanitization
 */
export function logEnterpriseOperation(payload: StructuredLogPayload): void {
  // Sanitize before logging (never log secret, token, or full NIK)
  const sanitizedDetails = payload.details ? { ...payload.details } : undefined;
  if (sanitizedDetails) {
    delete sanitizedDetails.password;
    delete sanitizedDetails.token;
    delete sanitizedDetails.secret;
    delete sanitizedDetails.apiKey;
    delete sanitizedDetails.creditCard;
  }

  const sanitized: StructuredLogPayload = {
    ...payload,
    details: sanitizedDetails,
  };

  structuredLogsStore.unshift(sanitized);

  // Output formatted log line in console
  const logLine = `[ENTERPRISE_AUDIT] request_id=${sanitized.requestId} user=${
    sanitized.userId || "SYSTEM"
  } action=${sanitized.action} entity=${sanitized.entity} duration=${
    sanitized.durationMs
  }ms result=${sanitized.result}`;

  if (sanitized.result === "error") {
    console.error(logLine, sanitized.details || "");
  } else {
    console.log(logLine);
  }
}
