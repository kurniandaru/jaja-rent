export interface AgreementClause {
  id: string;
  key: string;
  title: string;
  content: string;
  isRequired: boolean;
}

export interface AgreementVersion {
  id: string; // e.g. "AGR-B2C-V1.3"
  agreementType: "B2C_RENTAL_TERMS" | "B2B_MASTER_SERVICE_AGREEMENT";
  title: string;
  version: string; // e.g. "1.3"
  effectiveDate: string; // e.g. "2026-09-01"
  summary: string;
  clauses: AgreementClause[];
  isActive: boolean;
}

export interface AgreementAcceptanceRecord {
  id: string; // e.g. "ACC-2026-001"
  customerId: string;
  agreementId: string;
  agreementType: "B2C_RENTAL_TERMS" | "B2B_MASTER_SERVICE_AGREEMENT";
  agreementVersion: string; // e.g. "1.3"
  acceptedAt: string; // ISO string
  acceptedBy: string; // Individual name or PIC name
  acceptedByRole?: string; // e.g. "Penyewa Perorangan" or "Head of GA & Procurement"
  acceptedByPhone?: string;
  acceptedByEmail?: string;
  ipAddress: string;
  userAgent?: string;
  status: "ACCEPTED" | "REVOKED";
  acceptedClauses: string[]; // List of clause IDs accepted
  digitalConsentNote?: string;
}
