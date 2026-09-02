import { AgreementAcceptanceRecord } from "./agreement";

export type CustomerLifecycleStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "DOCUMENT_REVIEW"
  | "NEED_REVISION"
  | "APPROVED"
  | "ACTIVE"
  | "SUSPENDED"
  | "BLACKLISTED";

export type CustomerDocumentType =
  | "KTP"
  | "SIM"
  | "PASSPORT"
  | "NPWP"
  | "NIB"
  | "AKTA_PENDIRIAN"
  | "AKTA_PERUBAHAN"
  | "SURAT_KUASA_PIC"
  | "KTP_PIC"
  | "COMPANY_PROFILE"
  | "OTHER_SUPPORTING";

export type DocumentVerificationStatus =
  | "PENDING"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED"
  | "NEED_REVISION";

export interface CustomerDocument {
  id: string; // e.g. "DOC-KTP-001"
  documentType: CustomerDocumentType;
  documentName: string; // Label display
  documentNumber: string;
  issueDate?: string;
  expiryDate?: string; // If applicable (e.g. SIM expiry)
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  isRequired: boolean;
  verificationStatus: DocumentVerificationStatus;
  verifiedBy?: string;
  verifiedDate?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface DrivingInfo {
  licenseNumber: string;
  licenseType: "SIM_A" | "SIM_B1" | "SIM_B2" | "INTERNATIONAL";
  licenseExpiry: string; // e.g. "2027-08-19"
  yearsOfExperience?: number;
  verificationStatus: DocumentVerificationStatus;
}

export interface EmergencyContact {
  name: string;
  relationship: "FAMILY" | "SPOUSE" | "COLLEAGUE" | "PARENT" | "OTHER";
  phone: string;
  address?: string;
}

export interface CompanyInfo {
  name: string; // Trading / Brand name
  legalName: string; // Legal entity name (e.g. PT ABC Indonesia)
  entityType: "PT" | "CV" | "YAYASAN" | "BUMN" | "KOPERASI" | "FOREIGN_REP";
  npwp: string;
  nib: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  website?: string;
  industry: string;
}

export interface PicInfo {
  name: string;
  role: string;
  phone: string;
  email: string;
  idCardNumber?: string;
  powerOfAttorneyRef?: string; // Nomor Surat Kuasa
}

export interface BillingInfo {
  billingContactName: string;
  billingEmail: string;
  billingPhone: string;
  billingAddress: string;
  billingNpwp?: string;
  paymentTermDays: number; // e.g. 30, 45
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankName?: string;
}

export type RentalEligibilityStatus =
  | "ELIGIBLE"
  | "CONDITIONALLY_ELIGIBLE"
  | "BLOCKED"
  | "DOCUMENT_INCOMPLETE";

export interface EligibilityCheckItem {
  key: string;
  label: string;
  passed: boolean;
  severity: "CRITICAL" | "WARNING" | "INFO";
  detail: string;
}

export interface RentalEligibilityResult {
  isEligible: boolean;
  status: RentalEligibilityStatus;
  summaryTitle: string;
  summaryMessage: string;
  reasons: string[];
  passedChecks: EligibilityCheckItem[];
  blockingChecks: EligibilityCheckItem[];
  checkedAt: string;
}

export interface IndividualCustomer {
  id: string; // e.g. "CUST-001"
  type: "INDIVIDUAL";
  name: string;
  nik: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;

  // Structured Sections
  drivingInfo: DrivingInfo;
  emergencyContact: EmergencyContact;
  documents: CustomerDocument[];
  agreements: AgreementAcceptanceRecord[];

  // Lifecycle & Operational Status
  status: CustomerLifecycleStatus;
  joinedDate: string;
  reviewNotes?: string;
  hasUnpaidInvoices?: boolean;
  isBlacklisted?: boolean;
  blacklistReason?: string;

  // Activity stats
  totalRentalsCount: number;
  activeRentalsCount: number;
}

export interface CorporateCustomer {
  id: string; // e.g. "CORP-001"
  type: "CORPORATE";
  name: string; // Shortcut company name
  
  // Structured Sections
  companyInfo: CompanyInfo;
  pic: PicInfo;
  billingInfo: BillingInfo;
  documents: CustomerDocument[];
  agreements: AgreementAcceptanceRecord[];

  // Lifecycle & Operational Status
  status: CustomerLifecycleStatus;
  joinedDate: string;
  reviewNotes?: string;
  hasUnpaidInvoices?: boolean;
  isBlacklisted?: boolean;
  blacklistReason?: string;

  // Contracts & Fleet Stats
  activeContractsCount: number;
  totalAllocatedVehicles: number;
  operationalVehicles: number;
  maintenanceVehicles: number;
}
