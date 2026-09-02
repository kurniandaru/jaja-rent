import { mockRentals } from "@/lib/mock-data/rentals";
import { RentalRecord, RentalType, RentalStatus, VehicleHandover } from "@/lib/types/rental";

let cachedRentals: RentalRecord[] = [...mockRentals];

function initLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("jaja_rentals");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) cachedRentals = parsed;
      }
    } catch (e) {
      console.warn("Error loading rentals from localStorage", e);
    }
  }
}

function persistLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("jaja_rentals", JSON.stringify(cachedRentals));
    } catch (e) {
      console.warn(e);
    }
  }
}

export async function getRentals(type?: RentalType): Promise<RentalRecord[]> {
  initLocalStorage();
  if (type) {
    return cachedRentals.filter((r) => r.type === type);
  }
  return cachedRentals;
}

export async function getActiveRentals(): Promise<RentalRecord[]> {
  initLocalStorage();
  return cachedRentals.filter((r) => r.status === "ACTIVE");
}

export async function getRentalById(id: string): Promise<RentalRecord | null> {
  initLocalStorage();
  return cachedRentals.find((r) => r.id.toLowerCase() === id.toLowerCase()) || null;
}

export async function saveRental(
  record: RentalRecord
): Promise<{ success: boolean; data: RentalRecord }> {
  initLocalStorage();
  const existingIdx = cachedRentals.findIndex((r) => r.id === record.id);

  if (existingIdx >= 0) {
    cachedRentals[existingIdx] = {
      ...record,
      updatedAt: new Date().toISOString().split("T")[0],
    };
  } else {
    cachedRentals = [record, ...cachedRentals];
  }

  persistLocalStorage();
  return { success: true, data: record };
}

export async function updateRentalStatus(
  rentalId: string,
  status: RentalStatus
): Promise<{ success: boolean }> {
  initLocalStorage();
  const rental = cachedRentals.find((r) => r.id === rentalId);
  if (!rental) return { success: false };

  rental.status = status;
  rental.updatedAt = new Date().toISOString().split("T")[0];
  persistLocalStorage();
  return { success: true };
}

/**
 * Confirm Vehicle Handover with Bukti Serah Terima Document & Photos.
 * IMPORTANT BUSINESS RULE: This is what triggers status to become ACTIVE.
 */
export async function confirmVehicleHandover(
  rentalId: string,
  handoverData: Partial<VehicleHandover>
): Promise<{ success: boolean; data?: RentalRecord }> {
  initLocalStorage();
  const rental = cachedRentals.find((r) => r.id === rentalId);
  if (!rental) return { success: false };

  rental.handover = {
    ...rental.handover,
    ...handoverData,
    isHandedOver: true,
    confirmedAt: new Date().toISOString(),
  };

  // Status transitions to ACTIVE immediately upon confirmed handover!
  rental.status = "ACTIVE";
  rental.updatedAt = new Date().toISOString().split("T")[0];

  persistLocalStorage();
  return { success: true, data: rental };
}

/**
 * Return Rental and transition to COMPLETED
 */
export async function returnRental(
  rentalId: string,
  actualReturnDate: string,
  notes?: string
): Promise<{ success: boolean; data?: RentalRecord }> {
  initLocalStorage();
  const rental = cachedRentals.find((r) => r.id === rentalId);
  if (!rental) return { success: false };

  rental.status = "COMPLETED";
  rental.actualReturnDate = actualReturnDate;
  if (notes) {
    rental.notes = `${rental.notes ? rental.notes + " | " : ""}Return note: ${notes}`;
  }
  rental.updatedAt = new Date().toISOString().split("T")[0];

  persistLocalStorage();
  return { success: true, data: rental };
}
