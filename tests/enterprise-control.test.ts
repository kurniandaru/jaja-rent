// ==============================================================================
// tests/enterprise-control.test.ts
// Phase 3: Enterprise Control, Notification, and Integration Test Suite
// Covers RBAC, Masking, Audit, Notifications, Deduplication, Webhooks, and Section 44 UAC
// ==============================================================================

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  can,
  assertCan,
  getPermissionsForRole,
} from "../src/lib/services/authorization-service.ts";
import type { AuthenticatedUserContext } from "../src/lib/types/rbac.ts";

import {
  maskIdentityNumber,
  maskPhoneNumber,
  maskFinancialNumber,
  maskSensitiveObject,
  validateFileUpload,
} from "../src/lib/services/security-service.ts";

import {
  recordAuditLog,
  queryAuditLogs,
} from "../src/lib/services/audit-service.ts";

import {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendEmail,
  sentEmailAuditLog,
} from "../src/lib/services/notification-service.ts";

import {
  checkExpiringDocuments,
  checkOverdueRentals,
  checkMaintenanceDue,
  checkGpsOffline,
  runAllScheduledJobs,
} from "../src/lib/services/background-jobs-service.ts";

import {
  processInboundWebhook,
  verifyWebhookSignature,
  getIntegrationLogs,
} from "../src/lib/services/integration-service.ts";

import {
  calculateFleetUtilization,
  calculateVehicleContributionList,
  exportOperationalDataToCSV,
} from "../src/lib/services/reporting-service.ts";

import { emitDomainEvent } from "../src/lib/services/domain-event-service.ts";
import { getVehicleFullTimeline } from "../src/lib/services/vehicle-timeline-service.ts";

