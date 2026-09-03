/**
 * ==============================================================================
 * Phase 2: Fleet Inspection & Damage Comparison Engine
 * ==============================================================================
 */

import type { Vehicle } from "../types/fleet.ts";
import type { RentalRecord } from "../types/rental.ts";
import type {
  VehicleHandoverRecord,
  VehicleDamageRecord,
  VehicleConditionArea,
  ConditionSeverity,
  BeforeAfterComparisonItem,
  BeforeAfterComparisonSummary,
  InspectionConditionItem,
} from "../types/fleet-operations.ts";
import type { ActionBlockerReason } from "../types/business-core.ts";
import { recordAuditLog } from "./audit-service.ts";

let handoverSeq = 10001;
export function generateHandoverNumber(): string {
  return `HND-${handoverSeq++}`;
}

let damageSeq = 1001;
export function generateDamageNumber(): string {
  return `DMG-${damageSeq++}`;
}

/**
 * Explanatory Blocker for Vehicle Handover
 */
export function evaluateHandoverEligibility(
  vehicle: Vehicle,
  rental: RentalRecord,
  preRentalInspection?: {
    id: string;
    type: string;
    result: "PASSED" | "FAILED" | "CONDITIONAL" | "PENDING" | string;
  },
): {
  canPerform: boolean;
  blockerReasons: ActionBlockerReason[];
  errorMessage?: string;
} {
  const checks: ActionBlockerReason[] = [
    {
      label: "Alokasi Unit Sah",
      passed:
        vehicle.status === "ALLOCATED" ||
        vehicle.status === "RESERVED" ||
        vehicle.status === "INSPECTION" ||
        rental.vehicleId === vehicle.id,
      detail:
        vehicle.status === "ALLOCATED" ||
        vehicle.status === "RESERVED" ||
        vehicle.status === "INSPECTION"
          ? `Unit ${vehicle.plateNumber} siap serah terima`
          : `Status unit ${vehicle.status} belum dialokasikan untuk sewa ini`,
    },
    {
      label: "Inspeksi Pra-Rental (Pre-Rental QC)",
      passed:
        !!preRentalInspection &&
        preRentalInspection.type === "PRE_RENTAL" &&
        preRentalInspection.result === "PASSED",
      detail:
        preRentalInspection && preRentalInspection.result === "PASSED"
          ? "Inspeksi pra-rental lolos uji (PASSED)"
          : !preRentalInspection
            ? "Belum ada catatan inspeksi pra-rental"
            : `Hasil inspeksi pra-rental: ${preRentalInspection.result} (Wajib PASSED)`,
    },
    {
      label: "Unit Bebas Maintenance",
      passed: vehicle.status !== "MAINTENANCE" && vehicle.status !== "ACCIDENT",
      detail:
        vehicle.status !== "MAINTENANCE"
          ? "Unit tidak sedang dalam perawatan bengkel"
          : "Unit sedang dalam perbaikan di bengkel",
    },
  ];

  const canPerform = checks.every((c) => c.passed);
  const failed = checks.find((c) => !c.passed);

  return {
    canPerform,
    blockerReasons: checks,
    errorMessage: canPerform
      ? undefined
      : `Tidak dapat melakukan serah terima: ${failed?.label} (${failed?.detail})`,
  };
}

/**
 * Initiate Pre-Rental Inspection (Transitions ALLOCATED/RESERVED -> INSPECTION)
 */
export async function initiatePreRentalInspectionAction(
  vehicle: Vehicle,
  actorName: string,
  notes?: string,
): Promise<{ success: boolean; vehicle: Vehicle }> {
  const oldStatus = vehicle.status;
  vehicle.status = "INSPECTION";

  await recordAuditLog({
    actorName,
    entityType: "VEHICLE",
    entityId: vehicle.id,
    action: "PRE_RENTAL_INSPECTION_STARTED",
    oldData: { status: oldStatus },
    newData: { status: "INSPECTION" },
    notes:
      notes ||
      `Inspeksi pra-rental dimulai untuk unit ${vehicle.plateNumber}. Status unit berpindah ke INSPECTION.`,
  });

  return { success: true, vehicle };
}

/**
 * Execute Vehicle Handover Action
 */
