// ==============================================================================
// Background Jobs Service (Phase 3: Automated Enterprise Operations)
// Idempotent Scheduled Jobs: Expiry Checks, Overdue Rentals, Maintenance Due, GPS Health
// ==============================================================================

import { getVehicles } from "../data/vehicles.ts";
import { getRentals } from "../data/rentals.ts";
import {
  createNotification,
  getNotificationThresholds,
} from "./notification-service.ts";

export interface ScheduledJobExecutionResult {
  jobName: string;
  itemsEvaluated: number;
  notificationsCreated: number;
  duplicatesIgnored: number;
  executedAt: string;
  durationMs: number;
}

/**
 * 1. Check Expiring Documents (Vehicles STNK/KIR and Customer KYC)
 */
export async function checkExpiringDocuments(): Promise<ScheduledJobExecutionResult> {
  const startTime = Date.now();
  const thresholds = getNotificationThresholds();
  const warningDays = thresholds.documentExpiryWarningDays;

  const vehicles = await getVehicles();
  let created = 0;
  let duplicates = 0;

  const now = new Date();
  const todayDateOnly = now.toISOString().split("T")[0];

  for (const v of vehicles) {
    // In Phase 2 seed data, documentStatus indicates status
    if (
      v.documentStatus === "EXPIRING_SOON" ||
      v.documentStatus === "EXPIRED"
    ) {
      const isExpired = v.documentStatus === "EXPIRED";
      const eventKey = `VEHICLE_DOC_${isExpired ? "EXPIRED" : "EXPIRING"}:${v.id}:${todayDateOnly}`;

      const res = await createNotification({
        recipientId: "OPERATIONS",
        type: isExpired
          ? "VEHICLE_DOCUMENT_EXPIRED"
          : "VEHICLE_DOCUMENT_EXPIRING",
        severity: isExpired ? "CRITICAL" : "WARNING",
        title: isExpired
          ? `Dokumen Kendaraan Telah EXPIRED (${v.plateNumber})`
          : `Dokumen Kendaraan Segera Kedaluwarsa (${v.plateNumber})`,
        message: `Masa berlaku berkas legalitas unit ${v.brand} ${v.model} (${v.plateNumber}) membutuhkan perpanjangan segera.`,
        entityType: "VEHICLE",
        entityId: v.id,
        eventKey,
        actionUrl: `/fleet/${v.id}`,
      });

      if (res.duplicateIgnored) {
        duplicates++;
      } else if (res.success) {
        created++;
      }
    }
  }

  return {
    jobName: "checkExpiringDocuments",
    itemsEvaluated: vehicles.length,
    notificationsCreated: created,
    duplicatesIgnored: duplicates,
    executedAt: now.toISOString(),
    durationMs: Date.now() - startTime,
  };
}

/**
 * 2. Check Overdue Rentals & 24h Return Reminders
 */
