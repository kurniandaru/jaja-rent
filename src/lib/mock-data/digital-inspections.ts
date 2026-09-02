import { DigitalInspectionRecord } from "@/lib/types/inspection";
import {
  defaultExteriorItems,
  defaultInteriorItems,
  defaultMechanicalItems,
  defaultFrameItems,
  defaultTestDriveItems,
} from "@/lib/inspections/inspection-items";
import { calculateGradeSummary } from "@/lib/inspections/inspection-calculator";

// Helper to create populated mock items
function createMockExteriorItems(defaultGrade: "A" | "B" | "C" = "A") {
  return defaultExteriorItems.map((item) => ({
    ...item,
    grade: defaultGrade,
  }));
}

function createMockInteriorItems(defaultGrade: "A" | "B" | "C" = "A") {
  return defaultInteriorItems.map((item) => ({
    ...item,
    grade: defaultGrade,
  }));
}

function createMockMechanicalItems(defaultGrade: "A" | "B" | "C" = "A") {
  return defaultMechanicalItems.map((item) => ({
    ...item,
    grade: defaultGrade,
  }));
}

function createMockFrameItems(defaultGrade: "A" | "B" | "C" = "A") {
  return defaultFrameItems.map((item) => ({
    ...item,
    grade: defaultGrade,
  }));
}

// 1. INSP-2026-001 (Completed - Grade A)
const ext1 = createMockExteriorItems("A");
const int1 = createMockInteriorItems("A");
const mech1 = createMockMechanicalItems("A");
const frame1 = createMockFrameItems("A");
const td1 = [...defaultTestDriveItems];
const grades1 = calculateGradeSummary(ext1, int1, mech1, frame1, td1);

// 2. INSP-2026-002 (Completed - Grade B with minor tire/body wear)
const ext2 = createMockExteriorItems("A").map((it) =>
  it.id === "ext_front_bumper" || it.id === "ext_front_left_tire"
    ? { ...it, grade: "B" as const, note: "Baret halus pemakaian wajar" }
    : it
);
const int2 = createMockInteriorItems("A");
const mech2 = createMockMechanicalItems("A").map((it) =>
  it.id === "mech_air_filter"
    ? { ...it, grade: "B" as const, note: "Filter mulai berdebu, disarankan tiup kompresor" }
    : it
);
const frame2 = createMockFrameItems("A");
const td2 = [...defaultTestDriveItems];
const grades2 = calculateGradeSummary(ext2, int2, mech2, frame2, td2);

// 3. INSP-2026-003 (Completed - Grade D / Needs Maintenance - Brake & AC issues)
const ext3 = createMockExteriorItems("B");
const int3 = createMockInteriorItems("B");
const mech3 = createMockMechanicalItems("B").map((it) => {
  if (it.id === "mech_ac_system")
    return { ...it, grade: "D" as const, note: "Blower kurang dingin, freon perlu isi ulang" };
  if (it.id === "mech_brake_fluid")
    return { ...it, grade: "E" as const, note: "Kampas rem tipis dan kebocoran seal master rem" };
  return it;
});
const frame3 = createMockFrameItems("B");
const td3 = defaultTestDriveItems.map((td) =>
  td.id === "td_brake_performance"
    ? { ...td, status: "ISSUE" as const, note: "Pedal rem dalam dan jarak pengereman panjang" }
    : td
);
const grades3 = calculateGradeSummary(ext3, int3, mech3, frame3, td3);

// 4. INSP-2026-DRAFT-001 (Draft in progress)
const ext4 = defaultExteriorItems.map((it, idx) =>
  idx < 15 ? { ...it, grade: "A" as const } : it
);
const int4 = [...defaultInteriorItems];
const mech4 = [...defaultMechanicalItems];
const frame4 = [...defaultFrameItems];
const td4 = [...defaultTestDriveItems];
const grades4 = calculateGradeSummary(ext4, int4, mech4, frame4, td4);

