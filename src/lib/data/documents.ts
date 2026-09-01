import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockDocuments } from "@/lib/mock-data/documents";
import { DocumentRecord } from "@/lib/types/operations";

export async function getVehicleDocuments(vehicleId?: string): Promise<DocumentRecord[]> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      let query = supabase
        .from("vehicle_documents")
        .select(`
          *,
          vehicles:vehicle_id(
            police_number,
            brand,
            model,
            ownership_type,
            vendors:vendor_id(name)
          )
        `)
        .order("expiry_date", { ascending: true });

      if (vehicleId) {
        query = query.eq("vehicle_id", vehicleId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const today = new Date();

        return data.map((d: any) => {
          const expiry = new Date(d.expiry_date);
          const diffTime = expiry.getTime() - today.getTime();
          const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" = "ACTIVE";
          if (daysUntil < 0) {
            status = "EXPIRED";
          } else if (daysUntil <= 30) {
            status = "EXPIRING_SOON";
          }

          const veh = d.vehicles;

          return {
            id: d.id,
            vehicleId: d.vehicle_id,
            plateNumber: veh?.police_number || "B 1234 XYZ",
            model: veh ? `${veh.brand} ${veh.model}` : "Toyota Innova",
            ownership: (veh?.ownership_type === "JAJA" ? "JAJA_OWNED" : "VENDOR_OWNED") as any,
            vendorName: veh?.vendors?.name || undefined,
            documentType: d.document_type,
            documentNumber: d.document_number,
            issuedDate: d.issued_date,
            expiryDate: d.expiry_date,
            daysUntilExpiry: daysUntil,
            status,
            costToRenew: Number(d.cost_to_renew) || undefined,
            notes: d.notes || undefined,
          };
        });
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getVehicleDocuments", err);
    }
  }

  if (vehicleId) {
    return mockDocuments.filter((d) => d.vehicleId === vehicleId || d.plateNumber === vehicleId);
  }

  return mockDocuments;
}

export async function getDocumentExpirySummary(): Promise<{
  expired: number;
  expires7Days: number;
  expires30Days: number;
  expires90Days: number;
  activeValid: number;
}> {
  const supabase = getSupabaseBrowserClient();

  if (supabase) {
    try {
      const { data, error } = await supabase.from("document_expiry_summary").select("*").maybeSingle();
      if (!error && data) {
        const summaryData = data as any;
        return {
          expired: Number(summaryData.expired) || 0,
          expires7Days: Number(summaryData.expires_7_days) || 0,
          expires30Days: Number(summaryData.expires_30_days) || 0,
          expires90Days: Number(summaryData.expires_90_days) || 0,
          activeValid: Number(summaryData.active_valid) || 0,
        };
      }
    } catch (err) {
      console.warn("Supabase fetch failed in getDocumentExpirySummary", err);
    }
  }

  return {
    expired: 2,
    expires7Days: 1,
    expires30Days: 8,
    expires90Days: 17,
    activeValid: 72,
  };
}

