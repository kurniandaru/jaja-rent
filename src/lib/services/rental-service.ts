import type {
  RentalContractRecord,
  RentalChargeItem,
  RentalChargeType,
  RentalPaymentRecord,
  RentalDepositRecord,
  SettlementSummary,
  ReturnInspectionComparison,
  ActionBlockerReason,
} from "../types/business-core.ts";
import type { RentalRecord } from "../types/rental.ts";
import { recordAuditLog } from "./audit-service.ts";

let contractSeq = 100;
export function generateContractNumber(): string {
  const num = String(contractSeq++).padStart(6, "0");
  return `RNT-${num}`;
}

let paymentSeq = 100;
export function generatePaymentNumber(): string {
  const num = String(paymentSeq++).padStart(6, "0");
  return `PAY-${num}`;
}

let depositSeq = 100;
export function generateDepositId(): string {
  const num = String(depositSeq++).padStart(6, "0");
  return `DEP-${num}`;
}

/**
 * Calculate total rental cost strictly from charges array
 */
export function calculateTotalCharges(charges: RentalChargeItem[]): number {
  return charges.reduce((sum, item) => sum + item.amount, 0);
}

/**
 * Explanatory UI Blocker for Rental Activation
 */
export function evaluateRentalActivationEligibility(
  rental: RentalRecord,
  contract?: RentalContractRecord,
  deposit?: RentalDepositRecord,
): ActionBlockerReason {
  const hasVehicle = Boolean(rental.vehicleId && rental.vehiclePlate);
  const isContractSigned =
    contract?.status === "SIGNED" || contract?.status === "ACTIVE";
  const hasDeposit = deposit ? deposit.amount > 0 : true; // In some models deposit is mandatory
  const isStatusValid =
    rental.status === "RESERVED" ||
    rental.status === "READY_FOR_DELIVERY" ||
    rental.status === "HANDOVER";

  const checks = [
    {
      key: "vehicle_ready",
      label: "Unit Kendaraan Siap & Terpasang",
      passed: hasVehicle,
      detail: hasVehicle
        ? `Unit ${rental.vehiclePlate} (${rental.vehicleModel})`
        : "Unit kendaraan belum terisi",
    },
    {
      key: "contract_signed",
      label: "Kontrak Sewa Ditandatangani (SIGNED)",
      passed: Boolean(isContractSigned),
      detail: isContractSigned
        ? "Kontrak telah ditandatangani"
        : `Status kontrak: ${contract?.status || "Belum ada"}`,
    },
    {
      key: "deposit_received",
      label: "Uang Jaminan / Deposit Diterima",
      passed: hasDeposit,
      detail: deposit
        ? `Deposit Rp ${deposit.amount.toLocaleString("id-ID")}`
        : "Deposit tercatat",
    },
    {
      key: "lifecycle_step",
      label: "Status Siap Diaktifkan",
      passed: isStatusValid,
      detail: isStatusValid
        ? `Status ${rental.status}`
        : `Status ${rental.status} tidak dapat diaktifkan`,
    },
  ];

  const canPerform = checks.every((c) => c.passed);
  const failedCheck = checks.find((c) => !c.passed);

  return {
    canPerform,
    actionName: "Aktivasi Rental Berjalan (Activate Rental)",
    requiredChecks: checks,
    errorMessage: canPerform
      ? undefined
      : `Rental tidak dapat diaktifkan: ${failedCheck?.label} (${failedCheck?.detail})`,
  };
}

/**
 * Activate Rental Lifecycle
 */
export async function activateRentalAction(
  rental: RentalRecord,
  contract: RentalContractRecord | undefined,
  actorName: string,
  actorId?: string,
): Promise<{ success: boolean; rental?: RentalRecord; error?: string }> {
  const blocker = evaluateRentalActivationEligibility(rental, contract);
  if (!blocker.canPerform) {
    return { success: false, error: blocker.errorMessage };
  }

  const oldStatus = rental.status;
  rental.status = "ACTIVE";
  rental.updatedAt = new Date().toISOString();

  if (contract) {
    contract.status = "ACTIVE";
    contract.updatedAt = new Date().toISOString();
  }

  await recordAuditLog({
    actorId,
    actorName,
    entityType: "RENTAL",
    entityId: rental.id,
    action: "ACTIVATE_RENTAL",
    oldData: { status: oldStatus },
    newData: { status: "ACTIVE", activatedAt: new Date().toISOString() },
    notes: `Rental ${rental.id} (${rental.vehiclePlate}) telah resmi DIAKTIFKAN oleh ${actorName}`,
  });

  return { success: true, rental };
}

/**
 * Return & Settlement Calculator
 */
