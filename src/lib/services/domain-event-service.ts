// ==============================================================================
// Domain Event Service (Phase 3: Business Event Architecture)
// Unified Event Pipeline: Business Action -> Domain Event -> Audit + Notif + Integration
// ==============================================================================

import type { DomainEvent, DomainEventName } from "../types/domain-events.ts";
import { recordAuditLog } from "./audit-service.ts";
import { createNotification, sendEmail } from "./notification-service.ts";

let eventSequence = 1;
function generateEventId(): string {
  return `EVT-${Date.now()}-${String(eventSequence++).padStart(4, "0")}`;
}

/**
 * Global In-Memory Domain Event Store
 */
export const emittedDomainEvents: DomainEvent[] = [];

/**
 * Emit a Domain Event across the enterprise ecosystem
 */
export async function emitDomainEvent<T = any>(
  eventInput: Omit<DomainEvent<T>, "id" | "timestamp">,
): Promise<DomainEvent<T>> {
  const event: DomainEvent<T> = {
    ...eventInput,
    id: generateEventId(),
    timestamp: new Date().toISOString(),
  };

  // 1. Record in event stream
  emittedDomainEvents.unshift(event);

  // 2. DISPATCH TO AUDIT LOG (Section 8)
  try {
    await recordAuditLog({
      actorId: event.actorId,
      actorName: event.actorName,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.name.toUpperCase().replace(/\./g, "_"),
      oldData: event.oldData,
      newData: event.payload,
      notes: `Dispatched via Domain Event: ${event.name}`,
    });
  } catch (err) {
    console.warn("Audit dispatch error:", err);
  }

  // 3. DISPATCH TO NOTIFICATION SERVICE (Section 14)
  try {
    await dispatchEventToNotification(event);
  } catch (err) {
    console.warn("Notification dispatch error:", err);
  }

  return event;
}

/**
 * Intelligent event-to-notification mapper
 */
async function dispatchEventToNotification(event: DomainEvent): Promise<void> {
  switch (event.name) {
    case "reservation.approved":
      await createNotification({
        recipientId: event.payload?.customerId || "CUSTOMER",
        type: "RESERVATION_APPROVED",
        severity: "INFO",
        title: "Reservasi Disetujui",
        message: `Reservasi Anda #${event.entityId} telah disetujui. Siap lanjut ke kontrak & serah terima.`,
        entityType: "RESERVATION",
        entityId: event.entityId,
        eventKey: `RESERVATION_APPROVED:${event.entityId}`,
        actionUrl: `/reservations/${event.entityId}`,
      });
      // Email customer
      if (event.payload?.customerEmail) {
        await sendEmail({
          to: event.payload.customerEmail,
          subject: `Reservasi Disetujui: ${event.entityId}`,
          template: "RESERVATION_APPROVED",
          data: event.payload,
        });
      }
      break;

    case "reservation.rejected":
      await createNotification({
        recipientId: event.payload?.customerId || "CUSTOMER",
        type: "RESERVATION_REJECTED",
        severity: "WARNING",
        title: "Reservasi Ditolak",
        message: `Reservasi #${event.entityId} belum dapat disetujui. Alasan: ${event.payload?.reason || "Dokumen belum memenuhi syarat"}`,
        entityType: "RESERVATION",
        entityId: event.entityId,
        eventKey: `RESERVATION_REJECTED:${event.entityId}`,
        actionUrl: `/reservations/${event.entityId}`,
      });
      break;

    case "vehicle.allocated":
      await createNotification({
        recipientId: "OPERATIONS",
        type: "VEHICLE_ALLOCATED",
        severity: "INFO",
        title: "Kendaraan Telah Dialokasikan",
        message: `Unit ${event.payload?.vehiclePlate || event.entityId} telah dialokasikan untuk reservasi #${event.payload?.reservationId}.`,
        entityType: "VEHICLE",
        entityId: event.entityId,
        eventKey: `VEHICLE_ALLOCATED:${event.entityId}:${event.payload?.reservationId}`,
        actionUrl: `/fleet/${event.entityId}`,
      });
      break;

    case "rental.activated":
      await createNotification({
        recipientId: "OPERATIONS",
        type: "RENTAL_ACTIVATED",
        severity: "INFO",
        title: "Rental Aktif",
        message: `Sewa #${event.entityId} telah resmi aktif setelah serah terima unit berhasil.`,
        entityType: "RENTAL",
        entityId: event.entityId,
        eventKey: `RENTAL_ACTIVATED:${event.entityId}`,
        actionUrl: `/rentals/${event.entityId}`,
      });
      break;

    case "maintenance.created":
      await createNotification({
        recipientId: "WORKSHOP",
        type: "WORKSHOP_MAINTENANCE_NOTICE",
        severity: "WARNING",
        title: "Pekerjaan Servis Kendaraan Baru",
        message: `Unit ${event.payload?.vehiclePlate || event.entityId} masuk jadwal perbaikan di ${event.payload?.workshopName || "Bengkel"}.`,
        entityType: "MAINTENANCE",
        entityId: event.entityId,
        eventKey: `MAINTENANCE_CREATED:${event.entityId}`,
        actionUrl: `/operations/maintenance`,
      });
      break;

    case "payment.created":
    case "payment.completed":
      await createNotification({
        recipientId: "FINANCE",
        type: "PAYMENT_RECEIVED",
        severity: "INFO",
        title: "Pembayaran Diterima",
        message: `Pembayaran ${event.payload?.amount ? "Rp " + event.payload.amount.toLocaleString("id-ID") : ""} untuk rental #${event.payload?.rentalId || event.entityId} telah tercatat.`,
        entityType: "PAYMENT",
        entityId: event.entityId,
        eventKey: `PAYMENT_RECORDED:${event.entityId}`,
        actionUrl: `/operations/rentals/${event.payload?.rentalId}`,
      });
      break;

    default:
      break;
  }
}
