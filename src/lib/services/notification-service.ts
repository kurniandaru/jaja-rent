// ==============================================================================
// Notification Service (Phase 3: Centralized Notification Architecture)
// Event-Driven, Deduplication Key, Multi-Channel Adapter, and In-App State
// ==============================================================================

import type {
  NotificationRecord,
  NotificationType,
  NotificationSeverity,
  NotificationDeliveryRecord,
  NotificationRuleThresholds,
} from "../types/notification.ts";
import { getSupabaseBrowserClient } from "../supabase/client.ts";

// Configurable operational thresholds (Section 15)
export const DEFAULT_THRESHOLDS: NotificationRuleThresholds = {
  rentalReturnReminderHours: 24,
  documentExpiryWarningDays: 30,
  maintenanceWarningDays: 7,
  gpsOfflineMinutes: 30,
};

let currentThresholds: NotificationRuleThresholds = { ...DEFAULT_THRESHOLDS };

export function getNotificationThresholds(): NotificationRuleThresholds {
  return { ...currentThresholds };
}

export function updateNotificationThresholds(
  updated: Partial<NotificationRuleThresholds>,
): NotificationRuleThresholds {
  currentThresholds = { ...currentThresholds, ...updated };
  return { ...currentThresholds };
}

// In-Memory Notification Store (for instant reactivity & test runner)
const inMemoryNotifications: NotificationRecord[] = [
  {
    id: "NOTIF-001",
    recipientId: "ALL",
    type: "RENTAL_RETURN_REMINDER",
    severity: "WARNING",
    title: "Pengembalian Unit Rental Mendekati Batas Waktu",
    message:
      "Rental RNT-B2C-2026-002 (Toyota Veloz) dijadwalkan kembali hari ini pukul 14:00 WIB.",
    entityType: "RENTAL",
    entityId: "RNT-B2C-2026-002",
    status: "UNREAD",
    eventKey: "RENTAL_RETURN_REMINDER:RNT-B2C-2026-002:2026-09-03",
    actionUrl: "/operations/rentals/RNT-B2C-2026-002",
    createdAt: "2026-09-03T07:00:00Z",
  },
  {
    id: "NOTIF-002",
    recipientId: "OPERATIONS",
    type: "VEHICLE_DOCUMENT_EXPIRING",
    severity: "CRITICAL",
    title: "STNK Kendaraan Segera Kedaluwarsa (<= 30 Hari)",
    message:
      "STNK unit Toyota Fortuner 2.8 VRZ (B 9988 JKL) berakhir pada 28 September 2026 (25 hari lagi).",
    entityType: "VEHICLE",
    entityId: "VEH-003",
    status: "UNREAD",
    eventKey: "VEHICLE_DOC_EXPIRING:VEH-003:STNK:30D",
    actionUrl: "/fleet/VEH-003",
    createdAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "NOTIF-003",
    recipientId: "WORKSHOP",
    type: "VEHICLE_MAINTENANCE_REQUIRED",
    severity: "WARNING",
    title: "Jadwal Servis Berkala Armada",
    message:
      "Unit Mitsubishi Pajero Sport (B 7711 GHY) telah mencapai batas servis 85.000 KM.",
    entityType: "VEHICLE",
    entityId: "VEH-005",
    status: "UNREAD",
    eventKey: "VEHICLE_MAINTENANCE_DUE:VEH-005:85000",
    actionUrl: "/fleet/VEH-005",
    createdAt: "2026-09-02T08:30:00Z",
  },
  {
    id: "NOTIF-004",
    recipientId: "FINANCE",
    type: "PAYMENT_RECEIVED",
    severity: "INFO",
    title: "Pembayaran Rental Diterima",
    message:
      "Pembayaran Rp 4.750.000 untuk reservasi RES-2026-001 telah berhasil diverifikasi.",
    entityType: "PAYMENT",
    entityId: "PAY-2026-001",
    status: "READ",
    eventKey: "PAYMENT_RECEIVED:PAY-2026-001",
    actionUrl: "/operations/rentals",
    readAt: "2026-09-02T15:00:00Z",
    createdAt: "2026-09-02T14:30:00Z",
  },
];

let notifSeq = 100;
function generateNotificationId(): string {
  return `NOTIF-${++notifSeq}`;
}

