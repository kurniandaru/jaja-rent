// ==============================================================================
// Integration Types (Phase 3: Integration Layer & Webhook Idempotency)
// External Adapters, Webhook Payloads, and Integration Audit Logs
// ==============================================================================

export type IntegrationProviderType =
  | "PAYMENT_GATEWAY"
  | "GPS_TELEMATICS"
  | "EMAIL_SERVICE"
  | "WHATSAPP_GATEWAY"
  | "ACCOUNTING_SYSTEM";

export type IntegrationStatus =
  | "RECEIVED"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "RETRYING";

export interface IntegrationLogRecord {
  id: string;
  provider: string; // e.g. 'XENDIT', 'MIDTRANS', 'TELTONIKA', 'JURNAL'
  eventType: string;
  externalId?: string;
  status: IntegrationStatus;
  requestId?: string;
  idempotencyKey?: string;
  payloadSummary?: Record<string, any>;
  responseSummary?: Record<string, any>;
  errorMessage?: string;
  createdAt: string;
  processedAt?: string;
}

export interface InboundWebhookRequest {
  provider: string;
  signature: string;
  idempotencyKey: string;
  eventType: string;
  payload: Record<string, any>;
}

export interface WebhookProcessingResult {
  success: boolean;
  statusCode: number;
  message: string;
  isDuplicate?: boolean;
  logId: string;
}
