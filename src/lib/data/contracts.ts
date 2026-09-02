import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { mockContracts } from "@/lib/mock-data/contracts";
import { CorporateContract, ContractVehicleAllocation } from "@/lib/types/corporate";

let cachedContracts: CorporateContract[] = [...mockContracts];

function initLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("jaja_contracts");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) cachedContracts = parsed;
      }
    } catch (e) {
      console.warn("Error loading contracts from localStorage", e);
    }
  }
}

function persistLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("jaja_contracts", JSON.stringify(cachedContracts));
    } catch (e) {
      console.warn(e);
    }
  }
}

export async function getCorporateContracts(): Promise<CorporateContract[]> {
  initLocalStorage();
  return cachedContracts;
}

export const getContracts = getCorporateContracts;

export async function getCorporateContractById(idOrNumber: string): Promise<CorporateContract | null> {
  initLocalStorage();
  const found = cachedContracts.find(
    (c) =>
      c.id.toLowerCase() === idOrNumber.toLowerCase() ||
      c.contractNumber.toLowerCase() === idOrNumber.toLowerCase()
  );
  return found || null;
}

export const getContractById = getCorporateContractById;

export async function saveCorporateContract(
  contract: CorporateContract
): Promise<{ success: boolean; data: CorporateContract }> {
  initLocalStorage();
  const existingIdx = cachedContracts.findIndex(
    (c) => c.id === contract.id || c.contractNumber === contract.contractNumber
  );

  if (existingIdx >= 0) {
    cachedContracts[existingIdx] = {
      ...contract,
      updatedAt: new Date().toISOString().split("T")[0],
    };
  } else {
    cachedContracts = [contract, ...cachedContracts];
  }

  persistLocalStorage();
  return { success: true, data: contract };
}

export async function allocateVehicleToContract(
  contractId: string,
  allocation: Omit<ContractVehicleAllocation, "id" | "contractId">
): Promise<{ success: boolean; data?: ContractVehicleAllocation }> {
  initLocalStorage();
  const contract = cachedContracts.find((c) => c.id === contractId || c.contractNumber === contractId);
  if (!contract) return { success: false };

  const newAlloc: ContractVehicleAllocation = {
    ...allocation,
    id: `ALLOC-${Date.now().toString().slice(-4)}`,
    contractId: contract.id,
  };

  contract.allocatedVehicles = [...(contract.allocatedVehicles || []), newAlloc];
  contract.allocatedFleet = contract.allocatedVehicles.length;
  contract.operationalFleet = contract.allocatedVehicles.filter(
    (v) => v.status === "OPERATIONAL" || v.status === "ACTIVE" as any
  ).length;
  contract.shortageCount = Math.max(0, contract.requiredFleet - contract.operationalFleet);

  persistLocalStorage();
  return { success: true, data: newAlloc };
}

export async function assignReplacementUnit(
  contractId: string,
  replacementVehicleId: string,
  originalVehicleId?: string
): Promise<{ success: boolean; message: string }> {
  initLocalStorage();
  const contract = cachedContracts.find((c) => c.id === contractId || c.contractNumber === contractId);
  if (contract) {
    contract.replacementFleet += 1;
    contract.shortageCount = Math.max(0, contract.shortageCount - 1);
    persistLocalStorage();
  }

  return { success: true, message: "Replacement unit assigned successfully." };
}
