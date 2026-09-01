export type RentalType = "B2C" | "B2B";

export type RentalStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "UPCOMING"
  | "CANCELLED"
  | "OVERDUE";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "AVAILABLE" | "ASSIGNED" | "OFF_DUTY";
}

export interface RentalRecord {
  id: string; // e.g. "RNT-B2C-2026-089" or "RNT-B2B-2026-044"
  type: RentalType;
  vehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  corporateContractId?: string;
  withDriver: boolean;
  driverId?: string;
  driverName?: string;
  startDate: string;
  endDate: string;
  actualReturnDate?: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalAmount: number;
  depositAmount?: number;
  status: RentalStatus;
  notes?: string;
}

export interface ReservationRecord {
  id: string;
  type: RentalType;
  vehicleType: string;
  assignedVehicleId?: string;
  customerName: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  withDriver: boolean;
  status: "CONFIRMED" | "PENDING_VEHICLE" | "READY_FOR_PICKUP" | "CANCELLED";
  createdAt: string;
}
