// ==============================================================================
// Integration Service (Phase 3: Integration Layer & Webhook Idempotency)
// External Adapters, Signature Verification, and Idempotent Webhook Processing
// ==============================================================================

import type {
  IntegrationLogRecord,
  IntegrationStatus,
  InboundWebhookRequest,
  WebhookProcessingResult,
} from "../types/integration.ts";
import { getSupabaseBrowserClient } from "../supabase/client.ts";

let logSeq = 100;
function generateLogId(): string {
  return `INT-${++logSeq}`;
}

// In-Memory Integration Logs
export const inMemoryIntegrationLogs: IntegrationLogRecord[] = [
  {
    id: "INT-001",
    provider: "XENDIT_PAYMENT",
    eventType: "payment.succeeded",
    externalId: "XEN-PAY-987654",
    status: "SUCCESS",
    requestId: "REQ-2026-XEN01",
    idempotencyKey: "IDEMP-PAY-2026-001",
    payloadSummary: { amount: 4750000, rentalId: "RNT-B2C-2026-001" },
    responseSummary: { status: "PAID", confirmed: true },
    createdAt: "2026-09-02T14:29:50Z",
    processedAt: "2026-09-02T14:30:00Z",
  },
  {
    id: "INT-002",
    provider: "TELTONIKA_GPS",
    eventType: "telemetry.ping",
    externalId: "TEL-IMEI-86754321",
    status: "SUCCESS",
    requestId: "REQ-2026-TEL02",
    idempotencyKey: "IDEMP-GPS-2026-002",
    payloadSummary: {
      vehiclePlate: "B 1234 XYZ",
      speed: 45,
      lat: -6.225,
      lng: 106.808,
    },
    responseSummary: { ack: true },
    createdAt: "2026-09-03T07:10:00Z",
    processedAt: "2026-09-03T07:10:01Z",
  },
];

/**
 * Validate Webhook Signature
 */
export function verifyWebhookSignature(
  provider: string,
  signature: string,
  payload: Record<string, any>,
): boolean {
  // In production, compute HMAC SHA-256 with secret key
  // In dev / test, accept valid non-empty signatures or predefined test tokens
  if (!signature || signature === "INVALID_SIGNATURE") {
    return false;
  }
  return true;
}

/**
 * Process Inbound Webhook with Idempotency Protection (Section 29 & 30)
 */
export async function processInboundWebhook(
  request: InboundWebhookRequest,
): Promise<WebhookProcessingResult> {
  const logId = generateLogId();
  const now = new Date().toISOString();

  // 1. Signature Authentication Gate
  const isSignatureValid = verifyWebhookSignature(
    request.provider,
    request.signature,
    request.payload,
  );
  if (!isSignatureValid) {
    const failedLog: IntegrationLogRecord = {
      id: logId,
      provider: request.provider,
      eventType: request.eventType,
      status: "FAILED",
      idempotencyKey: request.idempotencyKey,
      errorMessage:
        "Tanda tangan webhook (signature) tidak sah / gagal autentikasi.",
      createdAt: now,
      processedAt: now,
    };
    inMemoryIntegrationLogs.unshift(failedLog);

    return {
      success: false,
      statusCode: 401,
      message: "Autentikasi webhook gagal: Signature tidak sah.",
      logId,
    };
  }

  // 2. Idempotency Gate (Section 30)
  // Check if same idempotency key was already processed successfully
  if (request.idempotencyKey) {
    const existing = inMemoryIntegrationLogs.find(
      (l) =>
        l.idempotencyKey === request.idempotencyKey && l.status === "SUCCESS",
    );
    if (existing) {
      return {
        success: true,
        statusCode: 200,
        isDuplicate: true,
        message: `Webhook dengan Idempotency Key '${request.idempotencyKey}' telah diproses sebelumnya. Mengembalikan respons idempotent.`,
        logId: existing.id,
      };
    }
  }

  // 3. Record Inbound Log (Status: PROCESSING)
  const logEntry: IntegrationLogRecord = {
    id: logId,
    provider: request.provider,
    eventType: request.eventType,
    externalId: request.payload?.id || request.payload?.transaction_id,
    status: "PROCESSING",
    idempotencyKey: request.idempotencyKey,
    payloadSummary: request.payload,
    createdAt: now,
  };
  inMemoryIntegrationLogs.unshift(logEntry);

  // 4. Dispatch Business Execution based on Provider & Event
  try {
    // Process business mutation safely
    // (e.g., payment webhook triggers payment confirmation)
    logEntry.status = "SUCCESS";
    logEntry.processedAt = new Date().toISOString();
    logEntry.responseSummary = {
      acknowledged: true,
      processedAt: logEntry.processedAt,
    };

    return {
      success: true,
      statusCode: 200,
      message: "Webhook berhasil diproses dan dicatat dalam audit integrasi.",
      logId,
    };
  } catch (err: any) {
    logEntry.status = "FAILED";
    logEntry.errorMessage = err?.message || "Internal webhook processing error";
    logEntry.processedAt = new Date().toISOString();

    return {
      success: false,
      statusCode: 500,
      message: `Pemrosesan webhook gagal: ${logEntry.errorMessage}`,
      logId,
    };
  }
}

/**
 * Get all integration logs
 */
export async function getIntegrationLogs(
  limit = 50,
): Promise<IntegrationLogRecord[]> {
  return inMemoryIntegrationLogs.slice(0, limit);
}

/**
 * Directly record an integration log
 */
export async function recordIntegrationLog(log: {
  provider: string;
  direction: "INBOUND" | "OUTBOUND";
  eventType: string;
  idempotencyKey?: string;
  status: IntegrationStatus;
  payload?: any;
  errorMessage?: string;
}): Promise<IntegrationLogRecord> {
  const logEntry: IntegrationLogRecord = {
    id: `INT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    provider: log.provider,
    eventType: log.eventType,
    status: log.status,
    idempotencyKey: log.idempotencyKey,
    payloadSummary: log.payload,
    errorMessage: log.errorMessage,
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString(),
  };
  inMemoryIntegrationLogs.unshift(logEntry);
  return logEntry;
}
