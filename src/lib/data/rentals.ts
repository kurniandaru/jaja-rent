import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockRentals, mockReservations } from "@/lib/mock-data/rentals";
import { RentalRecord, ReservationRecord, RentalType } from "@/lib/types/rental";

export async function getRentals(type?: RentalType): Promise<RentalRecord[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      let query = supabase
        .from("rentals")
        .select(`
          *,
          customers:customer_id(full_name, phone),
          corporate_customers:corporate_customer_id(company_name, phone),
          drivers:driver_id(name),
          rental_vehicles(vehicle:vehicle_id(police_number, model))
        `)
        .order("start_date", { ascending: false });

      if (type) {
        query = query.eq("rental_type", type);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((r: any) => {
          const veh = r.rental_vehicles?.[0]?.vehicle;
          return {
            id: r.rental_number || r.id,
            type: r.rental_type,
            vehicleId: r.rental_vehicles?.[0]?.vehicle_id || "B-1234-XYZ",
            vehiclePlate: veh?.police_number || "B 1234 XYZ",
            vehicleModel: veh?.model || "Toyota Innova",
            customerId: r.customer_id || r.corporate_customer_id || "",
            customerName: r.corporate_customers?.company_name || r.customers?.full_name || "Customer",
            customerPhone: r.corporate_customers?.phone || r.customers?.phone || undefined,
            corporateContractId: r.contract_id || undefined,
            withDriver: r.with_driver,
            driverId: r.driver_id || undefined,
            driverName: r.drivers?.name || undefined,
            startDate: r.start_date,
            endDate: r.end_date,
            actualReturnDate: r.actual_return_date || undefined,
            pickupLocation: r.pickup_location,
            dropoffLocation: r.dropoff_location,
            totalAmount: Number(r.total_amount) || 0,
            depositAmount: Number(r.deposit_amount) || 0,
            status: r.status,
            notes: r.notes || undefined,
          };
        });
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getRentals", err);
    }
  }

  if (type) {
    return mockRentals.filter((r) => r.type === type);
  }
  return mockRentals;
}

export async function getActiveRentals(): Promise<RentalRecord[]> {
  const all = await getRentals();
  return all.filter((r) => r.status === "ACTIVE");
}

export async function getReservations(): Promise<ReservationRecord[]> {
  return mockReservations;
}

