import {
  mockIndividualCustomers,
  mockCorporateCustomers,
} from "@/lib/mock-data/customers";
import {
  IndividualCustomer,
  CorporateCustomer,
  CompanyInfo,
  CustomerLifecycleStatus,
  DocumentVerificationStatus,
  RentalEligibilityResult,
} from "@/lib/types/customer";
import { AgreementAcceptanceRecord } from "@/lib/types/agreement";
import { evaluateCustomerEligibility } from "@/lib/services/eligibility-engine";

let cachedIndividualCustomers: IndividualCustomer[] = [
  ...mockIndividualCustomers,
];
let cachedCorporateCustomers: CorporateCustomer[] = [...mockCorporateCustomers];

// In-memory / localStorage initialization
function initLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      const storedIndiv = localStorage.getItem("jaja_individual_customers_v2");
      if (storedIndiv) {
        const parsed = JSON.parse(storedIndiv);
        if (Array.isArray(parsed) && parsed.length > 0)
          cachedIndividualCustomers = parsed;
      }
      const storedCorp = localStorage.getItem("jaja_corporate_customers_v2");
      if (storedCorp) {
        const parsed = JSON.parse(storedCorp);
        if (Array.isArray(parsed) && parsed.length > 0)
          cachedCorporateCustomers = parsed;
      }
    } catch (e) {
      console.warn("Error loading customers from localStorage", e);
    }
  }
}

function persistLocalStorage() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        "jaja_individual_customers_v2",
        JSON.stringify(cachedIndividualCustomers),
      );
      localStorage.setItem(
        "jaja_corporate_customers_v2",
        JSON.stringify(cachedCorporateCustomers),
      );
    } catch (e) {
      console.warn(e);
    }
  }
}

export async function getIndividualCustomers(): Promise<IndividualCustomer[]> {
  initLocalStorage();
  return cachedIndividualCustomers;
}

export async function getCorporateCustomers(): Promise<CorporateCustomer[]> {
  initLocalStorage();
  return cachedCorporateCustomers;
}

export async function getIndividualCustomerById(
  id: string,
): Promise<IndividualCustomer | null> {
  initLocalStorage();
  return (
    cachedIndividualCustomers.find(
      (c) => c.id.toLowerCase() === id.toLowerCase(),
    ) || null
  );
}

export async function getCorporateCustomerById(
  id: string,
): Promise<CorporateCustomer | null> {
  initLocalStorage();
  return (
    cachedCorporateCustomers.find(
      (c) => c.id.toLowerCase() === id.toLowerCase(),
    ) || null
  );
}

export async function getCustomerById(
  id: string,
): Promise<{
  customer: IndividualCustomer | CorporateCustomer;
  type: "INDIVIDUAL" | "CORPORATE";
} | null> {
  initLocalStorage();
  const indiv = cachedIndividualCustomers.find(
    (c) => c.id.toLowerCase() === id.toLowerCase(),
  );
  if (indiv) return { customer: indiv, type: "INDIVIDUAL" };

  const corp = cachedCorporateCustomers.find(
    (c) => c.id.toLowerCase() === id.toLowerCase(),
  );
  if (corp) return { customer: corp, type: "CORPORATE" };

  return null;
}

