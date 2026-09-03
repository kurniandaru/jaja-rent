// ==============================================================================
// Operational Alert Service (Phase 4: Telematics & Event Control)
// Alert Lifecycle (OPEN -> ACKNOWLEDGED -> RESOLVED), Incident Deduplication,
// Audit Logging, and Multi-Channel Notification Dispatch
// ==============================================================================

import type {
  OperationalAlertRecord,
  OperationalAlertType,
  AlertSeverity,
  AlertStatus,
} from "../types/operational-alert.ts";
import { recordAuditLog } from "./audit-service.ts";
import { emitDomainEvent } from "./domain-event-service.ts";
import { createNotification } from "./notification-service.ts";

let alertSeq = 100;
function generateAlertId(): string {
  const num = String(alertSeq++).padStart(5, "0");
  return `ALT-${num}`;
}

// In-memory operational alerts repository with rich seed data
export const inMemoryOperationalAlerts: OperationalAlertRecord[] = [
  {
    id: "ALT-00001",
    alertType: "RESTRICTED_AREA_ENTRY",
    severity: "CRITICAL",
    status: "OPEN",
    vehicleId: "B-2345-DEF",
    vehiclePlate: "B 2345 DEF",
    rentalId: "RNT-B2C-2026-088",
    customerId: "CUST-001",
    customerName: "Hendrawan Putra",
    driverId: "DRV-004",
    driverName: "Asep Sunandar",
    incidentKey: "RESTRICTED_AREA_ENTRY:B-2345-DEF:2026-09-03",
    title: "Pelanggaran Masuk Zona Terlarang (Pelabuhan Merak)",
    description:
      "Kendaraan Toyota Fortuner terdeteksi memasuki area terlarang penyeberangan tanpa izin operasional.",
    locationLat: -5.9325,
    locationLng: 105.9985,
    speed: 38,
    startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "ALT-00002",
    alertType: "OVERSPEED",
    severity: "WARNING",
    status: "ACKNOWLEDGED",
    vehicleId: "B-1234-XYZ",
    vehiclePlate: "B 1234 XYZ",
    rentalId: "RNT-B2B-2026-001",
    customerId: "CORP-001",
    customerName: "PT ABC Indonesia",
    driverId: "DRV-001",
    driverName: "Budi Santoso",
    incidentKey: "OVERSPEED:B-1234-XYZ:2026-09-03",
    title: "Peringatan Kecepatan Melebihi Batas (104 km/h)",
    description:
      "Toyota Innova Zenix terpantau melaju dengan kecepatan 104 km/h di Tol Jakarta-Cikampek (Batas: 80 km/h).",
    locationLat: -6.2589,
    locationLng: 106.9812,
    speed: 104,
    startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    acknowledgedAt: new Date(Date.now() - 30 * 60000).toISOString(),
    acknowledgedBy: "Agus Maulana (Operations)",
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    id: "ALT-00003",
    alertType: "LONG_STOP",
    severity: "WARNING",
    status: "OPEN",
    vehicleId: "B-9876-GHI",
    vehiclePlate: "B 9876 GHI",
    incidentKey: "LONG_STOP:B-9876-GHI:2026-09-03",
    title: "Kendaraan Berhenti Lama (> 3 Jam)",
    description:
      "Mitsubishi Pajero Sport berhenti di Rest Area KM 57 Tol Jakarta-Cikampek selama 3 jam 20 menit dalam kondisi kontak mati.",
    locationLat: -6.3789,
    locationLng: 107.1245,
    speed: 0,
    startedAt: new Date(Date.now() - 200 * 60000).toISOString(),
    createdAt: new Date(Date.now() - 200 * 60000).toISOString(),
  },
];

/**
 * Creates or updates an operational alert with strict Incident Key Deduplication.
 */