/**
 * Create a new notification with strict deduplication using eventKey (Section 20)
 */
export async function createNotification(params: {
  recipientId: string;
  type: NotificationType;
  severity?: NotificationSeverity;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  eventKey?: string;
  actionUrl?: string;
}): Promise<{
  success: boolean;
  notification?: NotificationRecord;
  duplicateIgnored?: boolean;
}> {
  // 1. Deduplication Gate: Check if notification with eventKey already exists
  if (params.eventKey) {
    const existing = inMemoryNotifications.find(
      (n) => n.eventKey === params.eventKey,
    );
    if (existing) {
      return { success: true, notification: existing, duplicateIgnored: true };
    }
  }

  const id = generateNotificationId();
  const createdAt = new Date().toISOString();

  const newNotif: NotificationRecord = {
    id,
    recipientId: params.recipientId,
    type: params.type,
    severity: params.severity || "INFO",
    title: params.title,
    message: params.message,
    entityType: params.entityType,
    entityId: params.entityId,
    status: "UNREAD",
    eventKey: params.eventKey,
    actionUrl: params.actionUrl,
    createdAt,
  };

  // Add to memory
  inMemoryNotifications.unshift(newNotif);

  // Persist to Supabase if available
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await (supabase as any).from("notifications").insert({
        id: newNotif.id,
        recipient_id: newNotif.recipientId,
        type: newNotif.type,
        severity: newNotif.severity,
        title: newNotif.title,
        message: newNotif.message,
        entity_type: newNotif.entityType,
        entity_id: newNotif.entityId,
        status: newNotif.status,
        event_key: newNotif.eventKey,
        action_url: newNotif.actionUrl,
      });
    } catch (err) {
      console.warn("Could not persist notification to Supabase:", err);
    }
  }

  return { success: true, notification: newNotif };
}

/**
 * Get all notifications, optionally filtered by recipient or status
 */
export async function getNotifications(options?: {
  recipientId?: string;
  status?: "UNREAD" | "READ" | "ALL";
}): Promise<NotificationRecord[]> {
  let list = [...inMemoryNotifications];

  if (options?.recipientId && options.recipientId !== "ALL") {
    const targetRecipient = options.recipientId.toLowerCase();
    list = list.filter(
      (n) =>
        n.recipientId === "ALL" ||
        n.recipientId.toLowerCase() === targetRecipient,
    );
  }

  if (options?.status && options.status !== "ALL") {
    list = list.filter((n) => n.status === options.status);
  }

  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Get count of unread notifications
 */
export async function getUnreadNotificationCount(
  recipientId?: string,
): Promise<number> {
  const unread = await getNotifications({ recipientId, status: "UNREAD" });
  return unread.length;
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(id: string): Promise<boolean> {
  const notif = inMemoryNotifications.find((n) => n.id === id);
  if (notif) {
    notif.status = "READ";
    notif.readAt = new Date().toISOString();
    return true;
  }
  return false;
}

/**
 * Mark all notifications as read for a recipient
 */
export async function markAllNotificationsAsRead(
  recipientId?: string,
): Promise<number> {
  let count = 0;
  const now = new Date().toISOString();
  for (const notif of inMemoryNotifications) {
    if (
      (!recipientId ||
        notif.recipientId === "ALL" ||
        notif.recipientId === recipientId) &&
      notif.status === "UNREAD"
    ) {
      notif.status = "READ";
      notif.readAt = now;
      count++;
    }
  }
  return count;
}

/**
 * Email Channel Adapter Abstraction (Section 17)
 */
export interface EmailPayload {
  to: string;
  subject: string;
  template:
    | "RESERVATION_APPROVED"
    | "RESERVATION_REJECTED"
    | "RENTAL_CONFIRMATION"
    | "RENTAL_RETURN_REMINDER"
    | "PAYMENT_CONFIRMATION"
    | "DOCUMENT_EXPIRY";
  data: Record<string, any>;
}

export const sentEmailAuditLog: EmailPayload[] = [];

export async function sendEmail(
  payload: EmailPayload,
): Promise<{ success: boolean; messageId: string }> {
  // In production, delegate to SendGrid/Resend/Postmark provider adapter
  sentEmailAuditLog.push(payload);
  const messageId = `MSG-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return { success: true, messageId };
}
