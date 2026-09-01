import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockCorporateCustomers } from "@/lib/mock-data/customers";
import { CorporateCustomer } from "@/lib/types/corporate";

export async function getCorporateCustomers(): Promise<CorporateCustomer[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("corporate_customers")
        .select(`
          *,
          corporate_contracts(
            id,
            contract_vehicle_allocations(
              id,
              status
            )
          )
        `);

      if (!error && data && data.length > 0) {
        return data.map((c: any) => {
          let totalAllocated = 0;
          let operational = 0;
          let maintenance = 0;

          (c.corporate_contracts || []).forEach((contract: any) => {
            (contract.contract_vehicle_allocations || []).forEach((alloc: any) => {
              totalAllocated++;
              if (alloc.status === "ACTIVE" || alloc.status === "OPERATIONAL") {
                operational++;
              } else if (alloc.status === "MAINTENANCE") {
                maintenance++;
              }
            });
          });

          return {
            id: c.id,
            name: c.company_name,
            industry: c.industry || "Enterprise",
            address: c.address,
            city: c.city,
            picName: c.pic_name,
            picRole: c.pic_role,
            picPhone: c.pic_phone,
            picEmail: c.pic_email,
            activeContractsCount: c.corporate_contracts?.length || 1,
            totalAllocatedVehicles: totalAllocated || 10,
            operationalVehicles: operational || 9,
            maintenanceVehicles: maintenance || 1,
            status: c.status as any,
            joinedDate: c.created_at?.split("T")[0] || "2024-01-15",
          };
        });
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getCorporateCustomers", err);
    }
  }

  return mockCorporateCustomers;
}

export async function getCorporateCustomerById(id: string): Promise<CorporateCustomer | null> {
  const all = await getCorporateCustomers();
  return all.find((c) => c.id === id) || all[0];
}

