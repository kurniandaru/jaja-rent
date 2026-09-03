/**
 * ==============================================================================
 * Phase 2: Fleet Operations Domain Types
 * ==============================================================================
 */

import type { ActionBlockerReason } from "./business-core.ts";
import type { OwnershipType, BusinessEligibility } from "./fleet.ts";

/**
 * Operational Status (how the vehicle is currently functioning in fleet)
 */
export type VehicleOperationalStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "ALLOCATED"
  | "RENTED"
  | "RETURNED"
  | "INSPECTION"
  | "MAINTENANCE"
  | "QC"
  | "ACCIDENT"
  | "DOCUMENT_HOLD";

/**
 * Lifecycle Status (asset registry standing)
 */
export type VehicleLifecycleStatus = "ACTIVE" | "INACTIVE" | "SOLD";

/**
 * Allocation Lifecycle
 */
export type AllocationStatus =
  | "PENDING"
  | "ALLOCATED"
  | "RELEASED"
  | "CANCELLED";

export interface VehicleAllocationRecord {
  id: string; // e.g. "ALC-10001"
  allocationNumber: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel?: string;
  reservationId?: string;
  reservationNumber?: string;
  rentalId?: string;
  startAt: string; // ISO date or "YYYY-MM-DD"
  endAt: string;
  status: AllocationStatus;
  allocatedBy: string;
  allocatedAt: string;
  releasedAt?: string;
  notes?: string;
}

/**
 * Physical Handover Before Rental Activation
 */
export interface VehicleHandoverRecord {
  id: string; // e.g. "HND-10001"
  rentalId: string;
  vehicleId: string;
  vehiclePlate: string;
  handoverAt: string;
  handoverLocation: string;
  startingOdometer: number;
  startingFuelPercent: number;
  performedBy: string;
  customerAcknowledgedAt?: string;
  signatureUrl?: string;
  notes?: string;
}

/**
 * 10 Vehicle Condition Areas
 */
export type VehicleConditionArea =
  | "BODY"
  | "GLASS"
  | "LIGHTS"
  | "TIRES"
  | "ENGINE"
  | "INTERIOR"
  | "ELECTRICAL"
  | "AC"
  | "SAFETY"
  | "OTHER";

/**
 * Severity
 */
export type ConditionSeverity = "NORMAL" | "MINOR" | "MAJOR" | "CRITICAL";

/**
 * Damage Status
 */
export type DamageStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "CHARGED"
  | "REPAIRED"
  | "WAIVED"
  | "CLOSED";

export interface VehicleDamageRecord {
  id: string; // e.g. "DMG-1001"
  damageNumber: string;
  vehicleId: string;
  vehiclePlate?: string;
  rentalId?: string;
  inspectionId?: string;
  area: VehicleConditionArea;
  description: string;
  severity: ConditionSeverity;
  estimatedCost: number;
  actualCost: number;
  status: DamageStatus;
  reportedAt: string;
  resolvedAt?: string;
  isPreExisting?: boolean;
  notes?: string;
}

/**
 * Detailed Condition Item in Inspections
 */
export interface InspectionConditionItem {
  id: string;
  area: VehicleConditionArea;
  componentName: string;
  conditionDescription: string;
  severity: ConditionSeverity;
  isNormal: boolean;
  notes?: string;
  photos?: string[];
}

/**
 * Before vs After Comparison Item
 */
export interface BeforeAfterComparisonItem {
  area: VehicleConditionArea;
  componentName: string;
  beforeCondition: string;
  beforeSeverity: ConditionSeverity;
  afterCondition: string;
  afterSeverity: ConditionSeverity;
  deltaStatus:
    | "NO_CHANGE"
    | "NEW_DAMAGE"
    | "WORSENED_CONDITION"
    | "MISSING_ITEM";
  estimatedDamageCost: number;
  description: string;
}

/**
 * Full Before vs After Inspection Summary
 */
export interface BeforeAfterComparisonSummary {
  preRentalInspectionId: string;
  returnInspectionId: string;
  vehicleId: string;
  vehiclePlate: string;
  totalItemsCompared: number;
  newDamagesCount: number;
  worsenedCount: number;
  missingItemsCount: number;
  totalEstimatedDamageCost: number;
  requiresMaintenance: boolean;
  maintenanceReason?: string;
  items: BeforeAfterComparisonItem[];
}

