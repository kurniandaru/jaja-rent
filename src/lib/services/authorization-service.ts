// ==============================================================================
// Authorization & RBAC Service (Phase 3: Enterprise Control)
// Centralized, Server-Side Role-Based Access Control & Permission Verification
// ==============================================================================

import type {
  EnterpriseRole,
  PermissionKey,
  AuthenticatedUserContext,
} from "../types/rbac.ts";

/**
 * Standard Role-to-Permissions Matrix
 */
const ROLE_PERMISSIONS: Record<EnterpriseRole, PermissionKey[]> = {
  SUPER_ADMIN: [
    "customer.view",
    "customer.view_sensitive",
    "customer.create",
    "customer.update",
    "customer.verify",
    "customer.suspend",
    "customer.blacklist",
    "reservation.view",
    "reservation.create",
    "reservation.approve",
    "reservation.reject",
    "reservation.cancel",
    "rental.view",
    "rental.create",
    "rental.activate",
    "rental.return",
    "rental.settle",
    "rental.complete",
    "fleet.view",
    "fleet.create",
    "fleet.update",
    "fleet.allocate",
    "fleet.release",
    "fleet.handover",
    "inspection.view",
    "inspection.create",
    "inspection.complete",
    "damage.view",
    "damage.create",
    "damage.approve",
    "damage.waive",
    "maintenance.view",
    "maintenance.create",
    "maintenance.complete",
    "maintenance.qc",
    "payment.view",
    "payment.view_sensitive",
    "payment.create",
    "payment.refund",
    "report.view",
    "report.export",
    "audit.view",
    "audit.view_sensitive",
    "config.view",
    "config.update",
    "integration.view",
    "webhook.process",
  ],
  ADMIN: [
    "customer.view",
    "customer.view_sensitive",
    "customer.create",
    "customer.update",
    "customer.verify",
    "customer.suspend",
    "customer.blacklist",
    "reservation.view",
    "reservation.create",
    "reservation.approve",
    "reservation.reject",
    "reservation.cancel",
    "rental.view",
    "rental.create",
    "rental.activate",
    "rental.return",
    "rental.settle",
    "rental.complete",
    "fleet.view",
    "fleet.create",
    "fleet.update",
    "fleet.allocate",
    "fleet.release",
    "fleet.handover",
    "inspection.view",
    "inspection.create",
    "inspection.complete",
    "damage.view",
    "damage.create",
    "damage.approve",
    "damage.waive",
    "maintenance.view",
    "maintenance.create",
    "maintenance.complete",
    "maintenance.qc",
    "payment.view",
    "payment.view_sensitive",
    "payment.create",
    "payment.refund",
    "report.view",
    "report.export",
    "audit.view",
    "audit.view_sensitive",
    "config.view",
    "config.update",
    "integration.view",
    "webhook.process",
  ],
  OPERATIONS: [
    "customer.view",
    "customer.create",
    "customer.update",
    "customer.verify",
    "customer.suspend",
    "reservation.view",
    "reservation.create",
    "reservation.approve",
    "reservation.reject",
    "reservation.cancel",
    "rental.view",
    "rental.create",
    "rental.activate",
    "rental.return",
    "fleet.view",
    "fleet.update",
    "fleet.allocate",
    "fleet.release",
    "fleet.handover",
    "inspection.view",
    "inspection.create",
    "inspection.complete",
    "damage.view",
    "damage.create",
    "maintenance.view",
    "payment.view",
    "report.view",
    "audit.view",
    "config.view",
  ],
  FINANCE: [
    "customer.view",
    "reservation.view",
    "rental.view",
    "rental.settle",
    "rental.complete",
    "damage.view",
    "damage.approve",
    "damage.waive",
    "payment.view",
    "payment.view_sensitive",
    "payment.create",
    "payment.refund",
    "report.view",
    "report.export",
    "audit.view",
  ],
  WORKSHOP: [
    "fleet.view",
    "inspection.view",
    "inspection.create",
    "inspection.complete",
    "damage.view",
    "damage.create",
    "maintenance.view",
    "maintenance.create",
    "maintenance.complete",
    "maintenance.qc",
    "audit.view",
  ],
  MANAGEMENT: [
    // Read-only governance role
    "customer.view",
    "reservation.view",
    "rental.view",
    "fleet.view",
    "inspection.view",
    "damage.view",
    "maintenance.view",
    "payment.view",
    "report.view",
    "report.export",
    "audit.view",
    "config.view",
    "integration.view",
  ],
  CUSTOMER_SERVICE: [
    "customer.view",
    "customer.create",
    "customer.update",
    "reservation.view",
    "reservation.create",
    "rental.view",
    "fleet.view",
  ],
  FLEET_MANAGER: [
    "fleet.view",
    "fleet.create",
    "fleet.update",
    "fleet.allocate",
    "fleet.release",
    "fleet.handover",
    "inspection.view",
    "inspection.create",
    "inspection.complete",
    "damage.view",
    "damage.create",
    "damage.approve",
    "maintenance.view",
    "maintenance.create",
    "maintenance.complete",
    "maintenance.qc",
    "report.view",
    "audit.view",
  ],
};

/**
 * Get all permissions granted to a specific role
 */
export function getPermissionsForRole(role: EnterpriseRole): PermissionKey[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Centralized authorization evaluation: can(user, permission)
 */
export function can(
  user: AuthenticatedUserContext | null | undefined,
  permission: PermissionKey,
): boolean {
  if (!user || !user.role) {
    return false;
  }

  // 1. Role level check
  const rolePerms = ROLE_PERMISSIONS[user.role] || [];
  if (rolePerms.includes(permission)) {
    return true;
  }

  // 2. Custom direct user grants (if any)
  if (user.customPermissions && user.customPermissions.includes(permission)) {
    return true;
  }

  return false;
}

/**
 * Enforce authorization in server actions/services.
 * Throws an explicit business error if user is unauthorized.
 */
export function assertCan(
  user: AuthenticatedUserContext | null | undefined,
  permission: PermissionKey,
  contextMessage?: string,
): void {
  if (!can(user, permission)) {
    const roleName = user?.role || "ANONYMOUS";
    const detail = contextMessage ? ` (${contextMessage})` : "";
    const err = new Error(
      `AKSES DITOLAK: Role '${roleName}' tidak memiliki izin '${permission}'${detail}. Hubungi Administrator.`,
    );
    (err as any).code = "UNAUTHORIZED";
    (err as any).statusCode = 403;
    throw err;
  }
}
