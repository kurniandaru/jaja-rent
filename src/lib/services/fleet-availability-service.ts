/**
 * ==============================================================================
 * Phase 2: Centralized Fleet Availability & Allocation Engine
 * ==============================================================================
 */

import type { Vehicle } from "../types/fleet.ts";
import type {
  VehicleAllocationRecord,
  VehicleMatchingRequirement,
  VehicleAvailabilityResult,
} from "../types/fleet-operations.ts";
import type { ActionBlockerReason } from "../types/business-core.ts";
import { hasDateConflict } from "./reservation-service.ts";
import { recordAuditLog } from "./audit-service.ts";

let allocationSeq = 10001;
export function generateAllocationNumber(): string {
  return `ALC-${allocationSeq++}`;
}

export interface AvailabilityCommitment {
  id: string;
  vehicleId: string;
  sourceType: "ALLOCATION" | "RENTAL" | "RESERVATION" | "MAINTENANCE";
  startDate: string;
  endDate: string;
  status: string;
  referenceTitle?: string;
}

/**
 * Evaluates whether a vehicle is available for a given date range.
 * Considers:
 * 1. Lifecycle status (ACTIVE vs INACTIVE/SOLD)
 * 2. Operational state (MAINTENANCE, ACCIDENT, INSPECTION)
 * 3. Overlapping commitments (allocations, rentals, maintenance)
 * 4. Document compliance (expired legal documents)
 */
export function getVehicleAvailability(
  vehicle: Vehicle,
  startAt: string,
  endAt: string,
  commitments: AvailabilityCommitment[] = [],
  excludeCommitmentId?: string,
): VehicleAvailabilityResult {
  const blockerReasons: ActionBlockerReason[] = [];

  // 1. Lifecycle Status check
  const lifecycle = vehicle.lifecycleStatus || "ACTIVE";
  const isLifecycleActive = lifecycle === "ACTIVE";
  blockerReasons.push({
    label: "Status Aset Kendaraan Aktif",
    passed: isLifecycleActive,
    detail: isLifecycleActive
      ? "Unit berstatus aktif dalam armada"
      : `Unit berstatus ${lifecycle} (tidak dapat disewakan)`,
  });

  // 2. Operational Status Check
  const blockedCurrentStatuses = [
    "MAINTENANCE",
    "ACCIDENT",
    "SOLD",
    "INACTIVE",
  ];
  const isOperationalStatusOk = !blockedCurrentStatuses.includes(
    vehicle.status,
  );
  blockerReasons.push({
    label: "Status Operasional Saat Ini",
    passed: isOperationalStatusOk,
    detail: isOperationalStatusOk
      ? `Unit siap operasi (${vehicle.status})`
      : `Unit sedang dalam kondisi ${vehicle.status}`,
  });

  // 3. Document Compliance Check
  const isDocumentValid = vehicle.documentStatus !== "EXPIRED";
  blockerReasons.push({
    label: "Kepatuhan Dokumen Kendaraan",
    passed: isDocumentValid,
    detail: isDocumentValid
      ? "Dokumen legal kendaraan (STNK/KIR) berlaku"
      : "Dokumen kendaraan EXPIRED — unit dalam masa tahan operasional",
  });

  // 4. Overlapping Commitments Check (Strict date conflict)
  let conflictingCommitment: AvailabilityCommitment | undefined;
  for (const c of commitments) {
    if (c.vehicleId === vehicle.id) {
      if (excludeCommitmentId && c.id === excludeCommitmentId) continue;
      if (["CANCELLED", "COMPLETED", "RELEASED", "REJECTED"].includes(c.status))
        continue;

      if (hasDateConflict(startAt, endAt, c.startDate, c.endDate)) {
        conflictingCommitment = c;
        break;
      }
    }
  }

  const hasNoScheduleConflict = !conflictingCommitment;
  blockerReasons.push({
    label: "Bebas Benturan Jadwal (No Overlap)",
    passed: hasNoScheduleConflict,
    detail: hasNoScheduleConflict
      ? `Jadwal ${startAt} s/d ${endAt} kosong`
      : `Benturan dengan ${conflictingCommitment?.sourceType} (${conflictingCommitment?.startDate} s/d ${conflictingCommitment?.endDate})`,
  });

  const isAvailable = blockerReasons.every((b) => b.passed);

  return {
    isAvailable,
    vehicleId: vehicle.id,
    plateNumber: vehicle.plateNumber,
    operationalStatus: vehicle.status as any,
    lifecycleStatus: lifecycle as any,
    blockerReasons,
    conflictingAllocation:
      conflictingCommitment?.sourceType === "ALLOCATION"
        ? ({ id: conflictingCommitment.id, vehicleId: vehicle.id } as any)
        : undefined,
    conflictingRentalId:
      conflictingCommitment?.sourceType === "RENTAL"
        ? conflictingCommitment.id
        : undefined,
    conflictingMaintenanceId:
      conflictingCommitment?.sourceType === "MAINTENANCE"
        ? conflictingCommitment.id
        : undefined,
    hasDocumentIssue: !isDocumentValid,
  };
}

/**
 * Matches reservation requirements with fleet units and filters by availability.
 */
