import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockVehicles } from "@/lib/mock-data/vehicles";
import { Vehicle, VehicleStatus, OwnershipType, BusinessEligibility } from "@/lib/types/fleet";

export interface VehicleFilterParams {
  ownership?: string;
  status?: string;
  search?: string;
  eligibility?: string;
}

export async function getVehicles(params?: VehicleFilterParams): Promise<Vehicle[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      let query = supabase.from("vehicle_operational_summary").select("*");

      if (params?.ownership && params.ownership !== "ALL") {
        const ownershipEnum = params.ownership === "JAJA_OWNED" ? "JAJA" : "VENDOR";
        query = query.eq("ownership_type", ownershipEnum);
      }

      if (params?.status && params.status !== "ALL") {
        query = query.eq("status", params.status as any);
      }

      const { data, error } = await query;

      if (!error && data && (data as any[]).length > 0) {
        return (data as any[]).map((row) => ({
          id: row.id,
          plateNumber: row.police_number,
          brand: row.brand,
          model: row.model,
          year: row.year,
          color: row.color,
          transmission: (row.transmission as any) || "Automatic",
          fuelType: (row.fuel_type as any) || "Bensin",
          seatCapacity: row.seat_capacity || 7,
          vin: row.vin || `VIN-${row.id.slice(0, 8).toUpperCase()}`,
          engineNumber: row.engine_number || `ENG-${row.id.slice(0, 8).toUpperCase()}`,
          odometer: row.current_odometer || 0,
          ownership: (row.ownership_type === "JAJA" ? "JAJA_OWNED" : "VENDOR_OWNED") as OwnershipType,
          vendorName: row.vendor_name || undefined,
          businessEligibility: (row.business_b2c_enabled && row.business_b2b_enabled
            ? "BOTH"
            : row.business_b2c_enabled
            ? "B2C"
            : "B2B") as BusinessEligibility,
          status: row.status as VehicleStatus,
          lifecycleStage: "AVAILABLE",
          currentRentalId: row.current_rental_id || undefined,
          currentCustomerName: row.current_customer_name || undefined,
          currentRentalType: row.current_rental_type || undefined,
          currentDriverName: row.current_driver_name || undefined,
          locationCity: row.location_city || "Jakarta",
          locationArea: row.location_area || "Pool Pusat",
          gpsStatus: "ONLINE",
          lastGpsUpdate: "2 mins ago",
          latitude: Number(row.current_location_lat) || -6.1934,
          longitude: Number(row.current_location_lng) || 106.8231,
          speed: row.status === "RENTED" ? 45 : 0,
          documentStatus: row.document_health || "OK",
          maintenanceStatus: row.maintenance_health || "OK",
          nextServiceOdometer: row.next_service_odometer || (row.current_odometer + 5000),
          dailyRateB2C: row.daily_rate_b2c ? Number(row.daily_rate_b2c) : undefined,
          monthlyRateB2B: row.monthly_rate_b2b ? Number(row.monthly_rate_b2b) : undefined,
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getVehicles, falling back to mock fixtures", err);
    }
  }

  // Fallback to local rich dataset
  let result = [...mockVehicles];

  if (params?.ownership && params.ownership !== "ALL") {
    result = result.filter((v) => v.ownership === params.ownership);
  }
  if (params?.status && params.status !== "ALL") {
    result = result.filter((v) => v.status === params.status);
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    result = result.filter(
      (v) =>
        v.plateNumber.toLowerCase().includes(s) ||
        v.brand.toLowerCase().includes(s) ||
        v.model.toLowerCase().includes(s) ||
        (v.currentCustomerName && v.currentCustomerName.toLowerCase().includes(s))
    );
  }

  return result;
}

export async function getVehicleById(idOrPlate: string): Promise<Vehicle | null> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("vehicle_operational_summary")
        .select("*")
        .or(`id.eq.${idOrPlate},police_number.eq.${idOrPlate.replace(/-/g, " ")}`)
        .maybeSingle();

      if (!error && data) {
        const row = data as any;
        return {
          id: row.id,
          plateNumber: row.police_number,
          brand: row.brand,
          model: row.model,
          year: row.year,
          color: row.color,
          transmission: (row.transmission as any) || "Automatic",
          fuelType: (row.fuel_type as any) || "Bensin",
          seatCapacity: row.seat_capacity || 7,
          vin: row.vin || `VIN-${row.id.slice(0, 8).toUpperCase()}`,
          engineNumber: row.engine_number || `ENG-${row.id.slice(0, 8).toUpperCase()}`,
          odometer: row.current_odometer || 0,
          ownership: (row.ownership_type === "JAJA" ? "JAJA_OWNED" : "VENDOR_OWNED") as OwnershipType,
          vendorName: row.vendor_name || undefined,
          businessEligibility: (row.business_b2c_enabled && row.business_b2b_enabled
            ? "BOTH"
            : row.business_b2c_enabled
            ? "B2C"
            : "B2B") as BusinessEligibility,
          status: row.status as VehicleStatus,
          lifecycleStage: "AVAILABLE",
          currentRentalId: row.current_rental_id || undefined,
          currentCustomerName: row.current_customer_name || undefined,
          currentRentalType: row.current_rental_type || undefined,
          currentDriverName: row.current_driver_name || undefined,
          locationCity: row.location_city || "Jakarta",
          locationArea: row.location_area || "Pool Pusat",
          gpsStatus: "ONLINE",
          lastGpsUpdate: "2 mins ago",
          latitude: Number(row.current_location_lat) || -6.1934,
          longitude: Number(row.current_location_lng) || 106.8231,
          speed: row.status === "RENTED" ? 45 : 0,
          documentStatus: row.document_health || "OK",
          maintenanceStatus: row.maintenance_health || "OK",
          nextServiceOdometer: row.next_service_odometer || (row.current_odometer + 5000),
          dailyRateB2C: row.daily_rate_b2c ? Number(row.daily_rate_b2c) : undefined,
          monthlyRateB2B: row.monthly_rate_b2b ? Number(row.monthly_rate_b2b) : undefined,
        };
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getVehicleById", err);
    }
  }

  // Fallback
  const found = mockVehicles.find(
    (v) =>
      v.id.toLowerCase() === idOrPlate.toLowerCase() ||
      v.plateNumber.replace(/\s+/g, "-").toLowerCase() === idOrPlate.toLowerCase() ||
      v.plateNumber.toLowerCase() === idOrPlate.toLowerCase()
  );

  return found || mockVehicles[0];
}

export async function getFleetSummary(): Promise<{
  total: number;
  available: number;
  rented: number;
  reserved: number;
  maintenance: number;
  inspection: number;
  documentHold: number;
  inactive: number;
  jajaOwned: number;
  vendorOwned: number;
}> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.from("fleet_summary").select("*").maybeSingle();
      if (!error && data) {
        const summary = data as any;
        return {
          total: Number(summary.total) || 0,
          available: Number(summary.available) || 0,
          rented: Number(summary.rented) || 0,
          reserved: Number(summary.reserved) || 0,
          maintenance: Number(summary.maintenance) || 0,
          inspection: Number(summary.inspection) || 0,
          documentHold: Number(summary.document_hold) || 0,
          inactive: Number(summary.inactive) || 0,
          jajaOwned: Number(summary.jaja_owned) || 0,
          vendorOwned: Number(summary.vendor_owned) || 0,
        };
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getFleetSummary", err);
    }
  }

  return {
    total: 120,
    available: 35,
    rented: 72,
    reserved: 8,
    maintenance: 5,
    inspection: 4,
    documentHold: 2,
    inactive: 0,
    jajaOwned: 80,
    vendorOwned: 40,
  };
}

