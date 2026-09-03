// ==============================================================================
// RBAC Domain Types (Phase 3: Enterprise Control)
// Enterprise Roles, Granular Permissions, and Authorization Context
// ==============================================================================

export type EnterpriseRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "OPERATIONS"
  | "FINANCE"
  | "WORKSHOP"
  | "MANAGEMENT"
  | "CUSTOMER_SERVICE"
  | "FLEET_MANAGER";

export type PermissionKey =
  // Customer permissions
  | "customer.view"
  | "customer.view_sensitive"
  | "customer.create"
  | "customer.update"
  | "customer.verify"
  | "customer.suspend"
  | "customer.blacklist"
  // Reservation permissions
  | "reservation.view"
  | "reservation.create"
  | "reservation.approve"
  | "reservation.reject"
  | "reservation.cancel"
  // Rental lifecycle permissions
  | "rental.view"
  | "rental.create"
  | "rental.activate"
  | "rental.return"
  | "rental.settle"
  | "rental.complete"
  // Fleet permissions
  | "fleet.view"
  | "fleet.create"
  | "fleet.update"
  | "fleet.allocate"
  | "fleet.release"
  | "fleet.handover"
  // Inspection permissions
  | "inspection.view"
  | "inspection.create"
  | "inspection.complete"
  // Damage ledger permissions
  | "damage.view"
  | "damage.create"
  | "damage.approve"
  | "damage.waive"
  // Maintenance & QC permissions
  | "maintenance.view"
  | "maintenance.create"
  | "maintenance.complete"
  | "maintenance.qc"
  // Financial & payment permissions
  | "payment.view"
  | "payment.view_sensitive"
  | "payment.create"
  | "payment.refund"
  // Reporting permissions
  | "report.view"
  | "report.export"
  // Audit & Observability permissions
  | "audit.view"
  | "audit.view_sensitive"
  // System configuration & Integrations
  | "config.view"
  | "config.update"
  | "integration.view"
  | "webhook.process";

export interface AuthenticatedUserContext {
  id: string;
  name: string;
  email: string;
  role: EnterpriseRole;
  customPermissions?: PermissionKey[];
  branchLocation?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PermissionDefinition {
  id: PermissionKey;
  name: string;
  module: string;
  description: string;
}