export const mockDigitalInspections: DigitalInspectionRecord[] = [
  {
    id: "INSP-2026-001",
    vehicleId: "B-1234-XYZ",
    vehicleSpecs: {
      vehicleId: "B-1234-XYZ",
      plateNumber: "B 1234 XYZ",
      brand: "Toyota",
      model: "Innova Zenix",
      series: "2.0 V CVT",
      engineCapacityCc: 1987,
      vehicleType: "MPV",
      transmission: "Automatic (CVT)",
      year: 2024,
      lastOdometer: 82421,
      color: "Platinum White Pearl",
      bodyModel: "Minibus",
      fuelType: "Hybrid",
      vinChassisNumber: "MHFXW43G6R0129841",
      engineNumber: "M20A-FKS-993821",
      taxExpiryDate: "2026-11-20",
      ownership: "PT Jaja Rent Indonesia (Jaja-Owned)",
    },
    inspectorName: "Rudi Hartono",
    inspectionDate: "2026-08-28",
    inspectionLocation: "Hub Pool Sudirman / Dispatch Center",
    inspectionOdometer: 82421,
    inspectorNotes: "Kendaraan dalam kondisi prima siap serah terima kontrak B2B korporat.",
    exteriorItems: ext1,
    interiorItems: int1,
    mechanicalItems: mech1,
    frameItems: frame1,
    testDriveItems: td1,
    photos: {
      rightFront: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
      leftFront: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
      rightRear: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
      leftRear: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80",
      dashboard: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80",
      engine: "https://images.unsplash.com/photo-1597687210367-a4915552d890?w=600&auto=format&fit=crop&q=80",
      stnk: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
      bpkb: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80",
    },
    grades: grades1,
    status: "COMPLETED",
    recommendedVehicleStatus: "AVAILABLE",
    createdAt: "2026-08-28T09:30:00Z",
    updatedAt: "2026-08-28T10:15:00Z",
  },
  {
    id: "INSP-2026-002",
    vehicleId: "B-5678-ABC",
    vehicleSpecs: {
      vehicleId: "B-5678-ABC",
      plateNumber: "B 5678 ABC",
      brand: "Toyota",
      model: "Veloz",
      series: "1.5 Q CVT TSS",
      engineCapacityCc: 1496,
      vehicleType: "LMPV",
      transmission: "Automatic",
      year: 2023,
      lastOdometer: 45210,
      color: "Black Metallic",
      bodyModel: "Minibus",
      fuelType: "Bensin",
      vinChassisNumber: "MHFZ781A8P0031892",
      engineNumber: "2NR-VE-449102",
      taxExpiryDate: "2026-07-15",
      ownership: "PT Jaja Rent Indonesia (Jaja-Owned)",
    },
    inspectorName: "Bambang Irawan",
    inspectionDate: "2026-08-29",
    inspectionLocation: "Pool Kebon Jeruk",
    inspectionOdometer: 45210,
    inspectorNotes: "Inspeksi berkala 45.000 KM. Semua sistem normal dengan minor wear.",
    exteriorItems: ext2,
    interiorItems: int2,
    mechanicalItems: mech2,
    frameItems: frame2,
    testDriveItems: td2,
    photos: {
      rightFront: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
      leftFront: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
      dashboard: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80",
      engine: "https://images.unsplash.com/photo-1597687210367-a4915552d890?w=600&auto=format&fit=crop&q=80",
    },
    grades: grades2,
    status: "COMPLETED",
    recommendedVehicleStatus: "AVAILABLE",
    createdAt: "2026-08-29T14:00:00Z",
    updatedAt: "2026-08-29T14:45:00Z",
  },
  {
    id: "INSP-2026-003",
    vehicleId: "B-2345-DEF",
    vehicleSpecs: {
      vehicleId: "B-2345-DEF",
      plateNumber: "B 2345 DEF",
      brand: "Toyota",
      model: "Fortuner",
      series: "2.8 GR Sport 4x2",
      engineCapacityCc: 2755,
      vehicleType: "SUV",
      transmission: "Automatic",
      year: 2023,
      lastOdometer: 31050,
      color: "Super White",
      bodyModel: "Jeep / SUV",
      fuelType: "Diesel",
      vinChassisNumber: "MHFY984C7P0019284",
      engineNumber: "1GD-FTV-882914",
      taxExpiryDate: "2026-10-05",
      ownership: "PT Jaja Rent Indonesia (Jaja-Owned)",
    },
    inspectorName: "Rudi Hartono",
    inspectionDate: "2026-08-30",
    inspectionLocation: "Pool Thamrin",
    inspectionOdometer: 31050,
    inspectorNotes: "Ditemukan masalah pada minyak rem dan AC. Unit harus masuk bengkel sebelum disewakan.",
    exteriorItems: ext3,
    interiorItems: int3,
    mechanicalItems: mech3,
    frameItems: frame3,
    testDriveItems: td3,
    photos: {
      rightFront: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
      engine: "https://images.unsplash.com/photo-1597687210367-a4915552d890?w=600&auto=format&fit=crop&q=80",
      damageRightFront: "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=600&auto=format&fit=crop&q=80",
    },
    grades: grades3,
    status: "COMPLETED",
    recommendedVehicleStatus: "MAINTENANCE",
    createdAt: "2026-08-30T11:00:00Z",
    updatedAt: "2026-08-30T12:00:00Z",
  },
  {
    id: "INSP-2026-DRAFT-001",
    vehicleId: "B-3456-GHI",
    vehicleSpecs: {
      vehicleId: "B-3456-GHI",
      plateNumber: "B 3456 GHI",
      brand: "Mitsubishi",
      model: "Xpander",
      series: "Ultimate CVT",
      engineCapacityCc: 1499,
      vehicleType: "LMPV",
      transmission: "Automatic",
      year: 2023,
      lastOdometer: 28400,
      color: "Quartz White Pearl",
      bodyModel: "Minibus",
      fuelType: "Bensin",
      vinChassisNumber: "MMBNC1W0P0098124",
      engineNumber: "4A91-884910",
      taxExpiryDate: "2026-09-12",
      ownership: "PT Mitra Armada Nusantara (Vendor-Owned)",
    },
    inspectorName: "Ahmad Subarjo",
    inspectionDate: "2026-09-01",
    inspectionLocation: "Pool Kebon Jeruk",
    inspectionOdometer: 28400,
    inspectorNotes: "Inspeksi berkala sedang berjalan.",
    exteriorItems: ext4,
    interiorItems: int4,
    mechanicalItems: mech4,
    frameItems: frame4,
    testDriveItems: td4,
    photos: {},
    grades: grades4,
    status: "DRAFT",
    recommendedVehicleStatus: "AVAILABLE",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:30:00Z",
  },
];
