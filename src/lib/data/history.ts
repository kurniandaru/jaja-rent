import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockVehicleHistories } from "@/lib/mock-data/history";
import { VehicleHistoryEvent } from "@/lib/types/operations";

export async function getVehicleHistory(vehicleId: string): Promise<VehicleHistoryEvent[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("vehicle_history")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("event_date", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((h: any) => ({
          id: h.id,
          vehicleId: h.vehicle_id,
          date: h.event_date?.split("T")[0] || "2026-09-01",
          title: h.title,
          type: h.event_type as any,
          description: h.description,
          actor: h.actor || undefined,
          odometer: h.odometer || undefined,
          tag: h.tag || undefined,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getVehicleHistory", err);
    }
  }

  return mockVehicleHistories[vehicleId] || mockVehicleHistories["B-1234-XYZ"] || [];
}

