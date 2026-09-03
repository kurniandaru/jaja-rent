// ==============================================================================
// Notification Types (Phase 3: Centralized Notification Architecture)
// Multi-Channel Notifications, Idempotency, and Delivery Queue
// ==============================================================================

export type NotificationSeverity = "CRITICAL" | "WARNING" | "INFO";

export type NotificationType =
  // Reservation
  | "RESERVATION_SUBMITTED"
  | "RESERVATION_APPROVED"
  | "RESERVATION_REJECTED"
  | "RESERVATION_CANCELLED"
  // Rental
  | "RENTAL_STARTING_SOON"
  | "RENTAL_ACTIVATED"
  | "RENTAL_RETURN_REMINDER"
  | "RENTAL_OVERDUE"
  // Vehicle & Fleet
  | "VEHICLE_ALLOCATED"
  | "VEHICLE_INSPECTION_REQUIRED"
  | "VEHICLE_MAINTENANCE_REQUIRED"
  | "VEHICLE_MAINTENANCE_OVERDUE"
  | "GPS_OFFLINE_WARNING"
  // Documents
  | "VEHICLE_DOCUMENT_EXPIRING"
  | "VEHICLE_DOCUMENT_EXPIRED"
  | "CUSTOMER_DOCUMENT_EXPIRING"
  | "CUSTOMER_DOCUMENT_REJECTED"
  // Payment
  | "PAYMENT_RECEIVED"
  | "PAYMENT_FAILED"
  | "DEPOSIT_SETTLEMENT_REQUIRED"
  // General / Operations
  | "WORKSHOP_MAINTENANCE_NOTICE"
  | "OPERATIONAL_ALERT"
  | "CRITICAL_ALERT"
  | "OPERATIONAL_WARNING";

export type NotificationStatus = "UNREAD" | "READ";

export type NotificationChannel = "IN_APP" | "EMAIL" | "TELEGRAM" | "WHATSAPP";

export interface NotificationRecord {
  id: string;
  recipientId: string; // User ID, Role name (e.g. 'OPERATIONS', 'FINANCE', 'WORKSHOP') or 'ALL'
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  status: NotificationStatus;
  eventKey?: string; // Idempotency key for deduplication
  actionUrl?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationDeliveryRecord {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: "PENDING" | "SENT" | "FAILED";
  attemptCount: number;
  errorMessage?: string;
  sentAt?: string;
  createdAt: string;
}

export interface NotificationRuleThresholds {
  rentalReturnReminderHours: number; // default: 24
  documentExpiryWarningDays: number; // default: 30
  maintenanceWarningDays: number; // default: 7
  gpsOfflineMinutes: number; // default: 30
}
