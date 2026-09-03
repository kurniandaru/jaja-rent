import type {
  ReservationCoreRecord,
  ReservationLifecycleStatus,
  ActionBlockerReason,
} from "../types/business-core.ts";
import type {
  IndividualCustomer,
  CorporateCustomer,
} from "../types/customer.ts";
import type { Vehicle } from "../types/fleet.ts";
import { recordAuditLog } from "./audit-service.ts";

let reservationSeq = 100;
export function generateReservationNumber(): string {
  const num = String(reservationSeq++).padStart(6, "0");
  return `RES-${num}`;
}

/**
 * Robust Date Range Conflict Checker
 * Two periods [startA, endA] and [startB, endB] conflict if and only if:
 * startA < endB AND endA > startB
 */
export function hasDateConflict(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date,
): boolean {
  const tStartA = new Date(startA).getTime();
  const tEndA = new Date(endA).getTime();
  const tStartB = new Date(startB).getTime();
  const tEndB = new Date(endB).getTime();

  return tStartA < tEndB && tEndA > tStartB;
}

export interface ExistingVehicleCommitment {
  vehicleId: string;
  sourceId: string; // reservationId or rentalId
  sourceType: "RESERVATION" | "RENTAL";
  startDate: string;
  endDate: string;
  status: string;
}

/**
 * Check if a vehicle is available for a given date range
 */
export function isVehicleAvailableForDates(
  vehicleId: string,
  startDate: string,
  endDate: string,
  commitments: ExistingVehicleCommitment[],
  excludeSourceId?: string,
): { isAvailable: boolean; conflictingCommitment?: ExistingVehicleCommitment } {
  for (const c of commitments) {
    if (c.vehicleId === vehicleId) {
      if (excludeSourceId && c.sourceId === excludeSourceId) continue;
      // Skip completed or cancelled commitments
      if (["CANCELLED", "COMPLETED", "REJECTED"].includes(c.status)) continue;

      if (hasDateConflict(startDate, endDate, c.startDate, c.endDate)) {
        return { isAvailable: false, conflictingCommitment: c };
      }
    }
  }

  return { isAvailable: true };
}

/**
 * Validate customer eligibility to create a reservation
 */
export function validateCustomerCanReserve(
  customer: IndividualCustomer | CorporateCustomer,
  withSelfDrive = true,
): { canReserve: boolean; reason?: string } {
  // 1. Status check
  if (
    customer.status === "BLACKLISTED" ||
    ("isBlacklisted" in customer && customer.isBlacklisted)
  ) {
    return {
      canReserve: false,
      reason:
        "Customer masuk dalam daftar BLACKLIST sistem. Reservasi ditolak.",
    };
  }

  if (customer.status === "SUSPENDED") {
    return {
      canReserve: false,
      reason:
        "Akun customer sedang di-SUSPEND. Harap hubungi manajemen Jaja Rent.",
    };
  }

  const isVerified =
    customer.status === "VERIFIED" ||
    customer.status === "APPROVED" ||
    customer.status === "ACTIVE";
  if (!isVerified) {
    return {
      canReserve: false,
      reason: `Customer belum berstatus VERIFIED (Status saat ini: ${customer.status}). Dokumen identitas harus diverifikasi terlebih dahulu.`,
    };
  }

  // 2. SIM check if self drive for individual customer
  if (customer.type === "INDIVIDUAL" && withSelfDrive) {
    const indiv = customer as IndividualCustomer;
    if (!indiv.drivingInfo?.licenseNumber) {
      return {
        canReserve: false,
        reason: "Customer memilih Self-Drive tetapi data SIM belum terisi.",
      };
    }
    const isLicenseVerified =
      indiv.drivingInfo.verificationStatus === "VERIFIED";
    if (!isLicenseVerified) {
      return {
        canReserve: false,
        reason:
          "SIM Customer belum berstatus VERIFIED. Tidak dapat menyewa tanpa driver.",
      };
    }
    // Check expiry
    if (indiv.drivingInfo.licenseExpiry) {
      const expiry = new Date(indiv.drivingInfo.licenseExpiry);
      if (expiry < new Date()) {
        return {
          canReserve: false,
          reason: `Masa berlaku SIM customer telah habis (${indiv.drivingInfo.licenseExpiry}). SIM kedaluwarsa dilarang berkendara.`,
        };
      }
    }
  }

  return { canReserve: true };
}

