import { mockReservations } from "@/lib/mock-data/reservations";
import {
  ReservationRecord,
  RentalType,
  ReservationStatus,
} from "@/lib/types/rental";
import { VendorQuotation } from "@/lib/types/sourcing";
import { recordAuditLog } from "@/lib/services/audit-service";

let cachedReservations: ReservationRecord[] = [...mockReservations];

function initLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("jaja_reservations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0)
          cachedReservations = parsed;
      }
    } catch (e) {
      console.warn("Error loading reservations from localStorage", e);
    }
  }
}

function persistLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "jaja_reservations",
        JSON.stringify(cachedReservations),
      );
    } catch (e) {
      console.warn(e);
    }
  }
}

export async function getReservations(
  type?: RentalType,
): Promise<ReservationRecord[]> {
  initLocalStorage();
  if (type) {
    return cachedReservations.filter((r) => r.type === type);
  }
  return cachedReservations;
}

export async function getReservationById(
  id: string,
): Promise<ReservationRecord | null> {
  initLocalStorage();
  return (
    cachedReservations.find((r) => r.id.toLowerCase() === id.toLowerCase()) ||
    null
  );
}

export async function saveReservation(
  record: ReservationRecord,
): Promise<{ success: boolean; data: ReservationRecord }> {
  initLocalStorage();
  const existingIdx = cachedReservations.findIndex((r) => r.id === record.id);

  if (existingIdx >= 0) {
    cachedReservations[existingIdx] = {
      ...record,
      updatedAt: new Date().toISOString().split("T")[0],
    };
  } else {
    cachedReservations = [record, ...cachedReservations];
    await recordAuditLog({
      actorName: "Customer / Sales",
      entityType: "RESERVATION",
      entityId: record.id,
      action: "RESERVATION_CREATED",
      newData: {
        id: record.id,
        customerName: record.customerName,
        status: record.status,
      },
      notes: `Reservasi baru dibuat untuk ${record.customerName}`,
    });
  }

  persistLocalStorage();
  return { success: true, data: record };
}

export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus,
): Promise<{ success: boolean }> {
  initLocalStorage();
  const res = cachedReservations.find((r) => r.id === reservationId);
  if (!res) return { success: false };

  const oldStatus = res.status;
  res.status = status;
  res.updatedAt = new Date().toISOString().split("T")[0];
  persistLocalStorage();

  await recordAuditLog({
    actorName: "Operations Manager",
    entityType: "RESERVATION",
    entityId: reservationId,
    action:
      status === "CONFIRMED" || status === "APPROVED"
        ? "RESERVATION_APPROVED"
        : `RESERVATION_STATUS_${status}`,
    oldData: { status: oldStatus },
    newData: { status },
    notes: `Status reservasi diubah dari ${oldStatus} menjadi ${status}`,
  });

  return { success: true };
}

export async function addVendorQuotation(
  reservationId: string,
  quotation: Omit<VendorQuotation, "id" | "reservationId" | "submittedDate">,
): Promise<{ success: boolean; data?: VendorQuotation }> {
  initLocalStorage();
  const res = cachedReservations.find((r) => r.id === reservationId);
  if (!res) return { success: false };

  const newQuote: VendorQuotation = {
    ...quotation,
    id: `VQ-${Date.now().toString().slice(-4)}`,
    reservationId,
    submittedDate: new Date().toISOString().split("T")[0],
  };

  res.vendorQuotations = [...(res.vendorQuotations || []), newQuote];
  res.status = "PROCESSING";
  res.updatedAt = new Date().toISOString().split("T")[0];

  persistLocalStorage();
  return { success: true, data: newQuote };
}

export async function updateQuotationStatus(
  reservationId: string,
  quotationId: string,
  status: "ACCEPTED" | "REJECTED" | "NEGOTIATING",
): Promise<{ success: boolean }> {
  initLocalStorage();
  const res = cachedReservations.find((r) => r.id === reservationId);
  if (!res || !res.vendorQuotations) return { success: false };

  const q = res.vendorQuotations.find((item) => item.id === quotationId);
  if (!q) return { success: false };

  q.status = status;
  res.updatedAt = new Date().toISOString().split("T")[0];

  persistLocalStorage();
  return { success: true };
}
