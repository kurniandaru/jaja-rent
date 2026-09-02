export interface VendorQuotation {
  id: string; // e.g. "VQ-2026-001"
  reservationId: string;
  vendorId: string;
  vendorName: string;
  vehicleModel: string;
  quantity: number;
  vendorCostPerMonth: number; // e.g. 5.500.000
  customerPricePerMonth: number; // e.g. 6.500.000
  grossMarginPerUnit: number; // customerPricePerMonth - vendorCostPerMonth
  rentalPeriodMonths: number;
  maintenanceIncluded: boolean;
  insuranceIncluded: boolean;
  driverIncluded: boolean;
  replacementUnitGuaranteed: boolean;
  slaDescription: string;
  notes?: string;
  quotationDocName?: string;
  quotationDocUrl?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "NEGOTIATING";
  submittedDate: string;
}

export interface NegotiationTerms {
  proposedCustomerPrice: number;
  agreedVendorCost: number;
  expectedMargin: number;
  durationMonths: number;
  slaTerms: string;
  replacementPolicy: string;
  maintenancePolicy: string;
  insurancePolicy: string;
  notes?: string;
}