/**
 * Explanatory UI Blocker for Reservation Approval
 */
export function evaluateReservationApprovalEligibility(
  reservation: ReservationCoreRecord,
  customer?: IndividualCustomer | CorporateCustomer,
  assignedVehicle?: Vehicle,
): ActionBlockerReason {
  const isStatusPending =
    reservation.status === "PENDING_APPROVAL" || reservation.status === "DRAFT";
  const hasVehicle = Boolean(reservation.assignedVehicleId || assignedVehicle);
  const isCustomerVerified =
    customer &&
    (customer.status === "VERIFIED" ||
      customer.status === "APPROVED" ||
      customer.status === "ACTIVE");
  const isDatesValid =
    new Date(reservation.startAt) < new Date(reservation.endAt);

  const checks = [
    {
      key: "status_ready",
      label: "Status Reservasi Siap Diapprove",
      passed: isStatusPending,
      detail: isStatusPending
        ? "Status: Pending Approval"
        : `Status sudah ${reservation.status}`,
    },
    {
      key: "customer_verified",
      label: "Customer Lolos Verifikasi (VERIFIED)",
      passed: Boolean(isCustomerVerified),
      detail: isCustomerVerified
        ? "Customer terverifikasi"
        : `Customer status: ${customer?.status || "Unknown"}`,
    },
    {
      key: "vehicle_allocated",
      label: "Unit Kendaraan Telah Dialokasikan",
      passed: hasVehicle,
      detail: hasVehicle
        ? `Unit ${reservation.assignedVehiclePlate || assignedVehicle?.plateNumber || "Terpilih"}`
        : "Belum memilih unit kendaraan untuk reservasi ini",
    },
    {
      key: "dates_valid",
      label: "Periode Sewa Valid (Start < End)",
      passed: isDatesValid,
      detail: isDatesValid
        ? "Jadwal sewa valid"
        : "Tanggal selesai harus lebih besar dari tanggal mulai",
    },
  ];

  const canPerform = checks.every((c) => c.passed);
  const failedCheck = checks.find((c) => !c.passed);

  return {
    canPerform,
    actionName: "Persetujuan Reservasi (Approve)",
    requiredChecks: checks,
    errorMessage: canPerform
      ? undefined
      : `Tidak dapat menyetujui reservasi: ${failedCheck?.label} (${failedCheck?.detail})`,
  };
}

/**
 * Approve Reservation Action
 */
export async function approveReservationAction(
  reservation: ReservationCoreRecord,
  actorName: string,
  actorId?: string,
): Promise<{
  success: boolean;
  reservation?: ReservationCoreRecord;
  error?: string;
}> {
  if (reservation.status === "APPROVED") {
    return { success: true, reservation };
  }

  const oldStatus = reservation.status;
  reservation.status = "APPROVED";
  reservation.approvedBy = actorName;
  reservation.approvedAt = new Date().toISOString();
  reservation.updatedAt = new Date().toISOString();

  await recordAuditLog({
    actorId,
    actorName,
    entityType: "RESERVATION",
    entityId: reservation.id,
    action: "APPROVE_RESERVATION",
    oldData: { status: oldStatus },
    newData: {
      status: "APPROVED",
      approvedBy: actorName,
      approvedAt: reservation.approvedAt,
    },
    notes: `Reservasi ${reservation.reservationNumber} disetujui oleh ${actorName}`,
  });

  return { success: true, reservation };
}

/**
 * Reject Reservation Action
 */
export async function rejectReservationAction(
  reservation: ReservationCoreRecord,
  reason: string,
  actorName: string,
  actorId?: string,
): Promise<{
  success: boolean;
  reservation?: ReservationCoreRecord;
  error?: string;
}> {
  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: "Alasan penolakan reservasi wajib diisi minimal 5 karakter.",
    };
  }

  const oldStatus = reservation.status;
  reservation.status = "REJECTED";
  reservation.rejectionReason = reason;
  reservation.updatedAt = new Date().toISOString();

  await recordAuditLog({
    actorId,
    actorName,
    entityType: "RESERVATION",
    entityId: reservation.id,
    action: "REJECT_RESERVATION",
    oldData: { status: oldStatus },
    newData: { status: "REJECTED", rejectionReason: reason },
    notes: `Reservasi ${reservation.reservationNumber} ditolak oleh ${actorName}. Alasan: ${reason}`,
  });

  return { success: true, reservation };
}
