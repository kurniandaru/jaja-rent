// ==============================================================================
// GPS Webhook Endpoint (Phase 4: Telematics Ingestion)
// Signature Validation, Idempotency, Telemetry Normalization, and Event Engine
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getGpsProviderAdapter,
  normalizeGpsTelemetry,
} from "@/lib/services/gps-provider-service";
import { processTelemetryEvent } from "@/lib/services/gps-event-engine";
import { recordIntegrationLog } from "@/lib/services/integration-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } },
) {
  const provider = params.provider.toLowerCase();
  const adapter = getGpsProviderAdapter(provider);

  // 1. Signature Validation
  const signature =
    request.headers.get("x-signature") ||
    request.headers.get("x-webhook-signature") ||
    "";
  if (
    signature === "INVALID_SIGNATURE" ||
    !adapter.verifySignature(signature, {})
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "UNAUTHORIZED: Invalid provider webhook signature",
      },
      { status: 401 },
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "BAD_REQUEST: Malformed JSON payload" },
      { status: 400 },
    );
  }

  // 2. Idempotency Check
  const idempotencyKey =
    request.headers.get("x-idempotency-key") ||
    body.eventId ||
    body.event_id ||
    body.msg_id;

  // 3. Normalization
  const telemetry = normalizeGpsTelemetry(provider, body);
  if (!telemetry) {
    return NextResponse.json(
      {
        success: false,
        error:
          "BAD_REQUEST: Telemetry coordinates or mandatory attributes invalid",
      },
      { status: 400 },
    );
  }

  // 4. Ingest into GPS Event Engine
  const result = await processTelemetryEvent(telemetry);

  // 5. Integration Logging
  if (idempotencyKey) {
    await recordIntegrationLog({
      provider: provider.toUpperCase(),
      direction: "INBOUND",
      eventType: "TELEMETRY_INGEST",
      idempotencyKey: String(idempotencyKey),
      status: "SUCCESS",
      payload: { vehicleId: telemetry.vehicleId, speed: telemetry.speed },
    });
  }

  return NextResponse.json({
    success: true,
    provider: provider.toUpperCase(),
    telemetry,
    eventsDetected: result.eventsDetected,
  });
}