export async function checkOverdueRentals(): Promise<ScheduledJobExecutionResult> {
  const startTime = Date.now();
  const thresholds = getNotificationThresholds();
  const reminderHours = thresholds.rentalReturnReminderHours;

  const rentals = await getRentals();
  let created = 0;
  let duplicates = 0;

  const now = new Date();
  const todayDateOnly = now.toISOString().split("T")[0];

  for (const r of rentals) {
    if (r.status === "ACTIVE") {
      const returnDate = new Date(r.endDate);
      const hoursUntilReturn =
        (returnDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Overdue condition
      if (hoursUntilReturn < 0) {
        const eventKey = `RENTAL_OVERDUE:${r.id}:${todayDateOnly}`;
        const res = await createNotification({
          recipientId: "OPERATIONS",
          type: "RENTAL_OVERDUE",
          severity: "CRITICAL",
          title: `Rental OVERDUE Melewati Batas Sewa (${(r as any).rentalNumber || r.id})`,
          message: `Rental #${(r as any).rentalNumber || r.id} untuk penyewa ${r.customerName} terlambat dikembalikan sejak ${r.endDate}.`,
          entityType: "RENTAL",
          entityId: r.id,
          eventKey,
          actionUrl: `/operations/rentals/${r.id}`,
        });
        if (res.duplicateIgnored) duplicates++;
        else if (res.success) created++;
      }
      // Return reminder condition (within threshold hours)
      else if (hoursUntilReturn <= reminderHours) {
        const eventKey = `RENTAL_RETURN_REMINDER:${r.id}:${todayDateOnly}`;
        const res = await createNotification({
          recipientId: "ALL",
          type: "RENTAL_RETURN_REMINDER",
          severity: "WARNING",
          title: `Pengingat Pengembalian Unit (${(r as any).rentalNumber || r.id})`,
          message: `Unit ${r.vehiclePlate} dijadwalkan kembali dalam ${Math.max(1, Math.round(hoursUntilReturn))} jam ke depan.`,
          entityType: "RENTAL",
          entityId: r.id,
          eventKey,
          actionUrl: `/operations/rentals/${r.id}`,
        });
        if (res.duplicateIgnored) duplicates++;
        else if (res.success) created++;
      }
    }
  }

  return {
    jobName: "checkOverdueRentals",
    itemsEvaluated: rentals.length,
    notificationsCreated: created,
    duplicatesIgnored: duplicates,
    executedAt: now.toISOString(),
    durationMs: Date.now() - startTime,
  };
}

/**
 * 3. Check Maintenance Due
 */
export async function checkMaintenanceDue(): Promise<ScheduledJobExecutionResult> {
  const startTime = Date.now();
  const vehicles = await getVehicles();
  let created = 0;
  let duplicates = 0;

  const now = new Date();
  const todayDateOnly = now.toISOString().split("T")[0];

  for (const v of vehicles) {
    const isDue =
      v.maintenanceStatus === "DUE" ||
      v.maintenanceStatus === "OVERDUE" ||
      (v.nextServiceOdometer && v.odometer >= v.nextServiceOdometer);

    if (isDue && v.status !== "MAINTENANCE") {
      const eventKey = `VEHICLE_MAINTENANCE_DUE:${v.id}:${todayDateOnly}`;
      const res = await createNotification({
        recipientId: "WORKSHOP",
        type: "VEHICLE_MAINTENANCE_REQUIRED",
        severity: "WARNING",
        title: `Jadwal Servis Berkala Armada (${v.plateNumber})`,
        message: `Unit ${v.brand} ${v.model} (${v.plateNumber}) telah mencapai KM ${v.odometer.toLocaleString("id-ID")}. Memerlukan servis berkala.`,
        entityType: "VEHICLE",
        entityId: v.id,
        eventKey,
        actionUrl: `/fleet/${v.id}`,
      });
      if (res.duplicateIgnored) duplicates++;
      else if (res.success) created++;
    }
  }

  return {
    jobName: "checkMaintenanceDue",
    itemsEvaluated: vehicles.length,
    notificationsCreated: created,
    duplicatesIgnored: duplicates,
    executedAt: now.toISOString(),
    durationMs: Date.now() - startTime,
  };
}

/**
 * 4. Check GPS Offline
 */
export async function checkGpsOffline(): Promise<ScheduledJobExecutionResult> {
  const startTime = Date.now();
  const vehicles = await getVehicles();
  let created = 0;
  let duplicates = 0;

  const now = new Date();
  const todayDateOnly = now.toISOString().split("T")[0];

  for (const v of vehicles) {
    if (v.gpsStatus === "OFFLINE") {
      const eventKey = `GPS_OFFLINE:${v.id}:${todayDateOnly}`;
      const res = await createNotification({
        recipientId: "OPERATIONS",
        type: "GPS_OFFLINE_WARNING",
        severity: "WARNING",
        title: `Peringatan GPS Telematika Offline (${v.plateNumber})`,
        message: `Perangkat GPS unit ${v.plateNumber} tidak mengirimkan sinyal telematika selama lebih dari 30 menit.`,
        entityType: "VEHICLE",
        entityId: v.id,
        eventKey,
        actionUrl: `/operations/gps`,
      });
      if (res.duplicateIgnored) duplicates++;
      else if (res.success) created++;
    }
  }

  return {
    jobName: "checkGpsOffline",
    itemsEvaluated: vehicles.length,
    notificationsCreated: created,
    duplicatesIgnored: duplicates,
    executedAt: now.toISOString(),
    durationMs: Date.now() - startTime,
  };
}

/**
 * Run All Scheduled Jobs (Can be called by cron endpoint or test runner)
 */
export async function runAllScheduledJobs(): Promise<
  ScheduledJobExecutionResult[]
> {
  const docResult = await checkExpiringDocuments();
  const overdueResult = await checkOverdueRentals();
  const mntResult = await checkMaintenanceDue();
  const gpsResult = await checkGpsOffline();

  return [docResult, overdueResult, mntResult, gpsResult];
}
