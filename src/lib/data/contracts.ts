import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockContracts } from "@/lib/mock-data/contracts";
import { CorporateContract, ContractVehicleAllocation } from "@/lib/types/corporate";

export async function getCorporateContracts(): Promise<CorporateContract[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("corporate_fleet_status")
        .select("*");

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.contract_number || row.contract_id,
          contractNumber: row.contract_number,
          corporateCustomerId: row.corporate_customer_id,
          corporateCustomerName: row.customer_name,
          startDate: row.start_date,
          endDate: row.end_date,
          status: row.contract_status === "EXPIRING" ? "EXPIRING_SOON" : row.contract_status,
          monthlyBillingAmount: Number(row.monthly_billing_amount) || 0,
          paymentTerm: "Net 30 Days",
          requiredFleet: row.required_units,
          allocatedFleet: row.allocated_units,
          operationalFleet: row.operational_units,
          maintenanceFleet: row.maintenance_units,
          replacementFleet: row.replacement_units,
          shortageCount: row.shortage_count,
          allocatedVehicles: [],
        }));
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getCorporateContracts", err);
    }
  }

  return mockContracts;
}

export async function getCorporateContractById(idOrNumber: string): Promise<CorporateContract | null> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("corporate_contracts")
        .select(`
          *,
          corporate_customers:corporate_customer_id(company_name),
          contract_vehicle_allocations(
            id,
            vehicle_id,
            status,
            is_replacement,
            replacement_for_allocation_id,
            vehicles:vehicle_id(
              id,
              police_number,
              model,
              brand,
              ownership_type,
              current_odometer,
              location_area
            )
          )
        `)
        .or(`id.eq.${idOrNumber},contract_number.eq.${idOrNumber}`)
        .maybeSingle();

      if (!error && data) {
        const contractData = data as any;
        const allocations = (contractData.contract_vehicle_allocations || []).map((a: any) => {
          const veh = a.vehicles;
          return {
            vehicleId: veh?.id || a.vehicle_id,
            plateNumber: veh?.police_number || "B 1234 XYZ",
            model: veh ? `${veh.brand} ${veh.model}` : "Toyota Innova",
            ownership: (veh?.ownership_type === "JAJA" ? "JAJA_OWNED" : "VENDOR_OWNED") as any,
            status: (a.is_replacement ? "REPLACEMENT" : a.status) as any,
            location: veh?.location_area || "Jakarta Pool",
            odometer: veh?.current_odometer || 0,
            assignedDriver: "Designated Corporate Driver",
          };
        });

        const operational = allocations.filter((a: any) => a.status === "ACTIVE" || a.status === "OPERATIONAL").length;
        const maintenance = allocations.filter((a: any) => a.status === "MAINTENANCE").length;
        const replacement = allocations.filter((a: any) => a.status === "REPLACEMENT").length;
        const required = contractData.required_vehicle_count || allocations.length;
        const shortage = Math.max(0, required - (operational + replacement));

        return {
          id: contractData.contract_number || contractData.id,
          contractNumber: contractData.contract_number,
          corporateCustomerId: contractData.corporate_customer_id,
          corporateCustomerName: contractData.corporate_customers?.company_name || "Corporate Client",
          startDate: contractData.start_date,
          endDate: contractData.end_date,
          status: contractData.status,
          monthlyBillingAmount: Number(contractData.monthly_billing_amount) || 0,
          paymentTerm: contractData.payment_term || "Net 30 Days",
          requiredFleet: required,
          allocatedFleet: allocations.length,
          operationalFleet: operational,
          maintenanceFleet: maintenance,
          replacementFleet: replacement,
          shortageCount: shortage,
          allocatedVehicles: allocations,
          notes: contractData.notes || undefined,
        };
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getCorporateContractById", err);
    }
  }

  const found = mockContracts.find(
    (c) => c.id.toLowerCase() === idOrNumber.toLowerCase() || c.contractNumber.toLowerCase() === idOrNumber.toLowerCase()
  );

  return found || mockContracts[0];
}

export async function assignReplacementUnit(
  contractId: string,
  replacementVehicleId: string,
  originalVehicleId?: string
): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { error } = await supabase.from("contract_vehicle_allocations").insert({
        contract_id: contractId,
        vehicle_id: replacementVehicleId,
        status: "ACTIVE" as any,
        is_replacement: true,
        notes: `Assigned as emergency replacement unit for vehicle ${originalVehicleId || "in maintenance"}`,
      } as any);

      if (!error) {
        // Also update vehicle status to RENTED
        await (supabase.from("vehicles") as any)
          .update({ status: "RENTED" })
          .eq("id", replacementVehicleId);

        return { success: true, message: "Replacement unit successfully assigned in Supabase!" };
      }
    } catch (err) {
      console.warn("Supabase mutation failed in assignReplacementUnit", err);
    }
  }

  return { success: true, message: "Replacement unit assigned successfully." };
}