export async function createOperationalAlert(params: {
  alertType: OperationalAlertType;
  severity: AlertSeverity;
  vehicleId: string;
  vehiclePlate?: string;
  rentalId?: string;
  customerId?: string;
  customerName?: string;
  driverId?: string;
  driverName?: string;
  eventId?: string;
  incidentKey: string;
  title: string;
  description: string;
  locationLat?: number;
  locationLng?: number;
  speed?: number;
  startedAt?: string;
}): Promise<{ alert: OperationalAlertRecord; isDuplicate: boolean }> {
  // Check for existing active or open incident with same incidentKey
  const existingIndex = inMemoryOperationalAlerts.findIndex(
    (a) =>
      a.incidentKey === params.incidentKey &&
      (a.status === "OPEN" ||
        a.status === "ACKNOWLEDGED" ||
        a.status === "IN_PROGRESS"),
  );

  if (existingIndex >= 0) {
    const existing = inMemoryOperationalAlerts[existingIndex];
    // Update maximum speed and telemetry coordinates if applicable
    if (params.speed && params.speed > (existing.speed || 0)) {
      existing.speed = params.speed;
    }
    if (params.locationLat && params.locationLng) {
      existing.locationLat = params.locationLat;
      existing.locationLng = params.locationLng;
    }
    return { alert: existing, isDuplicate: true };
  }

  const alert: OperationalAlertRecord = {
    id: generateAlertId(),
    alertType: params.alertType,
    severity: params.severity,
    status: "OPEN",
    vehicleId: params.vehicleId,
    vehiclePlate: params.vehiclePlate,
    rentalId: params.rentalId,
    customerId: params.customerId,
    customerName: params.customerName,
    driverId: params.driverId,
    driverName: params.driverName,
    eventId: params.eventId,
    incidentKey: params.incidentKey,
    title: params.title,
    description: params.description,
    locationLat: params.locationLat,
    locationLng: params.locationLng,
    speed: params.speed,
    startedAt: params.startedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  inMemoryOperationalAlerts.unshift(alert);

  // 1. Dispatch in-app notification with event key deduplication
  await createNotification({
    recipientId: "OPERATIONS",
    type:
      alert.severity === "CRITICAL" ? "CRITICAL_ALERT" : "OPERATIONAL_WARNING",
    severity: alert.severity,
    title: alert.title,
    message: `${alert.description} (Unit: ${alert.vehiclePlate || alert.vehicleId})`,
    entityType: "VEHICLE",
    entityId: alert.vehicleId,
    eventKey: `NOTIF:${alert.incidentKey}`,
    actionUrl: `/operations/command-center`,
  });

  // 2. Dispatch Telegram alert notification if critical or warning
  if (alert.severity === "CRITICAL" || alert.severity === "WARNING") {
    await sendTelegramAlert(
      `🚨 [JAJA RENT FLEET ALERT]\nTipe: ${alert.alertType}\nSeverity: ${alert.severity}\nUnit: ${alert.vehiclePlate || alert.vehicleId}\nKeterangan: ${alert.title}\nLokasi: ${alert.locationLat ?? "-"}, ${alert.locationLng ?? "-"}`,
      "@jaja_fleet_operations",
    );
  }

  // 3. Emit Domain Event
  await emitDomainEvent({
    name:
      alert.severity === "CRITICAL"
        ? "alert.critical_created"
        : "alert.warning_created",
    entityType: "VEHICLE",
    entityId: alert.vehicleId,
    payload: {
      alertId: alert.id,
      alertType: alert.alertType,
      severity: alert.severity,
      title: alert.title,
      incidentKey: alert.incidentKey,
      vehiclePlate: alert.vehiclePlate,
      rentalId: alert.rentalId,
      customerId: alert.customerId,
    },
    actorName: "GPS Event Engine",
  });

  // 4. Record Audit Log
  await recordAuditLog({
    actorName: "GPS Event Engine",
    entityType: "VEHICLE",
    entityId: alert.vehicleId,
    action: `ALERT_${alert.alertType}_CREATED`,
    newData: {
      alertId: alert.id,
      severity: alert.severity,
      incidentKey: alert.incidentKey,
      title: alert.title,
      speed: alert.speed,
    },
    notes: `Peringatan operasional [${alert.severity}] terbit: ${alert.title}`,
  });

  return { alert, isDuplicate: false };
}

/**
 * Acknowledges an operational alert
 */
export async function acknowledgeAlertAction(
  alertId: string,
  actorName: string,
  note?: string,
): Promise<{ success: boolean; alert?: OperationalAlertRecord }> {
  const alert = inMemoryOperationalAlerts.find((a) => a.id === alertId);
  if (!alert) return { success: false };

  const oldStatus = alert.status;
  alert.status = "ACKNOWLEDGED";
  alert.acknowledgedAt = new Date().toISOString();
  alert.acknowledgedBy = actorName;
  if (note) {
    alert.description = `${alert.description} | Respon operator: ${note}`;
  }

  await recordAuditLog({
    actorName,
    entityType: "VEHICLE",
    entityId: alert.vehicleId,
    action: "ALERT_ACKNOWLEDGED",
    oldData: { status: oldStatus },
    newData: { status: alert.status, acknowledgedBy: actorName },
    notes: `Alert ${alert.id} (${alert.title}) telah ditanggapi oleh ${actorName}. ${note || ""}`,
  });

  return { success: true, alert };
}

/**
 * Resolves an operational alert
 */
export async function resolveAlertAction(
  alertId: string,
  actorName: string,
  resolutionNote: string,
): Promise<{ success: boolean; alert?: OperationalAlertRecord }> {
  const alert = inMemoryOperationalAlerts.find((a) => a.id === alertId);
  if (!alert) return { success: false };

  const oldStatus = alert.status;
  alert.status = "RESOLVED";
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = actorName;
  alert.resolutionNote = resolutionNote;
  alert.endedAt = new Date().toISOString();

  await emitDomainEvent({
    name: "alert.resolved",
    entityType: "VEHICLE",
    entityId: alert.vehicleId,
    payload: {
      alertId: alert.id,
      resolutionNote,
      resolvedBy: actorName,
    },
    actorName,
  });

  await recordAuditLog({
    actorName,
    entityType: "VEHICLE",
    entityId: alert.vehicleId,
    action: "ALERT_RESOLVED",
    oldData: { status: oldStatus },
    newData: { status: alert.status, resolvedBy: actorName, resolutionNote },
    notes: `Alert ${alert.id} (${alert.title}) telah diselesaikan oleh ${actorName}. Solusi: ${resolutionNote}`,
  });

  return { success: true, alert };
}

/**
 * Dismisses an operational alert
 */
export async function dismissAlertAction(
  alertId: string,
  actorName: string,
  reason: string,
): Promise<{ success: boolean; alert?: OperationalAlertRecord }> {
  const alert = inMemoryOperationalAlerts.find((a) => a.id === alertId);
  if (!alert) return { success: false };

  alert.status = "DISMISSED";
  alert.resolvedAt = new Date().toISOString();
  alert.resolvedBy = actorName;
  alert.resolutionNote = `Diabaikan: ${reason}`;
  alert.endedAt = new Date().toISOString();

  await recordAuditLog({
    actorName,
    entityType: "VEHICLE",
    entityId: alert.vehicleId,
    action: "ALERT_DISMISSED",
    newData: { status: "DISMISSED", resolutionNote: reason },
    notes: `Alert ${alert.id} diabaikan oleh ${actorName}. Alasan: ${reason}`,
  });

  return { success: true, alert };
}

/**
 * Queries operational alerts with multi-criteria filtering
 */
export async function queryOperationalAlerts(filters?: {
  status?: AlertStatus | "ALL";
  severity?: AlertSeverity | "ALL";
  vehicleId?: string;
  alertType?: OperationalAlertType | "ALL";
  search?: string;
}): Promise<OperationalAlertRecord[]> {
  let list = [...inMemoryOperationalAlerts];

  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((a) => a.status === filters.status);
  }
  if (filters?.severity && filters.severity !== "ALL") {
    list = list.filter((a) => a.severity === filters.severity);
  }
  if (filters?.vehicleId) {
    list = list.filter(
      (a) =>
        a.vehicleId.toLowerCase() === filters.vehicleId!.toLowerCase() ||
        (a.vehiclePlate &&
          a.vehiclePlate.toLowerCase() === filters.vehicleId!.toLowerCase()),
    );
  }
  if (filters?.alertType && filters.alertType !== "ALL") {
    list = list.filter((a) => a.alertType === filters.alertType);
  }
  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.vehiclePlate && a.vehiclePlate.toLowerCase().includes(q)) ||
        (a.customerName && a.customerName.toLowerCase().includes(q)) ||
        (a.driverName && a.driverName.toLowerCase().includes(q)),
    );
  }

  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOperationalAlertById(
  id: string,
): Promise<OperationalAlertRecord | null> {
  return inMemoryOperationalAlerts.find((a) => a.id === id) || null;
}

/**
 * Telegram Notification Provider Abstraction
 */
export async function sendTelegramAlert(
  message: string,
  chatOrChannel: string = "@jaja_fleet_operations",
): Promise<{ success: boolean; messageId: string }> {
  // Abstraction logging dispatch (credential kept safe in env)
  return {
    success: true,
    messageId: `TG-${Date.now()}`,
  };
}
