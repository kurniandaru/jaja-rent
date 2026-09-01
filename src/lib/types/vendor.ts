export interface VendorPartner {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  taxId?: string;
  status: "ACTIVE" | "INACTIVE";
  totalVehicles: number;
  activeRentedVehicles: number;
  availableVehicles: number;
  maintenanceVehicles: number;
  joinedDate: string;
  vehicles?: VendorVehicle[];
}

export interface VendorVehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  status: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "DOCUMENT_HOLD";
  odometer: number;
  currentCustomerName?: string;
  currentContractNumber?: string;
  locationArea: string;
  monthlyRateB2B?: number;
}