export async function createIndividualCustomer(
  data: Partial<IndividualCustomer> & { name: string; phone: string },
): Promise<IndividualCustomer> {
  initLocalStorage();
  const newCustomer: IndividualCustomer = {
    id: `CUST-${Date.now().toString().slice(-4)}`,
    type: "INDIVIDUAL",
    name: data.name,
    nik: data.nik || "3174000000000000",
    phone: data.phone,
    email:
      data.email || `${data.name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
    dateOfBirth: data.dateOfBirth || "1990-01-01",
    address: data.address || "Jakarta",
    city: data.city || "Jakarta Selatan",
    province: data.province || "DKI Jakarta",
    postalCode: data.postalCode,
    status: data.status || "SUBMITTED",
    joinedDate: new Date().toISOString().split("T")[0],
    totalRentalsCount: 0,
    activeRentalsCount: 0,
    drivingInfo: data.drivingInfo || {
      licenseNumber: "SIM-A-PENDING",
      licenseType: "SIM_A",
      licenseExpiry: "2029-01-01",
      verificationStatus: "PENDING",
    },
    emergencyContact: data.emergencyContact || {
      name: "Kontak Darurat",
      relationship: "FAMILY",
      phone: data.phone,
    },
    documents: data.documents || [
      {
        id: `DOC-${Date.now()}-KTP`,
        documentType: "KTP",
        documentName: "KTP Elektronik",
        documentNumber: data.nik || "3174000000000000",
        isRequired: true,
        verificationStatus: "PENDING",
      },
      {
        id: `DOC-${Date.now()}-SIM`,
        documentType: "SIM",
        documentName: "Surat Izin Mengemudi (SIM A)",
        documentNumber: data.drivingInfo?.licenseNumber || "SIM-A-PENDING",
        expiryDate: data.drivingInfo?.licenseExpiry || "2029-01-01",
        isRequired: true,
        verificationStatus: "PENDING",
      },
    ],
    agreements: data.agreements || [],
  };

  cachedIndividualCustomers = [newCustomer, ...cachedIndividualCustomers];
  persistLocalStorage();
  return newCustomer;
}

export async function createCorporateCustomer(
  data: Partial<CorporateCustomer> & { name: string },
): Promise<CorporateCustomer> {
  initLocalStorage();
  const companyInfo: CompanyInfo = data.companyInfo || {
    name: data.name,
    legalName: data.name,
    entityType: "PT",
    npwp: "01.234.567.8-000.000",
    nib: "9120000000000",
    address: "Jakarta",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    industry: "Consumer Goods / General",
  };

  const newCustomer: CorporateCustomer = {
    id: `CORP-${Date.now().toString().slice(-4)}`,
    type: "CORPORATE",
    name: data.name,
    companyInfo,
    pic: data.pic || {
      name: "PIC Operasional",
      role: "Head of GA & Fleet",
      phone: "+62 812-0000-0000",
      email: "pic@company.com",
    },
    billingInfo: data.billingInfo || {
      billingContactName: "Finance AP",
      billingEmail: "finance@company.com",
      billingPhone: "+62 21-000-0000",
      billingAddress: "Alamat Kantor",
      paymentTermDays: 30,
    },
    status: data.status || "SUBMITTED",
    joinedDate: new Date().toISOString().split("T")[0],
    activeContractsCount: 0,
    totalAllocatedVehicles: 0,
    operationalVehicles: 0,
    maintenanceVehicles: 0,
    documents: data.documents || [
      {
        id: `DOC-${Date.now()}-NIB`,
        documentType: "NIB",
        documentName: "Nomor Induk Berusaha (NIB)",
        documentNumber: companyInfo.nib || "9120000000000",
        isRequired: true,
        verificationStatus: "PENDING",
      },
      {
        id: `DOC-${Date.now()}-NPWP`,
        documentType: "NPWP",
        documentName: "NPWP Badan Usaha",
        documentNumber: companyInfo.npwp || "01.234.567.8-000.000",
        isRequired: true,
        verificationStatus: "PENDING",
      },
      {
        id: `DOC-${Date.now()}-AKTA`,
        documentType: "AKTA_PENDIRIAN",
        documentName: "Akta Pendirian",
        documentNumber: "AHU-PENDING",
        isRequired: true,
        verificationStatus: "PENDING",
      },
      {
        id: `DOC-${Date.now()}-KTPPIC`,
        documentType: "KTP_PIC",
        documentName: "KTP PIC Pengurus",
        documentNumber: "3174000000000000",
        isRequired: true,
        verificationStatus: "PENDING",
      },
    ],
    agreements: data.agreements || [],
  };

  cachedCorporateCustomers = [newCustomer, ...cachedCorporateCustomers];
  persistLocalStorage();
  return newCustomer;
}

export async function updateCustomerLifecycleStatus(
  customerId: string,
  newStatus: CustomerLifecycleStatus,
  reviewNotes?: string,
): Promise<{ success: boolean; message: string }> {
  initLocalStorage();
  const indivIdx = cachedIndividualCustomers.findIndex(
    (c) => c.id === customerId,
  );
  if (indivIdx >= 0) {
    cachedIndividualCustomers[indivIdx].status = newStatus;
    if (reviewNotes)
      cachedIndividualCustomers[indivIdx].reviewNotes = reviewNotes;
    persistLocalStorage();
    return {
      success: true,
      message: `Status customer berhasil diubah ke ${newStatus}`,
    };
  }

  const corpIdx = cachedCorporateCustomers.findIndex(
    (c) => c.id === customerId,
  );
  if (corpIdx >= 0) {
    cachedCorporateCustomers[corpIdx].status = newStatus;
    if (reviewNotes)
      cachedCorporateCustomers[corpIdx].reviewNotes = reviewNotes;
    persistLocalStorage();
    return {
      success: true,
      message: `Status corporate customer berhasil diubah ke ${newStatus}`,
    };
  }

  return { success: false, message: "Customer tidak ditemukan" };
}

export async function verifyCustomerDocument(
  customerId: string,
  documentId: string,
  status: DocumentVerificationStatus,
  verifiedBy: string,
  rejectionReason?: string,
): Promise<{ success: boolean; message: string }> {
  initLocalStorage();
  const todayStr = new Date().toISOString().split("T")[0];

  const indiv = cachedIndividualCustomers.find((c) => c.id === customerId);
  if (indiv) {
    const doc = indiv.documents.find((d) => d.id === documentId);
    if (doc) {
      doc.verificationStatus = status;
      doc.verifiedBy = verifiedBy;
      doc.verifiedDate = todayStr;
      if (rejectionReason) doc.rejectionReason = rejectionReason;

      // If verifying SIM, sync with drivingInfo
      if (doc.documentType === "SIM" && indiv.drivingInfo) {
        indiv.drivingInfo.verificationStatus = status;
      }

      // Check if all required docs are verified to promote status to APPROVED
      const allRequiredVerified = indiv.documents
        .filter((d) => d.isRequired)
        .every((d) => d.verificationStatus === "VERIFIED");

      if (
        allRequiredVerified &&
        (indiv.status === "DOCUMENT_REVIEW" || indiv.status === "SUBMITTED")
      ) {
        indiv.status = "APPROVED";
      }

      persistLocalStorage();
      return {
        success: true,
        message: `Dokumen ${doc.documentName} telah diubah menjadi ${status}`,
      };
    }
  }

  const corp = cachedCorporateCustomers.find((c) => c.id === customerId);
  if (corp) {
    const doc = corp.documents.find((d) => d.id === documentId);
    if (doc) {
      doc.verificationStatus = status;
      doc.verifiedBy = verifiedBy;
      doc.verifiedDate = todayStr;
      if (rejectionReason) doc.rejectionReason = rejectionReason;

      // Check if all required docs are verified
      const allRequiredVerified = corp.documents
        .filter((d) => d.isRequired)
        .every((d) => d.verificationStatus === "VERIFIED");

      if (
        allRequiredVerified &&
        (corp.status === "DOCUMENT_REVIEW" || corp.status === "SUBMITTED")
      ) {
        corp.status = "APPROVED";
      }

      persistLocalStorage();
      return {
        success: true,
        message: `Dokumen ${doc.documentName} telah diubah menjadi ${status}`,
      };
    }
  }

  return { success: false, message: "Dokumen tidak ditemukan" };
}

export async function recordAgreementAcceptance(
  customerId: string,
  acceptance: Omit<AgreementAcceptanceRecord, "id" | "acceptedAt">,
): Promise<{ success: boolean; data?: AgreementAcceptanceRecord }> {
  initLocalStorage();
  const record: AgreementAcceptanceRecord = {
    ...acceptance,
    id: `ACC-${Date.now().toString().slice(-4)}`,
    acceptedAt: new Date().toISOString(),
    status: "ACCEPTED",
  };

  const indiv = cachedIndividualCustomers.find((c) => c.id === customerId);
  if (indiv) {
    indiv.agreements = [record, ...(indiv.agreements || [])];
    if (indiv.status === "APPROVED") {
      indiv.status = "ACTIVE"; // Fully active upon agreement acceptance!
    }
    persistLocalStorage();
    return { success: true, data: record };
  }

  const corp = cachedCorporateCustomers.find((c) => c.id === customerId);
  if (corp) {
    corp.agreements = [record, ...(corp.agreements || [])];
    if (corp.status === "APPROVED") {
      corp.status = "ACTIVE";
    }
    persistLocalStorage();
    return { success: true, data: record };
  }

  return { success: false };
}

export async function checkCustomerEligibility(
  customerId: string,
): Promise<RentalEligibilityResult> {
  initLocalStorage();
  const found = await getCustomerById(customerId);
  if (!found) {
    return {
      isEligible: false,
      status: "BLOCKED",
      summaryTitle: "Customer Tidak Ditemukan",
      summaryMessage: `ID customer ${customerId} tidak ditemukan dalam database.`,
      reasons: ["Customer tidak terdaftar di sistem."],
      passedChecks: [],
      blockingChecks: [],
      checkedAt: new Date().toISOString(),
    };
  }

  return evaluateCustomerEligibility(found.customer);
}
