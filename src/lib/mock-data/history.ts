import { VehicleHistoryEvent } from "../types/operations";

export const mockVehicleHistories: Record<string, VehicleHistoryEvent[]> = {
  "B-1234-XYZ": [
    {
      id: "HIST-01",
      vehicleId: "B-1234-XYZ",
      date: "01 Sep 2026",
      title: "Periodic Inspection Completed",
      type: "INSPECTION",
      description:
        "Periodic inspection completed by Ahmad Subarjo. Result: PASSED. All safety checks OK.",
      actor: "Ahmad Subarjo",
      odometer: 82421,
      tag: "PASSED",
    },
    {
      id: "HIST-02",
      vehicleId: "B-1234-XYZ",
      date: "10 Aug 2026",
      title: "80,000 KM Periodic Maintenance",
      type: "MAINTENANCE",
      description:
        "Major periodic service done at AutoCare Pulogadung. Engine oil, spark plugs, filters replaced. Cost: Rp 2.500.000.",
      actor: "AutoCare Pulogadung",
      odometer: 80000,
      tag: "COMPLETED",
    },
    {
      id: "HIST-03",
      vehicleId: "B-1234-XYZ",
      date: "01 Jan 2026",
      title: "B2B Rental Contract Started",
      type: "RENTAL_START",
      description:
        "Dispatched to PT ABC Indonesia for 1-year corporate rental contract (CTR-2026-001). Driver: Budi Santoso.",
      actor: "Operations Fleet Desk",
      odometer: 64100,
      tag: "B2B ACTIVE",
    },
    {
      id: "HIST-04",
      vehicleId: "B-1234-XYZ",
      date: "15 Dec 2025",
      title: "Annual Insurance Renewal",
      type: "DOCUMENT_RENEWED",
      description:
        "Commercial All Risk Insurance renewed with PT Asuransi Central Asia.",
      actor: "Legal & Compliance",
      tag: "ACTIVE",
    },
    {
      id: "HIST-05",
      vehicleId: "B-1234-XYZ",
      date: "04 Dec 2025",
      title: "B2C Rental Ended & Return Inspection",
      type: "RENTAL_END",
      description:
        "Returned by customer Budi Santoso. Return inspection PASSED without incident or scratch.",
      actor: "Dedi Setiawan",
      odometer: 62900,
      tag: "COMPLETED",
    },
    {
      id: "HIST-06",
      vehicleId: "B-1234-XYZ",
      date: "01 Dec 2025",
      title: "B2C Rental Started",
      type: "RENTAL_START",
      description:
        "3-day rental to customer Budi Santoso (Self-drive). Picked up at Pool Cilandak.",
      actor: "Front Desk Cilandak",
      odometer: 61850,
      tag: "B2C",
    },
  ],
};
