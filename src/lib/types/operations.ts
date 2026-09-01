export interface InspectionChecklist {
  exterior: {
    body: boolean;
    glass: boolean;
    tire: boolean;
    lamp: boolean;
  };
  interior: {
    seat: boolean;
    ac: boolean;
    dashboard: boolean;
    cleanliness: boolean;
  };
  engine: {
    oil: boolean;
    coolant: boolean;
    battery: boolean;
    brakeFluid: boolean;
  };
  safety: {
    seatbelt: boolean;
    airbag: boolean;
    spareTire: boolean;
    toolKit: boolean;
  };
}

export interface InspectionRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  model: string;
  type:
    | "PERIODIC"
    | "PRE_RENTAL"
    | "POST_RENTAL"
    | "POST_MAINTENANCE"
    | "INCIDENT";
  date: string;
  dueDate?: string;
  odometer: number;
  inspectorName: string;
  result: "PASSED" | "FAILED" | "PENDING";
  checklist: InspectionChecklist;
  notes?: string;
  issuesFound?: string[];
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  model: string;
  type:
    | "PERIODIC_SERVICE"
    | "REPAIR"
    | "TIRE_REPLACEMENT"
    | "BODY_PAINT"
    | "AIRCON_SERVICE"
    | "EMERGENCY";
  date: string;
  dueDate?: string;
  odometer: number;
  workshopName: string;
  workshopLocation: string;
  cost: number;
  status: "COMPLETED" | "IN_PROGRESS" | "SCHEDULED" | "OVERDUE";
  description: string;
  partsReplaced?: string[];
  durationDays: number;
}

export type DocumentType = "STNK" | "KIR" | "INSURANCE" | "PAJAK" | "OTHER";

export interface DocumentRecord {
  id: string;
  vehicleId: string;
  plateNumber: string;
  model: string;
  ownership: "JAJA_OWNED" | "VENDOR_OWNED";
  vendorName?: string;
  documentType: DocumentType;
  documentNumber: string;
  issuedDate: string;
  expiryDate: string;
  daysUntilExpiry: number;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  fileUrl?: string;
  costToRenew?: number;
  notes?: string;
}

export interface GPSTelemetry {
  vehicleId: string;
  plateNumber: string;
  model: string;
  customerName?: string;
  businessType: "B2C" | "B2B" | "UNASSIGNED";
  status: "ONLINE" | "OFFLINE" | "IDLE";
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  speed: number;
  heading: string;
  odometer: number;
  batteryLevel: number;
  ignition: "ON" | "OFF";
  lastUpdate: string;
  rentalStatus: "AVAILABLE" | "RENTED" | "MAINTENANCE" | "RESERVED";
}

export interface ActionRequiredItem {
  id: string;
  priority: "CRITICAL" | "WARNING" | "INFORMATIONAL";
  title: string;
  description: string;
  targetType:
    | "DOCUMENT"
    | "SHORTAGE"
    | "INSPECTION"
    | "MAINTENANCE"
    | "RENTAL"
    | "GPS";
  targetId?: string;
  actionUrl: string;
  dueText: string;
  badgeLabel?: string;
}

export interface VehicleHistoryEvent {
  id: string;
  vehicleId: string;
  date: string;
  title: string;
  type:
    | "RENTAL_START"
    | "RENTAL_END"
    | "MAINTENANCE"
    | "INSPECTION"
    | "DOCUMENT_RENEWED"
    | "INCIDENT"
    | "STATUS_CHANGE";
  description: string;
  actor?: string;
  odometer?: number;
  status?: string;
  tag?: string;
}
