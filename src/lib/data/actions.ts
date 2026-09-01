import { mockActionRequired } from "@/lib/mock-data/actions";
import { ActionRequiredItem } from "@/lib/types/operations";

export async function getActionRequiredItems(): Promise<ActionRequiredItem[]> {
  return mockActionRequired;
}

