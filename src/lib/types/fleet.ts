export type OwnershipType = "JAJA_OWNED" | "VENDOR_OWNED";

export type BusinessEligibility = "B2C" | "B2B" | "BOTH";

export type VehicleStatus =
  | "AVAILABLE"
  | "RENTED"
  | "RESERVED"
  | "MAINTENANCE"
  | "INSPECTION"
  | "DOCUMENT_HOLD"
  | "INACTIVE";

export type VehicleLifecycleStage =
  | "ONBOARDING"
  | "DOCUMENT_CHECK"
  | "INSPECTION"
  | "AVAILABLE"
  | "RESERVED"
  | "RENTED"
  | "RETURNING"
  | "MAINTENANCE"
  | "PROBLEM";

export interface Vehicle {
  id: string; // e.g. "B-1234-XYZ"
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  transmission: "Automatic" | "Manual";
  fuelType: "Bensin" | "Diesel" | "Hybrid" | "Electric";
  seatCapacity: number;
  vin: string;
  engineNumber: string;
  odometer: number;
  ownership: OwnershipType;
  vendorName?: string; // If VENDOR_OWNED
  businessEligibility: BusinessEligibility;
  status: VehicleStatus;
  lifecycleStage: VehicleLifecycleStage;
  currentRentalId?: string;
  currentCustomerId?: string;
  currentCustomerName?: string;
  currentRentalType?: "B2C" | "B2B";
  currentDriverName?: string;
  currentContractId?: string;
  locationCity: string;
  locationArea: string;
  gpsStatus: "ONLINE" | "OFFLINE" | "IDLE";
  lastGpsUpdate: string;
  latitude: number;
  longitude: number;
  speed: number;
  documentStatus: "OK" | "EXPIRING_SOON" | "EXPIRED";
  maintenanceStatus: "OK" | "DUE" | "OVERDUE" | "IN_PROGRESS";
  nextServiceOdometer: number;
  dailyRateB2C?: number;
  monthlyRateB2B?: number;
  isReplacementUnit?: boolean;
  replacingVehicleId?: string;
}
