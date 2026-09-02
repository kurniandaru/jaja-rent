export type InspectionGrade = "A" | "B" | "C" | "D" | "E";

export type InspectionCategory =
  | "EXTERIOR"
  | "INTERIOR"
  | "MECHANICAL"
  | "FRAME"
  | "TEST_DRIVE";

export type InspectionStatus = "DRAFT" | "COMPLETED";

export interface InspectionItem {
  id: string;
  name: string;
  nameId: string; // Indonesian title
  category: InspectionCategory;
  grade?: InspectionGrade;
  note?: string;
  photos?: string[];
}

export interface TestDriveItem {
  id: string;
  name: string;
  nameId: string;
  status: "NORMAL" | "ISSUE";
  note?: string;
  photos?: string[];
}

export interface VehicleMasterSpecs {
  vehicleId: string;
  plateNumber: string;
  brand: string;
  model: string;
  series: string;
  engineCapacityCc: number;
  vehicleType: string;
  transmission: string;
  year: number;
  lastOdometer: number;
  color: string;
  bodyModel: string;
  fuelType: string;
  vinChassisNumber: string;
  engineNumber: string;
  taxExpiryDate: string;
  ownership: string;
}

export interface PhotoDocumentation {
  // Vehicle 6-angle photos
  rightFront?: string;
  leftFront?: string;
  rightRear?: string;
  leftRear?: string;
  dashboard?: string;
  engine?: string;

  // Document photos
  stnk?: string;
  bpkb?: string;

  // Damage detail photos
  damageRightFront?: string;
  damageLeftFront?: string;
  damageRightRear?: string;
  damageLeftRear?: string;
  damageOthers?: string[];
}

export interface GradeSummary {
  overallGrade: InspectionGrade;
  exteriorGrade: InspectionGrade;
  interiorGrade: InspectionGrade;
  mechanicalGrade: InspectionGrade;
  frameGrade: InspectionGrade;
  testDriveStatus: "NORMAL" | "HAS_ISSUES";
  totalItems: number;
  gradedItemsCount: number;
  ungradedItemsCount: number;
  gradeACount: number;
  gradeBCount: number;
  gradeCCount: number;
  gradeDCount: number;
  gradeECount: number;
  issuesCount: number;
  scorePercentage: number;
}

export interface DigitalInspectionRecord {
  id: string; // e.g. "INSP-2026-001"
  vehicleId: string;
  vehicleSpecs: VehicleMasterSpecs;

  // Inspection metadata
  inspectorName: string;
  inspectionDate: string;
  inspectionLocation: string;
  inspectionOdometer: number;
  inspectorNotes?: string;

  // Checklist data
  exteriorItems: InspectionItem[];
  interiorItems: InspectionItem[];
  mechanicalItems: InspectionItem[];
  frameItems: InspectionItem[];
  testDriveItems: TestDriveItem[];

  // Photo documentation
  photos: PhotoDocumentation;

  // Calculated Grades
  grades: GradeSummary;

  // Lifecycle
  status: InspectionStatus;
  recommendedVehicleStatus: "AVAILABLE" | "MAINTENANCE";
  createdAt: string;
  updatedAt: string;
}
