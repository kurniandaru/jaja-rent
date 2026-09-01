import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockVendors } from "@/lib/mock-data/vendors";
import { VendorPartner } from "@/lib/types/vendor";

export async function getVendors(): Promise<VendorPartner[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select(`
          *,
          vehicles(
            id,
            police_number,
            brand,
            model,
            year,
            color,
            status,
            current_odometer,
            location_area,
            monthly_rate_b2b
          )
        `);

      if (!error && data && (data as any[]).length > 0) {
        return (data as any[]).map((v: any) => {
          const vehs = v.vehicles || [];
          const total = vehs.length;
          const rented = vehs.filter((vh: any) => vh.status === "RENTED").length;
          const available = vehs.filter((vh: any) => vh.status === "AVAILABLE").length;
          const maint = vehs.filter((vh: any) => vh.status === "MAINTENANCE" || vh.status === "DOCUMENT_HOLD").length;

          return {
            id: v.id,
            name: v.name,
            companyName: v.company_name,
            phone: v.phone,
            email: v.email,
            address: v.address,
            contactPerson: v.contact_person,
            taxId: v.tax_id || undefined,
            status: v.status as any,
            totalVehicles: total,
            activeRentedVehicles: rented,
            availableVehicles: available,
            maintenanceVehicles: maint,
            joinedDate: v.created_at?.split("T")[0] || "2024-01-10",
            vehicles: vehs.map((vh: any) => ({
              id: vh.id,
              plateNumber: vh.police_number,
              brand: vh.brand,
              model: vh.model,
              year: vh.year,
              color: vh.color,
              status: vh.status,
              odometer: vh.current_odometer,
              locationArea: vh.location_area,
              monthlyRateB2B: vh.monthly_rate_b2b ? Number(vh.monthly_rate_b2b) : undefined,
            })),
          };
        });
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getVendors", err);
    }
  }

  return mockVendors;
}

export async function getVendorById(id: string): Promise<VendorPartner | null> {
  const all = await getVendors();
  return all.find((v) => v.id === id) || all[0] || null;
}
