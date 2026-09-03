// ==============================================================================
// Live Fleet Telematics API (Phase 4: Advanced Fleet & Telematics)
// ==============================================================================

import { NextResponse } from "next/server";
import { getVehicles } from "@/lib/data/vehicles";
import { queryOperationalAlerts } from "@/lib/services/operational-alert-service";

export async function GET() {
  const vehicles = await getVehicles();
  const alerts = await queryOperationalAlerts({ status: "ALL" });

  const activeAlerts = alerts.filter(
    (a) => a.status === "OPEN" || a.status === "ACKNOWLEDGED",
  );

  const movingCount = vehicles.filter(
    (v) => v.status === "RENTED" && (v.speed || 0) > 0,
  ).length;

  const stoppedCount = vehicles.filter(
    (v) =>
      (v.status === "RENTED" && (!v.speed || v.speed === 0)) ||
      v.status === "AVAILABLE",
  ).length;

  const offlineCount = vehicles.filter((v) => v.gpsStatus === "OFFLINE").length;

  return NextResponse.json({
    success: true,
    summary: {
      totalFleet: vehicles.length,
      moving: movingCount,
      stopped: stoppedCount,
      offline: offlineCount,
      activeAlertsCount: activeAlerts.length,
      criticalAlertsCount: activeAlerts.filter((a) => a.severity === "CRITICAL")
        .length,
    },
    alerts: activeAlerts,
  });
}