export function findAvailableVehicles(
  requirement: VehicleMatchingRequirement,
  startAt: string,
  endAt: string,
  vehicles: Vehicle[],
  commitments: AvailabilityCommitment[] = [],
): {
  compatibleVehicles: Vehicle[];
  availableCandidates: Vehicle[];
  blockedCandidates: { vehicle: Vehicle; reason: string }[];
} {
  // 1. Filter by specs / requirements
  const compatibleVehicles = vehicles.filter((v) => {
    // Business eligibility check
    if (requirement.rentalType === "B2C") {
      if (v.businessEligibility === "B2B") return false;
      if (v.ownership === "VENDOR_OWNED") return false; // Vendor owned cannot do B2C
    }

    // Vehicle Type (e.g. MPV, SUV)
    if (requirement.vehicleType && requirement.vehicleType !== "ANY") {
      const typeMatch =
        v.model.toLowerCase().includes(requirement.vehicleType.toLowerCase()) ||
        v.brand.toLowerCase().includes(requirement.vehicleType.toLowerCase());
      if (!typeMatch) return false;
    }

    // Transmission
    if (requirement.transmission && requirement.transmission !== "ANY") {
      if (v.transmission !== requirement.transmission) return false;
    }

    // Min Seats
    if (requirement.minSeats && v.seatCapacity < requirement.minSeats) {
      return false;
    }

    // Fuel type
    if (requirement.fuelType && requirement.fuelType !== "ANY") {
      if (v.fuelType.toLowerCase() !== requirement.fuelType.toLowerCase())
        return false;
    }

    return true;
  });

  const availableCandidates: Vehicle[] = [];
  const blockedCandidates: { vehicle: Vehicle; reason: string }[] = [];

  // 2. Evaluate availability for each compatible vehicle
  for (const v of compatibleVehicles) {
    const avail = getVehicleAvailability(v, startAt, endAt, commitments);
    if (avail.isAvailable) {
      availableCandidates.push(v);
    } else {
      const failed = avail.blockerReasons.find((b) => !b.passed);
      blockedCandidates.push({
        vehicle: v,
        reason: failed ? `${failed.label}: ${failed.detail}` : "Tidak tersedia",
      });
    }
  }

  return {
    compatibleVehicles,
    availableCandidates,
    blockedCandidates,
  };
}

/**
 * Execute Vehicle Allocation Action
 */
export async function allocateVehicleAction(
  vehicle: Vehicle,
  startAt: string,
  endAt: string,
  allocatedBy: string,
  reservationId?: string,
  rentalId?: string,
  commitments: AvailabilityCommitment[] = [],
): Promise<{
  success: boolean;
  allocation?: VehicleAllocationRecord;
  error?: string;
}> {
  const availability = getVehicleAvailability(
    vehicle,
    startAt,
    endAt,
    commitments,
  );
  if (!availability.isAvailable) {
    const failedCheck = availability.blockerReasons.find((b) => !b.passed);
    return {
      success: false,
      error: `Gagal mengalokasikan unit ${vehicle.plateNumber}: ${failedCheck?.label} (${failedCheck?.detail})`,
    };
  }

  const allocation: VehicleAllocationRecord = {
    id: generateAllocationNumber(),
    allocationNumber: generateAllocationNumber(),
    vehicleId: vehicle.id,
    vehiclePlate: vehicle.plateNumber,
    vehicleModel: `${vehicle.brand} ${vehicle.model}`,
    reservationId,
    rentalId,
    startAt,
    endAt,
    status: "ALLOCATED",
    allocatedBy,
    allocatedAt: new Date().toISOString(),
  };

  const oldStatus = vehicle.status;
  vehicle.status = "ALLOCATED";

  await recordAuditLog({
    actorName: allocatedBy,
    entityType: "VEHICLE",
    entityId: vehicle.id,
    action: "ALLOCATE_VEHICLE",
    oldData: { status: oldStatus },
    newData: {
      status: "ALLOCATED",
      allocationNumber: allocation.allocationNumber,
      startAt,
      endAt,
      reservationId,
      rentalId,
    },
    notes: `Kendaraan ${vehicle.plateNumber} dialokasikan untuk ${startAt} s/d ${endAt} oleh ${allocatedBy}`,
  });

  return {
    success: true,
    allocation,
  };
}

/**
 * Execute Release Vehicle Allocation Action
 */
export async function releaseVehicleAllocationAction(
  allocation: VehicleAllocationRecord,
  vehicle: Vehicle,
  releasedBy: string,
): Promise<{ success: boolean; message: string }> {
  allocation.status = "RELEASED";
  allocation.releasedAt = new Date().toISOString();

  if (vehicle.status === "ALLOCATED" || vehicle.status === "RESERVED") {
    vehicle.status = "AVAILABLE";
  }

  await recordAuditLog({
    actorName: releasedBy,
    entityType: "VEHICLE",
    entityId: vehicle.id,
    action: "RELEASE_ALLOCATION",
    newData: {
      status: vehicle.status,
      allocationNumber: allocation.allocationNumber,
      releasedAt: allocation.releasedAt,
    },
    notes: `Alokasi ${allocation.allocationNumber} pada kendaraan ${vehicle.plateNumber} telah dilepas (RELEASED) oleh ${releasedBy}`,
  });

  return {
    success: true,
    message: `Alokasi ${allocation.allocationNumber} berhasil dilepas. Unit kini AVAILABLE.`,
  };
}
