export type ScheduleEventType =
  | "CONTRACT_EXPIRY"
  | "VEHICLE_PICKUP"
  | "VEHICLE_RETURN"
  | "DOCUMENT_EXPIRY"
  | "MAINTENANCE_DUE"
  | "INSPECTION_SCHEDULED"
  | "OTHER_EVENT";

export type SchedulePriority = "NORMAL" | "HIGH" | "CRITICAL";

export type ScheduleStatus = "UPCOMING" | "TODAY" | "OVERDUE" | "COMPLETED";

export interface ScheduleEvent {
  id: string; // e.g. "SCH-2026-001"
  title: string;
  type: ScheduleEventType;
  date: string; // "YYYY-MM-DD"
  time?: string; // "09:00"
  vehicleId?: string;
  plateNumber?: string;
  vehicleModel?: string;
  customerName?: string;
  customerId?: string;
  vendorName?: string;
  status: ScheduleStatus;
  priority: SchedulePriority;
  description?: string;
  location?: string;
  actionUrl?: string;
  actionLabel?: string;
}

