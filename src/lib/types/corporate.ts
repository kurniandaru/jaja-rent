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
  activeContractsCount: number;
  totalAllocatedVehicles: number;
  operationalVehicles: number;
  maintenanceVehicles: number;
  status: "ACTIVE" | "INACTIVE" | "PROSPECT";
  joinedDate: string;
}

export interface ContractVehicleAllocation {
  vehicleId: string;
  plateNumber: string;
  model: string;
  ownership: OwnershipType;
  assignedDriver?: string;
  status: "OPERATIONAL" | "MAINTENANCE" | "REPLACEMENT";
  location: string;
  odometer: number;
  replacementVehicleId?: string;
}

export interface CorporateContract {
  id: string; // e.g. "CTR-2026-001"
  contractNumber: string;
  corporateCustomerId: string;
  corporateCustomerName: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "COMPLETED" | "DRAFT" | "TERMINATED";
  monthlyBillingAmount: number;
  paymentTerm: string;
  // Fleet requirements breakdown
  requiredFleet: number;
  allocatedFleet: number;
  operationalFleet: number;
  maintenanceFleet: number;
  replacementFleet: number;
  shortageCount: number; // required - (operational + replacement)
  allocatedVehicles: ContractVehicleAllocation[];
  notes?: string;
}
