import { OwnershipType } from "./fleet";

export interface CorporateCustomer {
  id: string;
  name: string; // e.g. "PT ABC Indonesia"
  industry: string;
  address: string;
  city: string;
  picName: string;
  picRole: string;
  picPhone: string;
  picEmail: string;
  npwp?: string;
  billingAddress?: string;
  activeContractsCount: number;
  totalAllocatedVehicles: number;
  operationalVehicles: number;
  maintenanceVehicles: number;
  status: "ACTIVE" | "INACTIVE" | "PROSPECT";
  joinedDate: string;
}

export interface ContractVehicleAllocation {
  id?: string;
  contractId?: string;
  vehicleId: string;
  plateNumber: string;
  model: string;
  ownership: OwnershipType;
  vendorId?: string;
  vendorName?: string;
  assignedDriver?: string;
  driverPhone?: string;
  status: "OPERATIONAL" | "MAINTENANCE" | "REPLACEMENT" | "PENDING_HANDOVER";
  location: string;
  odometer: number;
  allocationDate?: string;
  startDate?: string;
  endDate?: string;
  replacementVehicleId?: string;
  rentalId?: string; // Associated active rental ID
}

export interface CorporateContract {
  id: string; // e.g. "CTR-2026-001"
  contractNumber: string;
  reservationId?: string; // Reference to originating reservation
  corporateCustomerId: string;
  corporateCustomerName: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "EXPIRING_SOON" | "COMPLETED" | "TERMINATED";
  monthlyBillingAmount: number;
  paymentTerm: string;
  
  // Terms & SLA
  slaDescription?: string;
  maintenanceIncluded?: boolean;
  insuranceIncluded?: boolean;
  driverIncluded?: boolean;
  termsAndConditions?: string;

  // Fleet requirements breakdown
  requiredFleet: number;
  allocatedFleet: number;
  operationalFleet: number;
  maintenanceFleet: number;
  replacementFleet: number;
  shortageCount: number; // required - (operational + replacement)
  allocatedVehicles: ContractVehicleAllocation[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
