import { NextRequest, NextResponse } from "next/server";
import { processInboundWebhook } from "@/lib/services/integration-service";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-webhook-signature") || "";
    const idempotencyKey =
      req.headers.get("x-idempotency-key") ||
      req.headers.get("idempotency-key") ||
      "";

    const body = await req.json();

    const result = await processInboundWebhook({
      provider: body.provider || "UNKNOWN_PROVIDER",
      signature: signature || body.signature || "DEFAULT_SIG",
      idempotencyKey: idempotencyKey || body.idempotencyKey || "",
      eventType: body.eventType || "unknown.event",
      payload: body.payload || body,
    });

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        isDuplicate: result.isDuplicate || false,
        logId: result.logId,
      },
      { status: result.statusCode },
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "INVALID_WEBHOOK_PAYLOAD",
        message: err?.message || "Failed to process incoming webhook.",
      },
      { status: 400 },
    );
  }
}
