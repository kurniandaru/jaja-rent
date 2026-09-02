import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockInspections } from "@/lib/mock-data/inspections";
import { mockDigitalInspections } from "@/lib/mock-data/digital-inspections";
import { InspectionRecord } from "@/lib/types/operations";
import { DigitalInspectionRecord } from "@/lib/types/inspection";

// In-memory / LocalStorage cache for digital inspections
let cachedDigitalInspections: DigitalInspectionRecord[] = [...mockDigitalInspections];

export async function getDigitalInspections(vehicleId?: string): Promise<DigitalInspectionRecord[]> {
  // Check browser localStorage if available
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("jaja_digital_inspections");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedDigitalInspections = parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read local inspections storage", e);
    }
  }

  if (vehicleId) {
    return cachedDigitalInspections.filter(
      (i) => i.vehicleId === vehicleId || i.vehicleSpecs.plateNumber === vehicleId
    );
  }

  return cachedDigitalInspections;
}

export async function getDigitalInspectionById(id: string): Promise<DigitalInspectionRecord | null> {
  const all = await getDigitalInspections();
  return all.find((i) => i.id === id) || null;
}

export async function saveDigitalInspection(
  record: DigitalInspectionRecord
): Promise<{ success: boolean; data: DigitalInspectionRecord }> {
  const existingIdx = cachedDigitalInspections.findIndex((i) => i.id === record.id);

  if (existingIdx >= 0) {
    cachedDigitalInspections[existingIdx] = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
  } else {
    cachedDigitalInspections = [record, ...cachedDigitalInspections];
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("jaja_digital_inspections", JSON.stringify(cachedDigitalInspections));
    } catch (e) {
      console.warn("Could not save to local inspections storage", e);
    }
  }

  return { success: true, data: record };
}

export async function deleteDigitalInspection(id: string): Promise<{ success: boolean }> {
  cachedDigitalInspections = cachedDigitalInspections.filter((i) => i.id !== id);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("jaja_digital_inspections", JSON.stringify(cachedDigitalInspections));
    } catch (e) {
      console.warn("Could not save to local inspections storage", e);
    }
  }

  return { success: true };
}

// Backwards compatibility functions
export async function getInspections(vehicleId?: string): Promise<InspectionRecord[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      let query = supabase
        .from("inspections")
        .select(`
          *,
          vehicles:vehicle_id(police_number, brand, model)
        `)
        .order("inspection_date", { ascending: false });

      if (vehicleId) {
        query = query.eq("vehicle_id", vehicleId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((i: any) => ({
          id: i.id,
          vehicleId: i.vehicle_id,
          plateNumber: i.vehicles?.police_number || "B 1234 XYZ",
          model: i.vehicles ? `${i.vehicles.brand} ${i.vehicles.model}` : "Toyota Innova",
          type: i.inspection_type,
          date: i.inspection_date,
          odometer: i.odometer,
          inspectorName: i.inspector_name,
          result: i.result,
          checklist: {
            exterior: { body: true, glass: true, tire: true, lamp: true },
            interior: { seat: true, ac: true, dashboard: true, cleanliness: true },
            engine: { oil: true, coolant: true, battery: true, brakeFluid: i.result === "PASSED" },
            safety: { seatbelt: true, airbag: true, spareTire: true, toolKit: true },
          },
          notes: i.notes || undefined,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getInspections", err);
    }
  }

  if (vehicleId) {
    return mockInspections.filter((i) => i.vehicleId === vehicleId || i.plateNumber === vehicleId);
  }

  return mockInspections;
}

export async function createInspection(
  record: Partial<InspectionRecord>
): Promise<{ success: boolean; data?: InspectionRecord }> {
  const supabase = getSupabaseBrowserClient();

  if (supabase && record.vehicleId) {
    try {
      const { data, error } = await supabase
        .from("inspections")
        .insert({
          vehicle_id: record.vehicleId,
          inspection_type: (record.type as any) || "PERIODIC",
          inspection_date: record.date || new Date().toISOString().split("T")[0],
          inspector_name: record.inspectorName || "Inspector Ops",
          odometer: record.odometer || 0,
          result: (record.result as any) || "PASSED",
          notes: record.notes,
        } as any)
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: { ...record, id: (data as any).id } as InspectionRecord };
      }
    } catch (err) {
      console.warn("Supabase insert failed in createInspection", err);
    }
  }

  return { success: true, data: record as InspectionRecord };
}
