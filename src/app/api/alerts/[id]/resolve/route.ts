// ==============================================================================
// Operational Alert Resolve Endpoint (Phase 4)
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { resolveAlertAction } from "@/lib/services/operational-alert-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const alertId = params.id;
  let body: any = {};
  try {
    body = await request.json();
  } catch (e) {
    // optional body
  }

  const actorName = body.actorName || "Operations Dispatcher";
  const resolutionNote =
    body.resolutionNote || "Masalah operasional telah diselesaikan.";

  const result = await resolveAlertAction(alertId, actorName, resolutionNote);
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: "Alert not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    alert: result.alert,
  });
}