describe("Phase 3: Enterprise Control, Notification & Integration", () => {
  // Test Users for different enterprise roles
  const adminUser: AuthenticatedUserContext = {
    id: "USR-001",
    name: "Admin Budi",
    email: "admin@jaja.id",
    role: "ADMIN",
  };

  const opsUser: AuthenticatedUserContext = {
    id: "USR-002",
    name: "Ops Hendra",
    email: "ops@jaja.id",
    role: "OPERATIONS",
  };

  const financeUser: AuthenticatedUserContext = {
    id: "USR-003",
    name: "Finance Maya",
    email: "finance@jaja.id",
    role: "FINANCE",
  };

  const workshopUser: AuthenticatedUserContext = {
    id: "USR-004",
    name: "Mechanic Joko",
    email: "workshop@jaja.id",
    role: "WORKSHOP",
  };

  const managementUser: AuthenticatedUserContext = {
    id: "USR-005",
    name: "Director Hartono",
    email: "management@jaja.id",
    role: "MANAGEMENT",
  };

  // ----------------------------------------------------------------------------
  // 1. RBAC & Granular Authorization
  // ----------------------------------------------------------------------------
  describe("1. RBAC & Granular Authorization", () => {
    test("ADMIN has full permissions across all modules", () => {
      assert.equal(can(adminUser, "customer.verify"), true);
      assert.equal(can(adminUser, "reservation.approve"), true);
      assert.equal(can(adminUser, "fleet.allocate"), true);
      assert.equal(can(adminUser, "payment.refund"), true);
      assert.equal(can(adminUser, "maintenance.qc"), true);
      assert.equal(can(adminUser, "config.update"), true);
    });

    test("OPERATIONS can manage fleet and reservations, but cannot issue financial refunds", () => {
      assert.equal(can(opsUser, "reservation.approve"), true);
      assert.equal(can(opsUser, "fleet.allocate"), true);
      assert.equal(can(opsUser, "fleet.handover"), true);
      assert.equal(can(opsUser, "rental.activate"), true);
      // Denied
      assert.equal(can(opsUser, "payment.refund"), false);
      assert.equal(can(opsUser, "config.update"), false);
    });

    test("FINANCE can manage payments and refunds, but cannot allocate vehicles or approve reservations", () => {
      assert.equal(can(financeUser, "payment.create"), true);
      assert.equal(can(financeUser, "payment.refund"), true);
      assert.equal(can(financeUser, "rental.settle"), true);
      // Denied
      assert.equal(can(financeUser, "fleet.allocate"), false);
      assert.equal(can(financeUser, "reservation.approve"), false);
      assert.equal(can(financeUser, "maintenance.create"), false);
    });

    test("WORKSHOP can perform maintenance and QC, but cannot view customer KYC or accept payments", () => {
      assert.equal(can(workshopUser, "maintenance.create"), true);
      assert.equal(can(workshopUser, "maintenance.complete"), true);
      assert.equal(can(workshopUser, "maintenance.qc"), true);
      // Denied
      assert.equal(can(workshopUser, "customer.verify"), false);
      assert.equal(can(workshopUser, "payment.create"), false);
    });

    test("MANAGEMENT is strictly read-only and cannot mutate entities", () => {
      assert.equal(can(managementUser, "report.view"), true);
      assert.equal(can(managementUser, "report.export"), true);
      assert.equal(can(managementUser, "audit.view"), true);
      assert.equal(can(managementUser, "fleet.view"), true);
      // Mutations must be strictly blocked
      assert.equal(can(managementUser, "reservation.approve"), false);
      assert.equal(can(managementUser, "fleet.allocate"), false);
      assert.equal(can(managementUser, "payment.create"), false);
      assert.equal(can(managementUser, "customer.create"), false);
    });

    test("assertCan() throws 403 UNAUTHORIZED error when unauthorized", () => {
      assert.throws(
        () => {
          assertCan(managementUser, "fleet.allocate", "Alokasi armada B2C");
        },
        (err: any) => {
          return err.code === "UNAUTHORIZED" && err.statusCode === 403;
        },
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 2. Sensitive Data Protection & Masking
  // ----------------------------------------------------------------------------
  describe("2. Sensitive Data Protection & Masking", () => {
    test("Masks NIK and Phone number cleanly", () => {
      const maskedNik = maskIdentityNumber("3275012345670001");
      assert.equal(maskedNik, "3275********0001");

      const maskedPhone = maskPhoneNumber("081234567890");
      assert.equal(maskedPhone, "0812****7890");

      const maskedCard = maskFinancialNumber("1234567890123456");
      assert.equal(maskedCard, "************3456");
    });

    test("maskSensitiveObject masks PII for unprivileged viewers and preserves for privileged", () => {
      const sensitiveRecord = {
        id: "CUST-001",
        name: "Hendrawan Putra",
        nik: "3275012345670001",
        phone: "081234567890",
        accountNumber: "1234567890",
      };

      // Unprivileged (Ops does not have customer.view_sensitive by default)
      const masked = maskSensitiveObject(sensitiveRecord, opsUser);
      assert.equal(masked.nik, "3275********0001");
      assert.equal(masked.phone, "0812****7890");

      // Privileged (Admin has customer.view_sensitive)
      const raw = maskSensitiveObject(sensitiveRecord, adminUser);
      assert.equal(raw.nik, "3275012345670001");
      assert.equal(raw.phone, "081234567890");
    });

    test("File upload validator enforces allowed MIME types and size limits", () => {
      // Valid PDF
      const validDoc = validateFileUpload({
        name: "ktp_hendrawan.pdf",
        sizeBytes: 1.5 * 1024 * 1024,
        mimeType: "application/pdf",
      });
      assert.equal(validDoc.isValid, true);
      assert.equal(validDoc.safeFilename, "ktp_hendrawan.pdf");

      // Invalid MIME (Executable)
      const invalidMime = validateFileUpload({
        name: "exploit.exe",
        sizeBytes: 50000,
        mimeType: "application/x-msdownload",
      });
      assert.equal(invalidMime.isValid, false);
      assert.match(invalidMime.error!, /tidak diizinkan/);

      // Oversized (> 5MB)
      const oversized = validateFileUpload({
        name: "inspection_video.mp4",
        sizeBytes: 8 * 1024 * 1024,
        mimeType: "image/jpeg",
      });
      assert.equal(oversized.isValid, false);
      assert.match(oversized.error!, /melebihi batas/);
    });
  });

  // ----------------------------------------------------------------------------
  // 3. Audit Logs & Diff Trail
  // ----------------------------------------------------------------------------
  describe("3. Audit Logs & Diff Trail", () => {
    test("Records audit log entry and allows multidimensional query", async () => {
      const entry = await recordAuditLog({
        actorName: "Operations Lead Dimas",
        entityType: "RESERVATION",
        entityId: "RES-TEST-999",
        action: "RESERVATION_APPROVED",
        oldData: { status: "PENDING" },
        newData: { status: "APPROVED" },
        notes: "Approved under standard operational procedure.",
      });

      assert.ok(entry.id);
      assert.equal(entry.entityId, "RES-TEST-999");

      // Query by keyword
      const results = await queryAuditLogs({ search: "RES-TEST-999" });
      assert.ok(results.length >= 1);
      assert.equal(results[0].action, "RESERVATION_APPROVED");
      assert.deepEqual(results[0].oldData, { status: "PENDING" });
      assert.deepEqual(results[0].newData, { status: "APPROVED" });
    });
  });

  // ----------------------------------------------------------------------------
  // 4. Notification Architecture & Deduplication
  // ----------------------------------------------------------------------------
  describe("4. Notification Architecture & Deduplication", () => {
    test("Creates notification with UNREAD state and marks as read", async () => {
      const created = await createNotification({
        recipientId: "FINANCE",
        type: "PAYMENT_RECEIVED",
        severity: "INFO",
        title: "Pembayaran Rental Berhasil",
        message: "Customer telah membayar sewa Rp 3.500.000 via VA.",
        entityId: "PAY-101",
        actionUrl: "/operations/rentals",
      });

      assert.equal(created.success, true);
      const notifId = created.notification!.id;

      // Mark read
      const markSuccess = await markNotificationAsRead(notifId);
      assert.equal(markSuccess, true);

      const list = await getNotifications({ recipientId: "FINANCE" });
      const found = list.find((n) => n.id === notifId);
      assert.equal(found?.status, "READ");
      assert.ok(found?.readAt);
    });

    test("Deduplication Gate: Identical eventKey does not duplicate notifications", async () => {
      const eventKey = "RENTAL_RETURN_REMINDER:RNT-DEDUP-001:2026-09-03";

      // 1st attempt -> Created
      const first = await createNotification({
        recipientId: "OPERATIONS",
        type: "RENTAL_RETURN_REMINDER",
        title: "Pengembalian Unit",
        message: "Unit kembali jam 17:00",
        eventKey,
      });
      assert.equal(first.success, true);
      assert.equal(first.duplicateIgnored, undefined);

      // 2nd attempt -> Duplicate Ignored
      const second = await createNotification({
        recipientId: "OPERATIONS",
        type: "RENTAL_RETURN_REMINDER",
        title: "Pengembalian Unit",
        message: "Unit kembali jam 17:00",
        eventKey,
      });
      assert.equal(second.success, true);
      assert.equal(second.duplicateIgnored, true);
      assert.equal(second.notification?.id, first.notification?.id);
    });

    test("Email channel adapter dispatches email without errors", async () => {
      const emailRes = await sendEmail({
        to: "customer@gmail.com",
        subject: "Reservasi Anda Disetujui",
        template: "RESERVATION_APPROVED",
        data: { reservationNumber: "RES-100" },
      });

      assert.equal(emailRes.success, true);
      assert.ok(emailRes.messageId);
      assert.ok(sentEmailAuditLog.length > 0);
    });
  });

  // ----------------------------------------------------------------------------
  // 5. Scheduled Background Jobs
  // ----------------------------------------------------------------------------
  describe("5. Scheduled Background Jobs", () => {
    test("Runs scheduled checks (Documents, Rentals, Maintenance, GPS) idempotently", async () => {
      const results = await runAllScheduledJobs();
      assert.equal(results.length, 4);

      for (const res of results) {
        assert.ok(res.itemsEvaluated >= 0);
        assert.ok(res.durationMs >= 0);
      }

      // Running a second time should produce zero new duplicates
      const secondRun = await runAllScheduledJobs();
      for (const res of secondRun) {
        assert.equal(res.notificationsCreated, 0); // All deduplicated!
      }
    });
  });

  // ----------------------------------------------------------------------------
  // 6. Integration Layer & Webhook Idempotency
  // ----------------------------------------------------------------------------
  describe("6. Integration Layer & Webhook Idempotency", () => {
    test("Valid webhook succeeds and records integration log", async () => {
      const res = await processInboundWebhook({
        provider: "XENDIT_PAYMENT",
        signature: "VALID_HMAC_SIGNATURE",
        idempotencyKey: "IDEMP-TEST-WEBHOOK-001",
        eventType: "payment.succeeded",
        payload: { transactionId: "TX-9901", amount: 2500000 },
      });

      assert.equal(res.success, true);
      assert.equal(res.statusCode, 200);

      const logs = await getIntegrationLogs();
      const logFound = logs.find((l) => l.id === res.logId);
      assert.equal(logFound?.status, "SUCCESS");
    });

    test("Invalid signature is rejected with HTTP 401", async () => {
      const res = await processInboundWebhook({
        provider: "XENDIT_PAYMENT",
        signature: "INVALID_SIGNATURE",
        idempotencyKey: "IDEMP-TEST-BAD-SIG",
        eventType: "payment.succeeded",
        payload: { amount: 1000000 },
      });

      assert.equal(res.success, false);
      assert.equal(res.statusCode, 401);
    });

    test("Duplicate webhook with identical idempotencyKey returns 200 with isDuplicate: true", async () => {
      const idempotencyKey = "IDEMP-TEST-WEBHOOK-DUPLICATE";

      // 1st request
      const first = await processInboundWebhook({
        provider: "MIDTRANS_PAYMENT",
        signature: "VALID_SIG",
        idempotencyKey,
        eventType: "settlement",
        payload: { orderId: "ORD-1234" },
      });
      assert.equal(first.success, true);
      assert.equal(first.isDuplicate, undefined);

      // 2nd request with same idempotency key
      const second = await processInboundWebhook({
        provider: "MIDTRANS_PAYMENT",
        signature: "VALID_SIG",
        idempotencyKey,
        eventType: "settlement",
        payload: { orderId: "ORD-1234" },
      });
      assert.equal(second.success, true);
      assert.equal(second.isDuplicate, true);
      assert.match(second.message, /idempotent/i);
    });
  });

  // ----------------------------------------------------------------------------
  // 7. Fleet Utilization & Contribution Reporting
  // ----------------------------------------------------------------------------
  describe("7. Fleet Utilization & Contribution Reporting", () => {
    test("Calculates utilization based strictly on rental hours / available fleet hours", async () => {
      const report = await calculateFleetUtilization(30);
      assert.ok(report.totalFleetUnits > 0);
      assert.equal(
        report.availableFleetHours,
        report.totalFleetUnits * 30 * 24,
      );
      assert.ok(
        report.utilizationRatePercent >= 0 &&
          report.utilizationRatePercent <= 100,
      );
    });

    test("Calculates vehicle contribution = revenue - maintenance - damage", async () => {
      const list = await calculateVehicleContributionList();
      assert.ok(list.length > 0);

      const first = list[0];
      assert.equal(
        first.netContribution,
        first.totalRentalRevenue -
          first.totalMaintenanceCost -
          first.totalDamageCost,
      );
    });

    test("Export CSV requires report.export permission", async () => {
      // Allowed for Management
      const exportAllowed = await exportOperationalDataToCSV(
        "CONTRIBUTION",
        managementUser,
      );
      assert.equal(exportAllowed.success, true);
      assert.match(exportAllowed.csvContent, /Plat Nomor/);

      // Blocked for Workshop
      await assert.rejects(
        async () => {
          await exportOperationalDataToCSV("CONTRIBUTION", workshopUser);
        },
        (err: any) => err.code === "UNAUTHORIZED",
      );
    });
  });

  // ----------------------------------------------------------------------------
  // 8. Full 20-Step Acceptance Scenario (Section 44)
  // ----------------------------------------------------------------------------
  describe("8. Full 20-Step Acceptance Scenario (Section 44)", () => {
    test("Executes end-to-end 20-step enterprise control lifecycle without errors", async () => {
      // 1. Operations approves reservation
      const resEvent = await emitDomainEvent({
        name: "reservation.approved",
        entityType: "RESERVATION",
        entityId: "RES-UAC-2026",
        actorId: opsUser.id,
        actorName: opsUser.name,
        payload: {
          customerId: "CUST-001",
          customerEmail: "customer@example.com",
          vehicleCategory: "B2C MPV",
        },
        oldData: { status: "PENDING_APPROVAL" },
      });
      assert.ok(resEvent.id);

      // 2. System records audit
      const auditLogs = await queryAuditLogs({ search: "RES-UAC-2026" });
      assert.ok(auditLogs.length >= 1);
      assert.equal(auditLogs[0].action, "RESERVATION_APPROVED");

      // 3. Customer receives notification
      const custNotifs = await getNotifications({ recipientId: "CUST-001" });
      assert.ok(custNotifs.some((n) => n.entityId === "RES-UAC-2026"));

      // 4. Vehicle allocation is recorded
      const allocEvent = await emitDomainEvent({
        name: "vehicle.allocated",
        entityType: "VEHICLE",
        entityId: "VEH-001",
        actorId: opsUser.id,
        actorName: opsUser.name,
        payload: {
          reservationId: "RES-UAC-2026",
          vehiclePlate: "B 1234 XYZ",
          status: "ALLOCATED",
        },
      });
      assert.ok(allocEvent.id);

      // 5. Audit timeline is updated
      const allocAudit = await queryAuditLogs({ search: "VEH-001" });
      assert.ok(allocAudit.length >= 1);

      // 6. Rental becomes active
      const rentalEvent = await emitDomainEvent({
        name: "rental.activated",
        entityType: "RENTAL",
        entityId: "RNT-UAC-2026",
        actorId: opsUser.id,
        actorName: opsUser.name,
        payload: { status: "ACTIVE", vehicleId: "VEH-001" },
      });
      assert.ok(rentalEvent.id);

      // 7. Payment is recorded
      const payEvent = await emitDomainEvent({
        name: "payment.completed",
        entityType: "PAYMENT",
        entityId: "PAY-UAC-2026",
        actorId: financeUser.id,
        actorName: financeUser.name,
        payload: {
          rentalId: "RNT-UAC-2026",
          amount: 4750000,
          status: "VERIFIED",
        },
      });
      assert.ok(payEvent.id);

      // 8. Finance sees payment
      const finNotifs = await getNotifications({ recipientId: "FINANCE" });
      assert.ok(finNotifs.some((n) => n.entityId === "PAY-UAC-2026"));

      // 9. Rental becomes due
      // 10. System generates return reminder
      const reminderNotif = await createNotification({
        recipientId: "ALL",
        type: "RENTAL_RETURN_REMINDER",
        title: "Return Reminder",
        message: "Unit kembali dalam 24 jam",
        entityType: "RENTAL",
        entityId: "RNT-UAC-2026",
        eventKey: "RENTAL_RETURN_REMINDER:RNT-UAC-2026",
      });
      assert.equal(reminderNotif.success, true);

      // 11. Customer returns vehicle
      const returnEvent = await emitDomainEvent({
        name: "rental.returned",
        entityType: "RENTAL",
        entityId: "RNT-UAC-2026",
        actorId: opsUser.id,
        actorName: opsUser.name,
        payload: { status: "RETURNED", finalOdometer: 15200 },
      });
      assert.ok(returnEvent.id);

      // 12. Inspection detects damage
      // 13. Damage is added to settlement
      const damageEvent = await emitDomainEvent({
        name: "damage.created",
        entityType: "DAMAGE",
        entityId: "DMG-UAC-2026",
        actorId: opsUser.id,
        actorName: opsUser.name,
        payload: {
          area: "BODY",
          estimatedCost: 350000,
          description: "Baret pintu kanan",
        },
      });
      assert.ok(damageEvent.id);

      // 14. Vehicle enters maintenance
      // 15. Workshop receives operational notification
      const maintEvent = await emitDomainEvent({
        name: "maintenance.created",
        entityType: "MAINTENANCE",
        entityId: "MNT-UAC-2026",
        actorId: opsUser.id,
        actorName: opsUser.name,
        payload: { vehiclePlate: "B 1234 XYZ", workshopName: "Auto2000" },
      });
      assert.ok(maintEvent.id);

      const workshopNotifs = await getNotifications({
        recipientId: "WORKSHOP",
      });
      assert.ok(workshopNotifs.some((n) => n.entityId === "MNT-UAC-2026"));

      // 16. Maintenance completed
      const maintDoneEvent = await emitDomainEvent({
        name: "maintenance.completed",
        entityType: "MAINTENANCE",
        entityId: "MNT-UAC-2026",
        actorId: workshopUser.id,
        actorName: workshopUser.name,
        payload: { status: "QC_PENDING" },
      });
      assert.ok(maintDoneEvent.id);

      // 17. QC passed
      // 18. Vehicle becomes available
      const qcPassEvent = await emitDomainEvent({
        name: "maintenance.qc_passed",
        entityType: "MAINTENANCE",
        entityId: "MNT-UAC-2026",
        actorId: opsUser.id,
        actorName: opsUser.name,
        payload: { status: "PASSED", vehicleStatus: "AVAILABLE" },
      });
      assert.ok(qcPassEvent.id);

      // 19. Vehicle timeline contains complete lifecycle
      const timelineLogs = await queryAuditLogs({ search: "VEH-001" });
      assert.ok(timelineLogs.length >= 2);

      // 20. Management dashboard reflects updated metrics
      const utilization = await calculateFleetUtilization(30);
      assert.ok(utilization.availableFleetHours > 0);
      assert.ok(utilization.utilizationRatePercent >= 0);
    });
  });
});
