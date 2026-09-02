import {
  AgreementVersion,
  AgreementAcceptanceRecord,
} from "../types/agreement";
import { mockAgreementVersions } from "../mock-data/agreements";

const cachedAgreements: AgreementVersion[] = [...mockAgreementVersions];

export async function getAgreementVersions(): Promise<AgreementVersion[]> {
  return cachedAgreements;
}

export async function getActiveAgreement(
  type: "B2C_RENTAL_TERMS" | "B2B_MASTER_SERVICE_AGREEMENT",
): Promise<AgreementVersion | null> {
  return (
    cachedAgreements.find((a) => a.agreementType === type && a.isActive) || null
  );
}
