// ==============================================================================
// Business Core Domain Types (Phase 1)
// Jaja Rent Business Lifecycle & Enterprise State Machines
// ==============================================================================

export type CustomerLifecycleStatus =
  | "DRAFT"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED"
  | "BLACKLISTED"
  // Backward compatibility mappings
  | "SUBMITTED"
  | "DOCUMENT_REVIEW"
  | "NEED_REVISION"
  | "APPROVED"
  | "ACTIVE";

export type CustomerDocumentType = "KTP" | "SIM" | "PASSPORT" | "OTHER";

export type CustomerDocumentStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";

export interface CustomerDocumentRecord {
  id: string; // e.g. "DOC-KTP-001"
  customerId: string;
  documentType: CustomerDocumentType;
  documentNumber: string;
  filePath: string;
  fileName?: string;
  fileSizeBytes?: number;
  status: CustomerDocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type AgreementType = "RENTAL_TERMS" | "PRIVACY_POLICY" | "LIABILITY";

export type AgreementStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface CustomerAgreementRecord {
  id: string; // e.g. "AGR-2026-001"
  customerId: string;
  agreementType: AgreementType;
  version: string; // e.g. "v1.0", "v1.1"
  status: AgreementStatus;
  acceptedAt?: string;
  acceptedBy?: string; // Admin UUID or Customer PIC
  ipAddress?: string;
  createdAt: string;
}

export type ReservationLifecycleStatus =
  | "DRAFT"
  | "PENDING_CUSTOMER_VERIFICATION"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "EXPIRED"
  | "CONVERTED"
  // Backward compatibility mappings
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING";

export interface ReservationCoreRecord {
  id: string; // e.g. "RES-000001"
  reservationNumber: string; // "RES-000001"
  customerId: string;
  customerName: string;
  customerNumber: string;
  customerPhone: string;
  customerStatus: CustomerLifecycleStatus;
  rentalType: "B2C" | "B2B";
  vehicleClass?: string;
  assignedVehicleId?: string;
  assignedVehiclePlate?: string;
  assignedVehicleModel?: string;
  pickupLocation: string;
  dropoffLocation: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  status: ReservationLifecycleStatus;
  withDriver: boolean;
  assignedDriverId?: string;
  assignedDriverName?: string;
  notes?: string;
  createdBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  contractId?: string;
  rentalId?: string;
  createdAt: string;
  updatedAt: string;
}

export type RentalContractStatus =
  | "DRAFT"
  | "PENDING_SIGNATURE"
  | "SIGNED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export interface RentalContractRecord {
  id: string; // e.g. "CTR-000001"
  contractNumber: string; // "RNT-000001" or "CTR-000001"
  reservationId: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  rentalId?: string;
  startAt: string;
  endAt: string;
  status: RentalContractStatus;
  termsVersion: string; // e.g. "v1.0"
  signedAt?: string;
  signedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type RentalChargeType =
  | "RENTAL"
  | "DRIVER"
  | "DELIVERY"
  | "INSURANCE"
  | "EXTRA_TIME"
  | "FUEL"
  | "DAMAGE"
  | "OTHER"
  | "DISCOUNT";

export interface RentalChargeItem {
  id: string; // e.g. "CHG-001"
  rentalId: string;
  chargeType: RentalChargeType;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number; // quantity * unitPrice (negative for discount)
  createdAt: string;
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface RentalPaymentRecord {
  id: string; // e.g. "PAY-000001"
  rentalId: string;
  paymentNumber: string; // "PAY-000001"
  amount: number;
  paymentMethod: "BANK_TRANSFER" | "CREDIT_CARD" | "VA" | "CASH" | "QRIS";
  paymentStatus: PaymentStatus;
  paidAt?: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export type DepositStatus =
  | "HELD"
  | "PARTIALLY_RETURNED"
  | "RETURNED"
  | "FORFEITED";

export interface RentalDepositRecord {
  id: string; // e.g. "DEP-000001"
  rentalId: string;
  amount: number;
  status: DepositStatus;
  receivedAt: string;
  returnedAt?: string;
  returnedAmount: number;
  deductionAmount: number;
  deductionReason?: string;
  createdAt: string;
}

export type RentalLifecycleStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "ACTIVE"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "SETTLEMENT"
  | "COMPLETED"
  | "CANCELLED";

export interface ReturnInspectionComparison {
  inspectionId: string;
  returnOdometer: number;
  startingOdometer: number;
  distanceDrivenKm: number;
  returnFuelPercent: number;
  startingFuelPercent: number;
  newDamageFound: boolean;
  damageDescriptions?: string[];
  recommendedDamageFee: number;
  actualReturnTime: string;
  scheduledReturnTime: string;
  isOverdue: boolean;
  overdueHours: number;
  recommendedOvertimeFee: number;
}

export interface SettlementSummary {
  rentalId: string;
  rentalNumber: string;
  customerName: string;
  vehiclePlate: string;
  baseRentalCharges: number;
  driverCharges: number;
  insuranceCharges: number;
  deliveryCharges: number;
  damageCharges: number;
  overtimeCharges: number;
  fuelDifferenceCharges: number;
  discounts: number;
  totalFinalCharges: number;
  totalPaidPayments: number;
  depositHeld: number;
  depositDeducted: number;
  depositReturned: number;
  finalSettlementBalance: number; // totalFinalCharges - totalPaidPayments - depositDeducted
  status: "SETTLED" | "PENDING_PAYMENT" | "REFUND_DUE";
  settledAt?: string;
  settledBy?: string;
}

export interface AuditLogEntry {
  id: string; // e.g. "AUD-000001"
  actorId?: string;
  actorName: string;
  entityType:
    | "CUSTOMER"
    | "DOCUMENT"
    | "AGREEMENT"
    | "RESERVATION"
    | "ALLOCATION"
    | "CONTRACT"
    | "RENTAL"
    | "PAYMENT"
    | "SETTLEMENT"
    | "VEHICLE"
    | "MAINTENANCE"
    | "INSPECTION"
    | "DAMAGE";
  entityId: string;
  action: string;
  oldData?: any;
  newData?: any;
  notes?: string;
  createdAt: string;
}

export interface ActionBlockerReason {
  canPerform?: boolean;
  actionName?: string;
  requiredChecks?: {
    key?: string;
    label: string;
    passed: boolean;
    detail?: string;
  }[];
  errorMessage?: string;
  label?: string;
  passed?: boolean;
  detail?: string;
}
