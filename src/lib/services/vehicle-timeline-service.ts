/**
 * ==============================================================================
 * Phase 2: Vehicle Timeline & Telematics Health Service
 * ==============================================================================
 */

import type {
  DocumentExpiryAlertStatus,
  GPSTelematicsInfo,
  GPSTelematicsStatus,
  VehicleTimelineEvent,
} from "../types/fleet-operations.ts";
import { getAuditLogsForEntity } from "./audit-service.ts";

/**
 * Calculates document compliance state:
 * - EXPIRED: expiry date has passed
 * - EXPIRING_SOON: within threshold (default 30 days)
 * - VALID: safe
 */
export function calculateDocumentAlert(
  expiryDateStr: string,
  currentDateStr?: string,
  thresholdDays: number = 30,
): {
  daysUntilExpiry: number;
  alertStatus: DocumentExpiryAlertStatus;
  alertMessage: string;
} {
  const today = currentDateStr ? new Date(currentDateStr) : new Date();
  const expiry = new Date(expiryDateStr);

  const diffMs = expiry.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return {
      daysUntilExpiry,
      alertStatus: "EXPIRED",
      alertMessage: `Kedaluwarsa ${Math.abs(daysUntilExpiry)} hari yang lalu`,
    };
  }

  if (daysUntilExpiry <= thresholdDays) {
    return {
      daysUntilExpiry,
      alertStatus: "EXPIRING_SOON",
      alertMessage: `Berakhir dalam ${daysUntilExpiry} hari`,
    };
  }

  return {
    daysUntilExpiry,
    alertStatus: "VALID",
    alertMessage: `Masa berlaku masih ${daysUntilExpiry} hari`,
  };
}

/**
 * Calculates GPS health:
 * If last seen is older than 2 hours or offline flag set -> OFFLINE
 */
export function evaluateGPSHealth(
  lastSeenIsoOrText: string,
  reportedSpeed: number = 0,
  ignition: boolean = false,
): {
  status: GPSTelematicsStatus;
  isOfflineWarning: boolean;
} {
  if (lastSeenIsoOrText.toLowerCase().includes("offline")) {
    return { status: "OFFLINE", isOfflineWarning: true };
  }

  // Try parsing ISO date
  const parsed = Date.parse(lastSeenIsoOrText);
  if (!isNaN(parsed)) {
    const hoursSinceLastSeen = (Date.now() - parsed) / (1000 * 60 * 60);
    if (hoursSinceLastSeen > 2) {
      return { status: "OFFLINE", isOfflineWarning: true };
    }
  }

  if (ignition && reportedSpeed > 0) {
    return { status: "ONLINE", isOfflineWarning: false };
  }

  return { status: "IDLE", isOfflineWarning: false };
}

/**
 * Aggregates all operational events and audit logs into a unified timeline for the vehicle
 */
export async function getVehicleFullTimeline(
  vehicleId: string,
  injectedEvents: VehicleTimelineEvent[] = [],
): Promise<VehicleTimelineEvent[]> {
  const auditLogs = await getAuditLogsForEntity("VEHICLE", vehicleId);

  const auditEvents: VehicleTimelineEvent[] = auditLogs.map((log) => {
    let eventType: VehicleTimelineEvent["eventType"] = "STATUS_CHANGE";
    let badgeVariant: VehicleTimelineEvent["badgeVariant"] = "outline";

    if (log.action.includes("ALLOCATE")) {
      eventType = "ALLOCATION";
      badgeVariant = "secondary";
    } else if (log.action.includes("HANDOVER")) {
      eventType = "HANDOVER";
      badgeVariant = "default";
    } else if (log.action.includes("RETURN")) {
      eventType = "RENTAL_RETURN";
      badgeVariant = "secondary";
    } else if (log.action.includes("DAMAGE")) {
      eventType = "DAMAGE_RECORDED";
      badgeVariant = "destructive";
    } else if (log.action.includes("QC_PASSED")) {
      eventType = "QC_PASS";
      badgeVariant = "default";
    } else if (log.action.includes("QC_FAILED")) {
      eventType = "QC_FAIL";
      badgeVariant = "destructive";
    } else if (log.action.includes("MAINTENANCE_STARTED")) {
      eventType = "MAINTENANCE_SCHEDULED";
      badgeVariant = "secondary";
    } else if (log.action.includes("MAINTENANCE_WORK_FINISHED")) {
      eventType = "MAINTENANCE_COMPLETED";
      badgeVariant = "secondary";
    }

    return {
      id: log.id,
      vehicleId,
      timestamp: log.createdAt,
      title: log.action.replace(/_/g, " "),
      eventType,
      description:
        log.notes || `Aksi ${log.action} dilakukan oleh ${log.actorName}`,
      actor: log.actorName,
      odometer: log.newData?.odometer,
      referenceId: log.entityId,
      badgeVariant,
    };
  });

  const combined = [...injectedEvents, ...auditEvents];

  // Sort chronologically descending (newest first)
  return combined.sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}
