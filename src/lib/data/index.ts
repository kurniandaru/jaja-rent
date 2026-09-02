export * from "./vehicles";
export * from "./rentals";
export * from "./reservations";
export * from "./contracts";
export * from "./customers";
export * from "./agreements";
export * from "./vendors";
export * from "./inspections";
export * from "./maintenance";
export * from "./documents";
export * from "./gps";
export * from "./history";
export * from "./actions";

// Re-export mock fixtures for seamless offline development and UI testing
export { mockVehicles } from "@/lib/mock-data/vehicles";
export { mockRentals } from "@/lib/mock-data/rentals";
export { mockReservations } from "@/lib/mock-data/reservations";
export { mockContracts } from "@/lib/mock-data/contracts";
export { mockIndividualCustomers, mockCorporateCustomers } from "@/lib/mock-data/customers";
export { mockAgreementVersions } from "@/lib/mock-data/agreements";
export { mockVendors } from "@/lib/mock-data/vendors";
export { mockInspections } from "@/lib/mock-data/inspections";
export { mockDigitalInspections } from "@/lib/mock-data/digital-inspections";
export { mockMaintenance } from "@/lib/mock-data/maintenance";
export { mockDocuments } from "@/lib/mock-data/documents";
export { mockGPSTelemetry } from "@/lib/mock-data/gps";
export { mockActionRequired } from "@/lib/mock-data/actions";
export { mockVehicleHistories } from "@/lib/mock-data/history";
