// ==============================================================================
// Domain Event Types (Phase 3: Business Event Architecture)
// Standard Business Events for Audit, Notification, and Integration Bus
// ==============================================================================

export type DomainEventName =
  // Customer
  | "customer.created"
  | "customer.updated"
  | "customer.verified"
  | "customer.suspended"
  | "customer.blacklisted"
  // Document
  | "document.uploaded"
  | "document.verified"
  | "document.rejected"
  | "document.expiring"
  // Agreement
  | "agreement.accepted"
  // Reservation
  | "reservation.created"
  | "reservation.submitted"
  | "reservation.approved"
  | "reservation.rejected"
  | "reservation.cancelled"
  | "reservation.converted"
  // Vehicle & Fleet
  | "vehicle.allocated"
  | "vehicle.handed_over"
  | "vehicle.returned"
  | "vehicle.inspection_completed"
  // Rental Lifecycle
  | "rental.activated"
  | "rental.returned"
  | "rental.settled"
  | "rental.completed"
  // Damage
  | "damage.created"
  | "damage.approved"
  | "damage.waived"
  // Maintenance
  | "maintenance.created"
  | "maintenance.completed"
  | "maintenance.qc_passed"
  | "maintenance.qc_failed"
  // Payment
  | "payment.created"
  | "payment.completed"
  | "payment.failed"
  // Alerts & Telematics (Phase 4)
  | "alert.critical_created"
  | "alert.warning_created"
  | "alert.info_created"
  | "alert.resolved";

export interface DomainEvent<T = any> {
  id: string;
  name: DomainEventName;
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
  actorId?: string;
  actorName: string;
  payload: T;
  oldData?: any;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}
