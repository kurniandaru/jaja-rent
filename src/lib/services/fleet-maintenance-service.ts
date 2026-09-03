/**
 * ==============================================================================
 * Phase 2: Fleet Maintenance & Quality Control (QC) Engine
 * ==============================================================================
 */

import type { Vehicle } from "../types/fleet.ts";
import type {
  MaintenanceItemizedRecord,
  MaintenanceQCRecord,
  MaintenanceOperationalStatus,
} from "../types/fleet-operations.ts";
import { recordAuditLog } from "./audit-service.ts";

let maintenanceSeq = 1001;
export function generateMaintenanceNumber(): string {
  return `MNT-${maintenanceSeq++}`;
}

let qcSeq = 1001;
export function generateQCNumber(): string {
  return `QC-${qcSeq++}`;
}

export interface MaintenanceTriggerResult {
  isTriggered: boolean;
  triggers: string[];
}

/**
 * Checks all 3 maintenance triggers: Odometer, Date, and Inspection Condition.
 */
export function checkMaintenanceTriggers(
  vehicle: Vehicle,
  options?: {
    currentDate?: string;
    nextServiceDate?: string;
    inspectionRequiresMaintenance?: boolean;
    inspectionReason?: string;
  },
): MaintenanceTriggerResult {
  const triggers: string[] = [];

  // 1. Odometer trigger
  if (vehicle.odometer >= vehicle.nextServiceOdometer) {
    const overdueKm = vehicle.odometer - vehicle.nextServiceOdometer;
    triggers.push(
      `Odometer telah melampaui batas servis berkala (${vehicle.odometer.toLocaleString("id-ID")} km ≥ ${vehicle.nextServiceOdometer.toLocaleString("id-ID")} km, telat ${overdueKm} km)`,
    );
  }

  // 2. Date trigger
  if (options?.nextServiceDate) {
    const today = options.currentDate || new Date().toISOString().split("T")[0];
    if (today >= options.nextServiceDate) {
      triggers.push(
        `Jadwal servis berkala telah jatuh tempo (${options.nextServiceDate})`,
      );
    }
  }

  // 3. Condition defect trigger
  if (options?.inspectionRequiresMaintenance) {
    triggers.push(
      `Rekomendasi inspeksi pengembalian: ${options.inspectionReason || "Ditemukan kerusakan yang membahayakan keselamatan"}`,
    );
  }

  return {
    isTriggered: triggers.length > 0,
    triggers,
  };
}

/**
 * Calculate total maintenance cost strictly from itemized parts and services.
 */
export function calculateMaintenanceTotalCost(
  items: MaintenanceItemizedRecord[],
): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
}

/**
 * Send Vehicle to Workshop / Maintenance
 */
export async function sendVehicleToMaintenanceAction(
  vehicle: Vehicle,
  maintenanceType: string,
  description: string,
  workshopName: string,
  actorName: string,
): Promise<{
  success: boolean;
  maintenanceRecordId: string;
  vehicle: Vehicle;
}> {
  const oldStatus = vehicle.status;
  vehicle.status = "MAINTENANCE";
  vehicle.maintenanceStatus = "IN_PROGRESS";

  const maintenanceRecordId = generateMaintenanceNumber();

  await recordAuditLog({
    actorName,
    entityType: "VEHICLE",
    entityId: vehicle.id,
    action: "MAINTENANCE_STARTED",
    oldData: { status: oldStatus },
    newData: {
      status: "MAINTENANCE",
      maintenanceRecordId,
      workshopName,
      maintenanceType,
      odometer: vehicle.odometer,
    },
    notes: `Kendaraan ${vehicle.plateNumber} dikirim ke bengkel ${workshopName} untuk ${maintenanceType}: ${description}`,
  });

  return {
    success: true,
    maintenanceRecordId,
    vehicle,
  };
}

/**
 * Complete Maintenance Work (moves to QC_PENDING)
 * IMPORTANT: Vehicle status remains in MAINTENANCE / INSPECTION until QC PASS!
 */
export async function completeMaintenanceWorkAction(
  vehicle: Vehicle,
  maintenanceId: string,
  items: MaintenanceItemizedRecord[],
  workshopName: string,
  actorName: string,
): Promise<{
  success: boolean;
  totalCost: number;
  maintenanceStatus: MaintenanceOperationalStatus;
  vehicleStatus: string;
}> {
  const totalCost = calculateMaintenanceTotalCost(items);
  const oldStatus = vehicle.status;
  vehicle.status = "QC" as any;

  await recordAuditLog({
    actorName,
    entityType: "VEHICLE",
    entityId: vehicle.id,
    action: "MAINTENANCE_WORK_FINISHED",
    oldData: { status: oldStatus },
    newData: {
      maintenanceId,
      totalCost,
      itemsCount: items.length,
      status: "QC_PENDING",
      vehicleStatus: "QC",
    },
    notes: `Pekerjaan servis ${maintenanceId} selesai di ${workshopName}. Total biaya Rp ${totalCost.toLocaleString("id-ID")}. Unit kini dalam tahap QC (Quality Control).`,
  });

  return {
    success: true,
    totalCost,
    maintenanceStatus: "QC_PENDING",
    vehicleStatus: "QC",
  };
}

/**
 * Perform Maintenance QC Gate
 * PASS -> Vehicle becomes AVAILABLE!
 * FAIL -> Vehicle remains MAINTENANCE (rework in progress)!
 */
export async function performMaintenanceQCAction(
  vehicle: Vehicle,
  maintenanceId: string,
  result: "PASS" | "FAIL",
  checkedBy: string,
  notes: string,
): Promise<{
  success: boolean;
  qcRecord: MaintenanceQCRecord;
  vehicleStatus: string;
}> {
  const qcRecord: MaintenanceQCRecord = {
    id: generateQCNumber(),
    maintenanceId,
    vehicleId: vehicle.id,
    checkedBy,
    checkedAt: new Date().toISOString(),
    result,
    notes,
    reworkRequired: result === "FAIL",
  };

  const oldStatus = vehicle.status;

  if (result === "PASS") {
    vehicle.status = "AVAILABLE";
    vehicle.maintenanceStatus = "OK";
    vehicle.nextServiceOdometer = vehicle.odometer + 10000; // Next service in 10,000 km

    await recordAuditLog({
      actorName: checkedBy,
      entityType: "VEHICLE",
      entityId: vehicle.id,
      action: "MAINTENANCE_QC_PASSED",
      oldData: { status: oldStatus },
      newData: {
        status: "AVAILABLE",
        maintenanceStatus: "OK",
        nextServiceOdometer: vehicle.nextServiceOdometer,
      },
      notes: `QC PASS oleh ${checkedBy}: ${notes}. Kendaraan ${vehicle.plateNumber} siap kembali disewakan (AVAILABLE).`,
    });
  } else {
    vehicle.status = "MAINTENANCE";
    vehicle.maintenanceStatus = "IN_PROGRESS";

    await recordAuditLog({
      actorName: checkedBy,
      entityType: "VEHICLE",
      entityId: vehicle.id,
      action: "MAINTENANCE_QC_FAILED",
      oldData: { status: oldStatus },
      newData: { status: "MAINTENANCE", reworkRequired: true },
      notes: `QC GAGAL oleh ${checkedBy}: ${notes}. Kendaraan ${vehicle.plateNumber} dikembalikan untuk perbaikan ulang.`,
    });
  }

  return {
    success: true,
    qcRecord,
    vehicleStatus: vehicle.status,
  };
}
