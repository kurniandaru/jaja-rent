export * from "./vehicles";
export * from "./rentals";
export * from "./contracts";
export * from "./customers";
export * from "./vendors";
export * from "./inspections";
export * from "./maintenance";
export * from "./documents";
export * from "./gps";
export * from "./history";
export * from "./actions";

// Re-export mock fixtures for seamless offline development and UI testing
export { mockVehicles } from "@/lib/mock-data/vehicles";
export { mockRentals, mockReservations } from "@/lib/mock-data/rentals";
export { mockContracts } from "@/lib/mock-data/contracts";
export { mockCorporateCustomers } from "@/lib/mock-data/customers";
export { mockVendors } from "@/lib/mock-data/vendors";
export { mockInspections } from "@/lib/mock-data/inspections";
export { mockMaintenance } from "@/lib/mock-data/maintenance";
export { mockDocuments } from "@/lib/mock-data/documents";
export { mockGPSTelemetry } from "@/lib/mock-data/gps";
export { mockActionRequired } from "@/lib/mock-data/actions";
export { mockVehicleHistories } from "@/lib/mock-data/history";
