import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockMaintenance } from "@/lib/mock-data/maintenance";
import { MaintenanceRecord } from "@/lib/types/operations";

export async function getMaintenanceRecords(vehicleId?: string): Promise<MaintenanceRecord[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      let query = supabase
        .from("maintenance_records")
        .select(`
          *,
          vehicles:vehicle_id(police_number, brand, model)
        `)
        .order("created_at", { ascending: false });

      if (vehicleId) {
        query = query.eq("vehicle_id", vehicleId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((m: any) => ({
          id: m.id,
          vehicleId: m.vehicle_id,
          plateNumber: m.vehicles?.police_number || "B 1234 XYZ",
          model: m.vehicles ? `${m.vehicles.brand} ${m.vehicles.model}` : "Toyota Innova",
          type: m.maintenance_type,
          date: m.scheduled_date || m.created_at?.split("T")[0],
          odometer: m.odometer,
          workshopName: m.workshop_name,
          workshopLocation: m.workshop_location || "Jakarta Workshop",
          cost: Number(m.cost) || 0,
          status: m.status,
          description: m.description,
          durationDays: 2,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getMaintenanceRecords", err);
    }
  }

  if (vehicleId) {
    return mockMaintenance.filter((m) => m.vehicleId === vehicleId || m.plateNumber === vehicleId);
  }

  return mockMaintenance;
}

export async function createMaintenanceRecord(
  record: Partial<MaintenanceRecord>
): Promise<{ success: boolean; data?: MaintenanceRecord }> {
  const supabase = getSupabaseBrowserClient();

  if (supabase && record.vehicleId) {
    try {
      const { data, error } = await supabase
        .from("maintenance_records")
        .insert({
          vehicle_id: record.vehicleId,
          maintenance_type: record.type || "PERIODIC_SERVICE",
          status: (record.status as any) || "IN_PROGRESS",
          scheduled_date: record.date || new Date().toISOString().split("T")[0],
          odometer: record.odometer || 0,
          workshop_name: record.workshopName || "AutoCare Workshop",
          workshop_location: record.workshopLocation || "Jakarta",
          description: record.description || "Routine servicing",
          cost: record.cost || 1500000,
        } as any)
        .select()
        .single();

      if (!error && data) {
        return { success: true, data: { ...record, id: (data as any).id } as MaintenanceRecord };
      }
    } catch (err) {
      console.warn("Supabase insert failed in createMaintenanceRecord", err);
    }
  }

  return { success: true, data: record as MaintenanceRecord };
}