export async function executeVehicleHandoverAction(
  vehicle: Vehicle,
  rental: RentalRecord,
  handoverData: {
    handoverLocation: string;
    odometer: number;
    fuelLevel: number;
    notes?: string;
  },
  preRentalInspection: {
    id: string;
    type: string;
    result: "PASSED" | "FAILED" | "CONDITIONAL" | "PENDING" | string;
  },
  performedBy: string,
): Promise<{
  success: boolean;
  handover?: VehicleHandoverRecord;
  error?: string;
}> {
  const eligibility = evaluateHandoverEligibility(
    vehicle,
    rental,
    preRentalInspection,
  );
  if (!eligibility.canPerform) {
    return { success: false, error: eligibility.errorMessage };
  }

  const handover: VehicleHandoverRecord = {
    id: generateHandoverNumber(),
    rentalId: rental.id,
    vehicleId: vehicle.id,
    vehiclePlate: vehicle.plateNumber,
    handoverAt: new Date().toISOString(),
    handoverLocation: handoverData.handoverLocation,
    startingOdometer: handoverData.odometer,
    startingFuelPercent: handoverData.fuelLevel,
    performedBy,
    customerAcknowledgedAt: new Date().toISOString(),
    notes: handoverData.notes,
  };

  const oldVehicleStatus = vehicle.status;
  vehicle.status = "RENTED";
  vehicle.odometer = handoverData.odometer;

  rental.status = "ACTIVE";
  rental.handover = {
    isHandedOver: true,
    location: handoverData.handoverLocation,
    handedBy: performedBy,
    confirmedAt: handover.handoverAt,
    odometerAtHandover: handoverData.odometer,
    fuelLevelPercent: handoverData.fuelLevel,
    notes: handoverData.notes,
  };

  await recordAuditLog({
    actorName: performedBy,
    entityType: "VEHICLE",
    entityId: vehicle.id,
    action: "VEHICLE_HANDOVER",
    oldData: { status: oldVehicleStatus },
    newData: {
      status: "RENTED",
      handoverId: handover.id,
      odometer: handover.startingOdometer,
      rentalId: rental.id,
    },
    notes: `Kendaraan ${vehicle.plateNumber} diserahterimakan kepada customer. Rental ${rental.id} menjadi ACTIVE.`,
  });

  return { success: true, handover };
}

/**
 * Return Vehicle from Customer
 * IMPORTANT: Vehicle status transitions to INSPECTION, NOT immediately AVAILABLE!
 */
export async function returnVehicleAction(
  vehicle: Vehicle,
  rental: RentalRecord,
  actualReturnDate: string,
  currentOdometer: number,
  actorName: string,
  notes?: string,
): Promise<{ success: boolean; vehicle: Vehicle }> {
  const oldStatus = vehicle.status;
  vehicle.status = "INSPECTION";
  vehicle.odometer = currentOdometer;

  rental.status = "RETURNING";
  rental.actualReturnDate = actualReturnDate;

  await recordAuditLog({
    actorName,
    entityType: "VEHICLE",
    entityId: vehicle.id,
    action: "VEHICLE_RETURNED",
    oldData: { status: oldStatus },
    newData: {
      status: "INSPECTION",
      odometer: currentOdometer,
      actualReturnDate,
    },
    notes: `Kendaraan ${vehicle.plateNumber} telah dikembalikan oleh penyewa. Menunggu inspeksi pengembalian (INSPECTION).`,
  });

  return { success: true, vehicle };
}

/**
 * Compare Pre-Rental Inspection vs Return Inspection
 * Generates delta across 10 vehicle areas.
 */
