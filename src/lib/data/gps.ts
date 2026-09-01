import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockGPSTelemetry } from "@/lib/mock-data/gps";
import { GPSTelemetry } from "@/lib/types/operations";

export async function getGPSTelemetryList(): Promise<GPSTelemetry[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select(`
          id,
          police_number,
          model,
          status,
          current_odometer,
          location_city,
          location_area,
          current_location_lat,
          current_location_lng,
          last_gps_update
        `)
        .order("police_number", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((v: any) => ({
          vehicleId: v.id,
          plateNumber: v.police_number,
          model: v.model,
          customerName: v.status === "RENTED" ? "Active Lease Client" : undefined,
          businessType: "B2B",
          status: v.status === "MAINTENANCE" ? "OFFLINE" : "ONLINE",
          latitude: Number(v.current_location_lat) || -6.1934,
          longitude: Number(v.current_location_lng) || 106.8231,
          address: v.location_area || "DKI Jakarta",
          city: v.location_city || "Jakarta",
          speed: v.status === "RENTED" ? 48 : 0,
          heading: "North-East",
          odometer: v.current_odometer || 0,
          batteryLevel: 96,
          ignition: v.status === "RENTED" ? "ON" : "OFF",
          lastUpdate: "3s ago",
          rentalStatus: v.status,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getGPSTelemetryList", err);
    }
  }

  return mockGPSTelemetry;
}