export function calculateSettlementSummary(
  rental: RentalRecord,
  charges: RentalChargeItem[],
  payments: RentalPaymentRecord[],
  deposit: RentalDepositRecord | undefined,
  inspectionComparison?: ReturnInspectionComparison,
): SettlementSummary {
  let baseCharges = 0;
  let driverCharges = 0;
  let insuranceCharges = 0;
  let deliveryCharges = 0;
  let damageCharges = 0;
  let overtimeCharges = 0;
  let fuelCharges = 0;
  let discounts = 0;

  for (const c of charges) {
    switch (c.chargeType) {
      case "RENTAL":
        baseCharges += c.amount;
        break;
      case "DRIVER":
        driverCharges += c.amount;
        break;
      case "INSURANCE":
        insuranceCharges += c.amount;
        break;
      case "DELIVERY":
        deliveryCharges += c.amount;
        break;
      case "DAMAGE":
        damageCharges += c.amount;
        break;
      case "EXTRA_TIME":
        overtimeCharges += c.amount;
        break;
      case "FUEL":
        fuelCharges += c.amount;
        break;
      case "DISCOUNT":
        discounts += Math.abs(c.amount);
        break;
      default:
        baseCharges += c.amount;
    }
  }

  // Include pending charges from return inspection comparison if not already in charges list
  if (inspectionComparison) {
    if (inspectionComparison.recommendedDamageFee > 0 && damageCharges === 0) {
      damageCharges = inspectionComparison.recommendedDamageFee;
    }
    if (
      inspectionComparison.recommendedOvertimeFee > 0 &&
      overtimeCharges === 0
    ) {
      overtimeCharges = inspectionComparison.recommendedOvertimeFee;
    }
  }

  const totalFinalCharges =
    baseCharges +
    driverCharges +
    insuranceCharges +
    deliveryCharges +
    damageCharges +
    overtimeCharges +
    fuelCharges -
    discounts;

  const totalPaidPayments = payments
    .filter((p) => p.paymentStatus === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const depositHeld = deposit ? deposit.amount : 0;

  // Deduct from deposit for any damage or overtime not covered by existing payments
  const unpaidCharges = Math.max(0, totalFinalCharges - totalPaidPayments);
  const depositDeducted = Math.min(depositHeld, unpaidCharges);
  const depositReturned = Math.max(0, depositHeld - depositDeducted);

  const finalSettlementBalance =
    totalFinalCharges - totalPaidPayments - depositDeducted;

  return {
    rentalId: rental.id,
    rentalNumber: rental.id,
    customerName: rental.customerName,
    vehiclePlate: rental.vehiclePlate,
    baseRentalCharges: baseCharges,
    driverCharges,
    insuranceCharges,
    deliveryCharges,
    damageCharges,
    overtimeCharges,
    fuelDifferenceCharges: fuelCharges,
    discounts,
    totalFinalCharges,
    totalPaidPayments,
    depositHeld,
    depositDeducted,
    depositReturned,
    finalSettlementBalance,
    status:
      finalSettlementBalance === 0
        ? "SETTLED"
        : finalSettlementBalance > 0
          ? "PENDING_PAYMENT"
          : "REFUND_DUE",
    settledAt: new Date().toISOString(),
  };
}

/**
 * Complete Rental Lifecycle after final settlement
 */
export async function completeRentalAction(
  rental: RentalRecord,
  contract: RentalContractRecord | undefined,
  settlement: SettlementSummary,
  deposit: RentalDepositRecord | undefined,
  actorName: string,
  actorId?: string,
): Promise<{ success: boolean; rental?: RentalRecord; error?: string }> {
  const oldStatus = rental.status;
  rental.status = "COMPLETED";
  rental.updatedAt = new Date().toISOString();

  if (contract) {
    contract.status = "COMPLETED";
    contract.updatedAt = new Date().toISOString();
  }

  if (deposit) {
    deposit.deductionAmount = settlement.depositDeducted;
    deposit.returnedAmount = settlement.depositReturned;
    deposit.status =
      settlement.depositReturned > 0
        ? settlement.depositDeducted > 0
          ? "PARTIALLY_RETURNED"
          : "RETURNED"
        : "FORFEITED";
    deposit.returnedAt = new Date().toISOString();
  }

  await recordAuditLog({
    actorId,
    actorName,
    entityType: "SETTLEMENT",
    entityId: rental.id,
    action: "COMPLETE_RENTAL_SETTLEMENT",
    oldData: { status: oldStatus },
    newData: {
      status: "COMPLETED",
      totalFinalCharges: settlement.totalFinalCharges,
      depositDeducted: settlement.depositDeducted,
      depositReturned: settlement.depositReturned,
    },
    notes: `Rental ${rental.id} selesai diselesaikan (Settled & Completed). Deposit kembali: Rp ${settlement.depositReturned.toLocaleString("id-ID")}`,
  });

  return { success: true, rental };
}