export function compareBeforeAndAfterInspections(
  preRentalItems: InspectionConditionItem[],
  returnItems: InspectionConditionItem[],
  vehicleId: string,
  vehiclePlate: string,
  preInspectionId: string = "INSP-PRE",
  returnInspectionId: string = "INSP-RET",
): BeforeAfterComparisonSummary {
  const comparisonItems: BeforeAfterComparisonItem[] = [];
  let newDamagesCount = 0;
  let worsenedCount = 0;
  let missingItemsCount = 0;
  let totalEstimatedDamageCost = 0;

  const severityWeights: Record<ConditionSeverity, number> = {
    NORMAL: 0,
    MINOR: 1,
    MAJOR: 2,
    CRITICAL: 3,
  };

  for (const after of returnItems) {
    const before = preRentalItems.find(
      (b) => b.area === after.area && b.componentName === after.componentName,
    ) || {
      area: after.area,
      componentName: after.componentName,
      conditionDescription: "Baik / Standar",
      severity: "NORMAL" as ConditionSeverity,
      isNormal: true,
    };

    const beforeWeight = severityWeights[before.severity];
    const afterWeight = severityWeights[after.severity];

    let deltaStatus:
      | "NO_CHANGE"
      | "NEW_DAMAGE"
      | "WORSENED_CONDITION"
      | "MISSING_ITEM" = "NO_CHANGE";
    let damageCost = 0;
    let desc = "Kondisi sama seperti saat serah terima";

    if (!after.isNormal && before.isNormal) {
      // Was normal before, now damaged
      deltaStatus = "NEW_DAMAGE";
      newDamagesCount++;
      damageCost =
        after.severity === "CRITICAL"
          ? 1500000
          : after.severity === "MAJOR"
            ? 750000
            : 250000;
      desc = `Kerusakan baru: ${after.conditionDescription}`;
    } else if (afterWeight > beforeWeight) {
      // Was already damaged, but worsened
      deltaStatus = "WORSENED_CONDITION";
      worsenedCount++;
      damageCost = (afterWeight - beforeWeight) * 350000;
      desc = `Kondisi memburuk: Dari ${before.conditionDescription} menjadi ${after.conditionDescription}`;
    } else if (after.conditionDescription.toLowerCase().includes("hilang")) {
      deltaStatus = "MISSING_ITEM";
      missingItemsCount++;
      damageCost = 300000;
      desc = `Komponen hilang: ${after.componentName}`;
    }

    totalEstimatedDamageCost += damageCost;

    comparisonItems.push({
      area: after.area,
      componentName: after.componentName,
      beforeCondition: before.conditionDescription,
      beforeSeverity: before.severity,
      afterCondition: after.conditionDescription,
      afterSeverity: after.severity,
      deltaStatus,
      estimatedDamageCost: damageCost,
      description: desc,
    });
  }

  const requiresMaintenance = comparisonItems.some(
    (item) =>
      item.afterSeverity === "CRITICAL" ||
      (item.afterSeverity === "MAJOR" &&
        ["ENGINE", "BRAKE", "TIRES", "SAFETY"].includes(item.area)),
  );

  return {
    preRentalInspectionId: preInspectionId,
    returnInspectionId: returnInspectionId,
    vehicleId,
    vehiclePlate,
    totalItemsCompared: comparisonItems.length,
    newDamagesCount,
    worsenedCount,
    missingItemsCount,
    totalEstimatedDamageCost,
    requiresMaintenance,
    maintenanceReason: requiresMaintenance
      ? "Ditemukan kerusakan berat pada komponen keselamatan/mesin pasca-sewa"
      : undefined,
    items: comparisonItems,
  };
}

/**
 * Record New Damage Record in Ledger
 */
export async function recordVehicleDamageAction(
  vehicleId: string,
  damageData: {
    area: VehicleConditionArea;
    description: string;
    severity: ConditionSeverity;
    estimatedCost: number;
    rentalId?: string;
    inspectionId?: string;
    isPreExisting?: boolean;
    notes?: string;
  },
  actorName: string,
): Promise<{ success: boolean; damage: VehicleDamageRecord }> {
  const damage: VehicleDamageRecord = {
    id: generateDamageNumber(),
    damageNumber: generateDamageNumber(),
    vehicleId,
    rentalId: damageData.rentalId,
    inspectionId: damageData.inspectionId,
    area: damageData.area,
    description: damageData.description,
    severity: damageData.severity,
    estimatedCost: damageData.estimatedCost,
    actualCost: 0,
    status: damageData.isPreExisting ? "WAIVED" : "OPEN",
    isPreExisting: damageData.isPreExisting || false,
    reportedAt: new Date().toISOString(),
    notes: damageData.notes,
  };

  await recordAuditLog({
    actorName,
    entityType: "VEHICLE",
    entityId: vehicleId,
    action: "DAMAGE_RECORDED",
    newData: {
      damageNumber: damage.damageNumber,
      area: damage.area,
      severity: damage.severity,
      estimatedCost: damage.estimatedCost,
      isPreExisting: damage.isPreExisting,
    },
    notes: `Kerusakan dicatat [${damage.area} - ${damage.severity}]: ${damage.description} (Estimasi Rp ${damage.estimatedCost.toLocaleString("id-ID")})`,
  });

  return { success: true, damage };
}