/**
 * Maintenance Itemized Checklists & Parts
 */
export type MaintenanceChecklistCategory =
  | "ENGINE"
  | "OIL"
  | "BRAKE"
  | "TIRE"
  | "BATTERY"
  | "AC"
  | "LIGHT"
  | "SUSPENSION"
  | "TRANSMISSION"
  | "BODY"
  | "OTHER";

export interface MaintenanceItemizedRecord {
  id: string;
  category: MaintenanceChecklistCategory;
  itemName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
  status: "OK" | "REPLACED" | "REPAIRED" | "ATTENTION_NEEDED";
  notes?: string;
}

export type MaintenanceOperationalStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "WAITING_PARTS"
  | "COMPLETED"
  | "QC_PENDING"
  | "CANCELLED";

export interface MaintenanceQCRecord {
  id: string;
  maintenanceId: string;
  vehicleId: string;
  checkedBy: string;
  checkedAt: string;
  result: "PASS" | "FAIL";
  notes: string;
  reworkRequired?: boolean;
}

/**
 * Document Compliance & Expiry
 */
export type VehicleDocType =
  | "STNK"
  | "BPKB"
  | "KIR"
  | "INSURANCE"
  | "REGISTRATION"
  | "GPS_DOCUMENT"
  | "OTHER";

export type DocumentExpiryAlertStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED";

export interface VehicleDocumentWithAlert {
  id: string;
  vehicleId: string;
  documentType: VehicleDocType;
  documentNumber: string;
  issuedDate: string;
  issueDate?: string;
  expiryDate: string;
  daysUntilExpiry: number;
  alertStatus: DocumentExpiryAlertStatus;
  filePath?: string;
  costToRenew?: number;
  notes?: string;
}

/**
 * GPS Telematics Health
 */
export type GPSTelematicsStatus = "ONLINE" | "OFFLINE" | "IDLE";

export interface GPSTelematicsInfo {
  vehicleId: string;
  plateNumber: string;
  status: GPSTelematicsStatus;
  currentLocation: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: string;
  odometer: number;
  ignition: boolean;
  lastSeen: string; // e.g. "Just now" or ISO date
  batteryLevel: number;
  isOfflineWarning: boolean;
}

/**
 * Vehicle Timeline Feed
 */
export interface VehicleTimelineEvent {
  id: string;
  vehicleId: string;
  timestamp: string;
  title: string;
  eventType:
    | "PURCHASE"
    | "REGISTRATION"
    | "GPS_INSTALL"
    | "RESERVATION"
    | "ALLOCATION"
    | "PRE_INSPECTION"
    | "HANDOVER"
    | "RENTAL_START"
    | "RENTAL_RETURN"
    | "RETURN_INSPECTION"
    | "DAMAGE_RECORDED"
    | "MAINTENANCE_SCHEDULED"
    | "MAINTENANCE_COMPLETED"
    | "QC_PASS"
    | "QC_FAIL"
    | "DOCUMENT_RENEWAL"
    | "STATUS_CHANGE";
  description: string;
  actor: string;
  odometer?: number;
  referenceId?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

/**
 * Matching & Availability Request Types
 */
export interface VehicleMatchingRequirement {
  vehicleType?: string; // e.g. "MPV", "SUV"
  transmission?: "Automatic" | "Manual" | "ANY";
  minSeats?: number;
  fuelType?: string;
  rentalType: "B2C" | "B2B";
  withDriver?: boolean;
}

export interface VehicleAvailabilityResult {
  isAvailable: boolean;
  vehicleId: string;
  plateNumber: string;
  operationalStatus: VehicleOperationalStatus;
  lifecycleStatus: VehicleLifecycleStatus;
  blockerReasons: ActionBlockerReason[];
  conflictingAllocation?: VehicleAllocationRecord;
  conflictingRentalId?: string;
  conflictingMaintenanceId?: string;
  hasDocumentIssue: boolean;
}
