import {
  IndividualCustomer,
  CorporateCustomer,
  RentalEligibilityResult,
  EligibilityCheckItem,
} from "../types/customer";
import { mockAgreementVersions } from "../mock-data/agreements";

/**
 * Deterministic Rental Eligibility Evaluation Engine.
 * Evaluates real-time compliance gate before allowing any reservation or rental transaction.
 */
export function evaluateCustomerEligibility(
  customer: IndividualCustomer | CorporateCustomer
): RentalEligibilityResult {
  const isIndividual = customer.type === "INDIVIDUAL";
  const passedChecks: EligibilityCheckItem[] = [];
  const blockingChecks: EligibilityCheckItem[] = [];
  const reasons: string[] = [];

  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Check Customer Lifecycle Status
  if (customer.status === "ACTIVE" || customer.status === "APPROVED") {
    passedChecks.push({
      key: "lifecycle_status",
      label: "Status Akun Pelanggan",
      passed: true,
      severity: "INFO",
      detail: `Akun berstatus ${customer.status} (Terdaftar & Terverifikasi)`,
    });
  } else {
    const isRevision = customer.status === "NEED_REVISION";
    const isReview = customer.status === "DOCUMENT_REVIEW" || customer.status === "SUBMITTED";
    const detailMsg = isRevision
      ? "Customer perlu merevisi data/dokumen sebelum dapat bertransaksi."
      : isReview
      ? "Customer masih dalam tahap peninjauan dokumen KYC (Review Pending)."
      : customer.status === "DRAFT"
      ? "Pendaftaran customer belum disubmit (Draft)."
      : `Akun customer berstatus ${customer.status}.`;

    blockingChecks.push({
      key: "lifecycle_status",
      label: "Status Akun Pelanggan",
      passed: false,
      severity: "CRITICAL",
      detail: detailMsg,
    });
    reasons.push(detailMsg);
  }

  // 2. Check Blacklist & Suspensions
  if (customer.isBlacklisted) {
    const msg = `Customer masuk dalam daftar hitam (Blacklist): ${customer.blacklistReason || "Risiko Fraud / Pelanggaran Berat"}`;
    blockingChecks.push({
      key: "blacklist_check",
      label: "Pemeriksaan Daftar Hitam (Blacklist)",
      passed: false,
      severity: "CRITICAL",
      detail: msg,
    });
    reasons.push(msg);
  } else if (customer.status === "SUSPENDED") {
    const msg = "Akun customer sedang ditangguhkan (Suspended) sementara waktu.";
    blockingChecks.push({
      key: "suspension_check",
      label: "Status Penangguhan Akun",
      passed: false,
      severity: "CRITICAL",
      detail: msg,
    });
    reasons.push(msg);
  } else {
    passedChecks.push({
      key: "risk_check",
      label: "Status Keamanan & Risiko",
      passed: true,
      severity: "INFO",
      detail: "Bersih dari blacklist dan penangguhan.",
    });
  }

  // 3. Check Outstanding Invoices / Financial Blockers
  if (customer.hasUnpaidInvoices) {
    const msg = "Customer memiliki invoice tagihan yang tertunggak melebihi batas jatuh tempo.";
    blockingChecks.push({
      key: "financial_check",
      label: "Status Tagihan Finansial",
      passed: false,
      severity: "CRITICAL",
      detail: msg,
    });
    reasons.push(msg);
  } else {
    passedChecks.push({
      key: "financial_check",
      label: "Status Tagihan Finansial",
      passed: true,
      severity: "INFO",
      detail: "Tidak ada tunggakan pembayaran jatuh tempo.",
    });
  }

  // 4. Check Required KYC Documents
  const requiredDocs = (customer.documents || []).filter((d) => d.isRequired);
  if (requiredDocs.length === 0) {
    const msg = "Belum ada dokumen KYC wajib yang diunggah oleh customer.";
    blockingChecks.push({
      key: "documents_missing",
      label: "Kelengkapan Dokumen KYC",
      passed: false,
      severity: "CRITICAL",
      detail: msg,
    });
    reasons.push(msg);
  } else {
    let allDocsVerified = true;
    for (const doc of requiredDocs) {
      if (doc.verificationStatus !== "VERIFIED") {
        allDocsVerified = false;
        const msg = `Dokumen ${doc.documentName} belum terverifikasi (Status: ${doc.verificationStatus}).`;
        blockingChecks.push({
          key: `doc_${doc.id}`,
          label: `Verifikasi ${doc.documentName}`,
          passed: false,
          severity: "CRITICAL",
          detail: msg,
        });
        reasons.push(msg);
      } else if (doc.expiryDate && doc.expiryDate < todayStr) {
        allDocsVerified = false;
        const msg = `Dokumen ${doc.documentName} telah kedaluwarsa pada ${doc.expiryDate}.`;
        blockingChecks.push({
          key: `doc_exp_${doc.id}`,
          label: `Masa Berlaku ${doc.documentName}`,
          passed: false,
          severity: "CRITICAL",
          detail: msg,
        });
        reasons.push(msg);
      }
    }

    if (allDocsVerified) {
      passedChecks.push({
        key: "documents_verified",
        label: "Kelengkapan Dokumen KYC",
        passed: true,
        severity: "INFO",
        detail: `Seluruh ${requiredDocs.length} dokumen legal wajib telah terverifikasi dan masih berlaku.`,
      });
    }
  }

  // 5. Special Check for Individual Driving License Expiry
  if (isIndividual) {
    const indiv = customer as IndividualCustomer;
    if (indiv.drivingInfo) {
      if (indiv.drivingInfo.licenseExpiry && indiv.drivingInfo.licenseExpiry < todayStr) {
        const msg = `SIM ${indiv.drivingInfo.licenseType.replace("_", " ")} telah kedaluwarsa pada ${indiv.drivingInfo.licenseExpiry}.`;
        blockingChecks.push({
          key: "sim_expired",
          label: "Masa Berlaku SIM Pengemudi",
          passed: false,
          severity: "CRITICAL",
          detail: msg,
        });
        reasons.push(msg);
      } else if (indiv.drivingInfo.verificationStatus !== "VERIFIED") {
        const msg = "Data SIM belum diverifikasi keabsahannya.";
        blockingChecks.push({
          key: "sim_unverified",
          label: "Verifikasi SIM Pengemudi",
          passed: false,
          severity: "CRITICAL",
          detail: msg,
        });
        reasons.push(msg);
      } else {
        passedChecks.push({
          key: "sim_valid",
          label: "Masa Berlaku SIM Pengemudi",
          passed: true,
          severity: "INFO",
          detail: `SIM valid s/d ${indiv.drivingInfo.licenseExpiry}.`,
        });
      }
    }
  }

  // 6. Check Latest Agreement Version Acceptance
  const targetAgreementType = isIndividual
    ? "B2C_RENTAL_TERMS"
    : "B2B_MASTER_SERVICE_AGREEMENT";

  const activeAgreement = mockAgreementVersions.find(
    (a) => a.agreementType === targetAgreementType && a.isActive
  );

  const activeVersion = activeAgreement?.version || (isIndividual ? "1.3" : "2.0");

  const hasAcceptedActiveVersion = (customer.agreements || []).some(
    (acc) =>
      acc.agreementType === targetAgreementType &&
      acc.agreementVersion === activeVersion &&
      acc.status === "ACCEPTED"
  );

  if (hasAcceptedActiveVersion) {
    passedChecks.push({
      key: "agreement_accepted",
      label: `Persetujuan Syarat & Ketentuan (v${activeVersion})`,
      passed: true,
      severity: "INFO",
      detail: `Customer telah menyetujui ${activeAgreement?.title || "Syarat & Ketentuan"} Versi ${activeVersion}.`,
    });
  } else {
    const msg = `Customer belum menyetujui ${activeAgreement?.title || "Syarat & Ketentuan"} versi terbaru (Versi ${activeVersion} berlaku efektif ${activeAgreement?.effectiveDate || "1 Sep 2026"}).`;
    blockingChecks.push({
      key: "agreement_missing",
      label: `Persetujuan Syarat & Ketentuan (v${activeVersion})`,
      passed: false,
      severity: "CRITICAL",
      detail: msg,
    });
    reasons.push(msg);
  }

  // Determine Overall Status
  const isEligible = blockingChecks.length === 0;
  let status: RentalEligibilityResult["status"] = "ELIGIBLE";

  if (!isEligible) {
    if (
      customer.status === "DRAFT" ||
      customer.status === "DOCUMENT_REVIEW" ||
      customer.status === "SUBMITTED" ||
      customer.status === "NEED_REVISION"
    ) {
      status = "DOCUMENT_INCOMPLETE";
    } else {
      status = "BLOCKED";
    }
  }

  return {
    isEligible,
    status,
    summaryTitle: isEligible
      ? "Customer Memenuhi Seluruh Syarat Rental (Eligible)"
      : status === "DOCUMENT_INCOMPLETE"
      ? "Verifikasi Dokumen & Data Belum Lengkap"
      : "Customer Tidak Memenuhi Syarat Rental (Blocked)",
    summaryMessage: isEligible
      ? "Semua dokumen legalitas telah terverifikasi, T&C versi aktif telah disetujui, dan akun aktif tanpa catatan penangguhan."
      : `Ditemukan ${blockingChecks.length} kendala yang menghalangi customer untuk melakukan reservasi atau rental saat ini.`,
    reasons,
    passedChecks,
    blockingChecks,
    checkedAt: new Date().toISOString(),
  };
}
