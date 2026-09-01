import { ActionRequiredItem } from "../types/operations";

export const mockActionRequired: ActionRequiredItem[] = [
  {
    id: "ACT-01",
    priority: "CRITICAL",
    title: "1 corporate contract has fleet shortage",
    description:
      "PT ABC Indonesia (CTR-2026-001) requires 10 units, currently 9 operational (1 in maintenance: B 8899 KLU). Replacement unit needed immediately.",
    targetType: "SHORTAGE",
    targetId: "CTR-2026-001",
    actionUrl: "/corporate/contracts/CTR-2026-001?action=replacement",
    dueText: "Immediate Action Required",
    badgeLabel: "Corporate Shortage",
  },
  {
    id: "ACT-02",
    priority: "CRITICAL",
    title: "2 documents expired (STNK & Pajak)",
    description:
      "STNK expired on B 4422 RST (Vendor PT Trans Indo Sejahtera) & Pajak expired on B 7890 WSX (Document Hold).",
    targetType: "DOCUMENT",
    actionUrl: "/operations/documents?status=EXPIRED",
    dueText: "Expired",
    badgeLabel: "Legal Compliance",
  },
  {
    id: "ACT-03",
    priority: "WARNING",
    title: "3 vehicles have maintenance due / in progress",
    description:
      "B 8899 KLU (Brake repair), B 9988 TYU (Clutch plate), B 7711 GHY (Odometer threshold reached).",
    targetType: "MAINTENANCE",
    actionUrl: "/operations/maintenance?status=DUE",
    dueText: "Action this week",
    badgeLabel: "Workshop Service",
  },
  {
    id: "ACT-04",
    priority: "WARNING",
    title: "4 vehicles require inspection",
    description:
      "B 1099 QWE (Tire check pending), B 9123 POX (Pre-KIR test), B 2345 DEF (Post-rental return due).",
    targetType: "INSPECTION",
    actionUrl: "/operations/inspection?status=PENDING",
    dueText: "Due Today",
    badgeLabel: "Safety Inspection",
  },
  {
    id: "ACT-05",
    priority: "WARNING",
    title: "2 B2C rentals end tomorrow (02 Sep 2026)",
    description:
      "Hendrawan Putra (B 2345 DEF Fortuner) & Jessica Tanuwidjaja (B 7711 GHY HR-V) scheduled for return.",
    targetType: "RENTAL",
    actionUrl: "/rental/b2c?filter=returns_today",
    dueText: "Tomorrow",
    badgeLabel: "B2C Returns",
  },
  {
    id: "ACT-06",
    priority: "INFORMATIONAL",
    title: "1 GPS device offline",
    description:
      "Daihatsu GranMax (B 9988 TYU) tracker offline for > 4 hours at Bengkel Sentosa Daan Mogot.",
    targetType: "GPS",
    actionUrl: "/operations/gps?vehicle=B-9988-TYU",
    dueText: "4 hrs ago",
    badgeLabel: "GPS Telemetry",
  },
];
