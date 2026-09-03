import type { OwnershipType } from "./fleet";
import type { VendorQuotation, NegotiationTerms } from "./sourcing";

export type RentalType = "B2C" | "B2B";

export type ReservationStatus =
  | "DRAFT"
  | "PENDING_CUSTOMER_VERIFICATION"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "CONVERTED"
  | "CANCELLED"
  | "EXPIRED";

export type RentalStatus =
  | "RESERVED"
  | "READY_FOR_DELIVERY"
  | "DELIVERY"
  | "HANDOVER"
  | "ACTIVE"
  | "RETURN"
  | "RETURNING"
  | "SETTLEMENT"
  | "COMPLETED"
  | "UPCOMING"
  | "CANCELLED"
  | "OVERDUE";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "AVAILABLE" | "ASSIGNED" | "OFF_DUTY";
}

export interface B2CRequirement {
  vehicleId?: string;
  vehicleModel: string;
  plateNumber?: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  pickupLocation: string;
  dropoffLocation: string;
  withDriver: boolean;
  driverOption?: "SELF_DRIVE" | "WITH_JAJA_DRIVER" | "JAJA_DRIVER";
  dailyRate?: number;
  estimatedTotal: number;
  specialRequests?: string;
  additionalServices?: string[];
}

export interface B2BRequirement {
  vehicleType: string;
  quantity: number;
  startDate: string;
  durationMonths: number;
  cityLocation: string;
  withDriver?: boolean;
  driverRequired?: boolean;
  replacementRequired?: boolean;
  withMaintenance?: boolean;
  maintenanceIncluded?: boolean;
  withInsurance?: boolean;
  insuranceIncluded?: boolean;
  targetBudgetPerUnitMonthly?: number;
  notes?: string;
}

export interface ReservationRecord {
  id: string; // e.g. "RSV-2026-B2C-001" or "RSV-2026-B2B-001"
  type: RentalType;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerType: "INDIVIDUAL" | "CORPORATE";
  status: ReservationStatus;
  b2cRequirement?: B2CRequirement;
  b2bRequirement?: B2BRequirement;
  vendorQuotations?: VendorQuotation[];
  negotiationTerms?: NegotiationTerms;
  contractId?: string;
  rentalId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DeliveryInfo {
  scheduledDate: string;
  scheduledTime?: string;
  deliveryLocation: string;
  deliveredBy?: string;
  recipientName: string;
  recipientPhone: string;
  status: "SCHEDULED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
  actualDeliveredAt?: string;
  notes?: string;
}

export interface VehicleHandover {
  isHandedOver: boolean;
  handoverDate?: string;
  handoverTime?: string;
  location?: string;
  handedBy?: string;
  receivedBy?: string;
  receivedByPhone?: string;
  odometerAtHandover?: number;
  fuelLevelPercent?: number;
  documentName?: string;
  documentUrl?: string;
  photos?: string[];
  notes?: string;
  confirmedAt?: string;
}

export interface PreRentalInspectionSummary {
  inspectionId?: string;
  inspectionDate?: string;
  inspectorName?: string;
  grade?: "A" | "B" | "C" | "D";
  status?: "PASSED" | "PASSED_WITH_CONDITIONS" | "FAILED";
  issuesCount?: number;
  summaryNotes?: string;
}

export interface RentalRecord {
  id: string; // e.g. "RNT-B2C-2026-001" or "RNT-B2B-2026-001"
  type: RentalType;
  reservationId?: string;
  contractId?: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerType: "INDIVIDUAL" | "CORPORATE";

  // Vehicle Info
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleOwnership: OwnershipType;
  vendorId?: string;
  vendorName?: string;

  // Driver
  withDriver: boolean;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;

  // Dates & Schedule
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  durationText?: string;

  // Locations
  pickupLocation: string;
  dropoffLocation: string;

  // Financials
  ratePerPeriod: number;
  totalAmount: number;
  depositAmount?: number;
  paymentStatus: "PENDING" | "PAID" | "PARTIAL" | "INVOICED" | "REFUNDED";

  // Operational Process & Lifecycle
  status: RentalStatus;
  delivery?: DeliveryInfo;
  handover?: VehicleHandover;
  inspection?: PreRentalInspectionSummary;

  notes?: string;
  createdAt: string;
  updatedAt?: string;
}
