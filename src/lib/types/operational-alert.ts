// ==============================================================================
// Operational Alert Domain Types (Phase 4: Telematics & Event Control)
// Alert Lifecycle, Severities, Deduplication Keys, and Action Handlers
// ==============================================================================

export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";

export type AlertStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "DISMISSED";

export type OperationalAlertType =
  | "OVERSPEED"
  | "LONG_STOP"
  | "GPS_OFFLINE"
  | "GEOFENCE_EXIT"
  | "RESTRICTED_AREA_ENTRY"
  | "VEHICLE_TAMPERING";

export interface OperationalAlertRecord {
  id: string;
  alertType: OperationalAlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  vehicleId: string;
  vehiclePlate?: string;
  rentalId?: string;
  customerId?: string;
  customerName?: string;
  driverId?: string;
  driverName?: string;
  eventId?: string;
  incidentKey: string; // Used for deduplication! e.g. OVERSPEED:VEH-001:2026-09-03
  title: string;
  description: string;
  locationLat?: number;
  locationLng?: number;
  speed?: number;
  startedAt: string;
  endedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  createdAt: string;
}

export interface AlertActionPayload {
  alertId: string;
  action: "ACKNOWLEDGE" | "RESOLVE" | "DISMISS";
  actorName: string;
  note?: string;
}
