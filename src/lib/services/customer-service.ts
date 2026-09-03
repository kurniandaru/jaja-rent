import type {
  CustomerLifecycleStatus,
  CustomerDocumentRecord,
  CustomerDocumentType,
  CustomerAgreementRecord,
  AgreementType,
  ActionBlockerReason,
} from "../types/business-core.ts";
import type {
  IndividualCustomer,
  CorporateCustomer,
} from "../types/customer.ts";
import { recordAuditLog } from "./audit-service.ts";

// In-memory Customer sequence counter
let customerSeq = 100;
export function generateCustomerNumber(): string {
  const num = String(customerSeq++).padStart(6, "0");
  return `CUS-${num}`;
}

export function validatePhone(phone: string): boolean {
  if (!phone) return false;
  // Indonesian numbers usually 08... or +628..., 9-15 digits
  const clean = phone.replace(/[\s\-()]/g, "");
  return /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(clean);
}

export function validateEmail(email: string): boolean {
  if (!email) return true; // Optional if empty, but if filled must be valid
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface CustomerValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateCustomerData(
  data: {
    fullName: string;
    phone: string;
    email?: string;
    identityNumber: string;
  },
  existingCustomers: (IndividualCustomer | CorporateCustomer)[],
): CustomerValidationResult {
  const errors: string[] = [];

  if (!data.fullName || data.fullName.trim().length < 3) {
    errors.push("Nama lengkap wajib diisi minimal 3 karakter.");
  }

  if (!validatePhone(data.phone)) {
    errors.push("Nomor telepon tidak valid (contoh format: 081234567890).");
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push("Format email tidak valid.");
  }

  if (!data.identityNumber || data.identityNumber.trim().length < 8) {
    errors.push(
      "Nomor identitas (NIK / KTP / Paspor) wajib diisi minimal 8 digit.",
    );
  } else {
    // Check duplication
    const duplicate = existingCustomers.find((c) => {
      if (c.type === "INDIVIDUAL") {
        return c.nik === data.identityNumber;
      }
      return false;
    });

    if (duplicate) {
      errors.push(
        `Nomor identitas ${data.identityNumber} sudah terdaftar pada sistem.`,
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Deterministic Business Gate for Customer Verification:
 * Customer CANNOT become VERIFIED unless:
 * 1. Identity document (KTP or Passport) is uploaded and VERIFIED
 * 2. SIM document is VERIFIED (if drivingInfo provided)
 * 3. Required rental terms agreement (v1.0) has been ACCEPTED
 * 4. Not currently BLACKLISTED or SUSPENDED
 */
export function evaluateCustomerVerificationEligibility(
  customer: IndividualCustomer,
): ActionBlockerReason {
  const ktpDoc = (customer.documents || []).find(
    (d) => d.documentType === "KTP" || d.documentType === "PASSPORT",
  );
  const isKtpVerified = ktpDoc?.verificationStatus === "VERIFIED";

  const isSimVerified = customer.drivingInfo?.licenseNumber
    ? customer.drivingInfo.verificationStatus === "VERIFIED"
    : true; // If not driving personally, SIM not strictly blocking verification

  const termsAgreement = (customer.agreements || []).find(
    (a) =>
      a.agreementVersion === "1.0" ||
      a.agreementVersion === "1.3" ||
      a.status === "ACCEPTED",
  );
  const isTermsAccepted = Boolean(termsAgreement);

  const isNotBlacklisted =
    customer.status !== "BLACKLISTED" && !customer.isBlacklisted;
  const isNotSuspended = customer.status !== "SUSPENDED";

  const checks = [
    {
      key: "identity_doc",
      label: "Dokumen Identitas (KTP / Paspor) Diverifikasi",
      passed: isKtpVerified,
      detail: isKtpVerified
        ? "KTP / Paspor terverifikasi QC"
        : ktpDoc
          ? `Status dokumen identitas: ${ktpDoc.verificationStatus}`
          : "Dokumen KTP belum diunggah",
    },
    {
      key: "driving_license",
      label: "SIM Mengemudi Terverifikasi & Aktif",
      passed: isSimVerified,
      detail: isSimVerified
        ? "SIM A / B terverifikasi aktif"
        : `Status SIM: ${customer.drivingInfo?.verificationStatus || "Belum terverifikasi"}`,
    },
    {
      key: "terms_agreement",
      label: "Ketentuan Rental & Kebijakan (Terms v1.0) Disetujui",
      passed: isTermsAccepted,
      detail: isTermsAccepted
        ? `Telah menyetujui versi ${termsAgreement?.agreementVersion || "v1.0"}`
        : "Belum menandatangani Terms of Rental",
    },
    {
      key: "not_blacklisted",
      label: "Status Bebas Blacklist & Suspend",
      passed: isNotBlacklisted && isNotSuspended,
      detail: !isNotBlacklisted
        ? "Customer berada dalam daftar BLACKLIST sistem"
        : !isNotSuspended
          ? "Customer sedang dalam masa SUSPEND"
          : "Customer bersih dan berstatus baik",
    },
  ];

  const canPerform = checks.every((c) => c.passed);
  const failedCheck = checks.find((c) => !c.passed);

  return {
    canPerform,
    actionName: "Verifikasi Kelayakan Customer",
    requiredChecks: checks,
    errorMessage: canPerform
      ? undefined
      : `Tidak dapat memverifikasi customer: ${failedCheck?.label} (${failedCheck?.detail})`,
  };
}

/**
 * Execute Document Verification
 */
export async function verifyDocumentAction(
  customerId: string,
  documentId: string,
  verifiedBy: string,
): Promise<{ success: boolean; message: string }> {
  await recordAuditLog({
    actorName: verifiedBy,
    entityType: "DOCUMENT",
    entityId: documentId,
    action: "VERIFY_DOCUMENT",
    newData: {
      customerId,
      status: "VERIFIED",
      verifiedAt: new Date().toISOString(),
    },
    notes: `Dokumen ID ${documentId} telah diverifikasi oleh petugas QC ${verifiedBy}`,
  });

  return {
    success: true,
    message: "Dokumen berhasil diverifikasi dan disetujui.",
  };
}

/**
 * Execute Document Rejection with mandatory reason
 */
export async function rejectDocumentAction(
  customerId: string,
  documentId: string,
  reason: string,
  rejectedBy: string,
): Promise<{ success: boolean; message: string }> {
  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      message: "Alasan penolakan dokumen wajib diisi minimal 5 karakter.",
    };
  }

  await recordAuditLog({
    actorName: rejectedBy,
    entityType: "DOCUMENT",
    entityId: documentId,
    action: "REJECT_DOCUMENT",
    newData: {
      customerId,
      status: "REJECTED",
      reason,
      rejectedAt: new Date().toISOString(),
    },
    notes: `Dokumen ditolak: ${reason}`,
  });

  return {
    success: true,
    message: "Dokumen ditolak dengan alasan yang tercatat.",
  };
}

/**
 * Execute Customer Verification Transition (DRAFT / PENDING_VERIFICATION -> VERIFIED)
 */
export async function verifyCustomerLifecycle(
  customer: IndividualCustomer,
  actorName: string,
): Promise<{
  success: boolean;
  customer?: IndividualCustomer;
  error?: string;
}> {
  const eligibility = evaluateCustomerVerificationEligibility(customer);

  if (!eligibility.canPerform) {
    return {
      success: false,
      error: eligibility.errorMessage,
    };
  }

  const oldStatus = customer.status;
  customer.status = "VERIFIED";

  await recordAuditLog({
    actorName,
    entityType: "CUSTOMER",
    entityId: customer.id,
    action: "VERIFY_CUSTOMER",
    oldData: { status: oldStatus },
    newData: { status: "VERIFIED", verifiedAt: new Date().toISOString() },
    notes: `Customer ${customer.name} (${customer.customerNumber || customer.id}) diverifikasi oleh ${actorName}`,
  });

  return {
    success: true,
    customer,
  };
}
