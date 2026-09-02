"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  getCustomerById,
  updateCustomerLifecycleStatus,
} from "@/lib/data/customers";
import {
  IndividualCustomer,
  CorporateCustomer,
  CustomerDocument,
  CustomerLifecycleStatus,
} from "@/lib/types/customer";
import { evaluateCustomerEligibility } from "@/lib/services/eligibility-engine";
import { EligibilityBadge } from "@/components/customers/eligibility-badge";
import { KycDocumentViewer } from "@/components/customers/kyc-document-viewer";
import { AgreementAcceptanceModal } from "@/components/customers/agreement-acceptance-modal";
import {
  User,
  Building2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileCheck2,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ExternalLink,
  Plus,
  RefreshCw,
  Ban,
  Check,
} from "lucide-react";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [customer, setCustomer] = React.useState<IndividualCustomer | CorporateCustomer | null>(null);
  const [customerType, setCustomerType] = React.useState<"INDIVIDUAL" | "CORPORATE">("INDIVIDUAL");
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"profile" | "documents" | "agreements" | "eligibility">("profile");

  // Modals
  const [isDocViewerOpen, setIsDocViewerOpen] = React.useState(false);
  const [selectedDocToReview, setSelectedDocToReview] = React.useState<CustomerDocument | null>(null);
  const [isAgreementModalOpen, setIsAgreementModalOpen] = React.useState(false);

  const loadCustomer = React.useCallback(async () => {
    setIsLoading(true);
    if (customerId) {
      const result = await getCustomerById(customerId);
      if (result) {
        setCustomer(result.customer);
        setCustomerType(result.type);
      }
    }
    setIsLoading(false);
  }, [customerId]);

  React.useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-neutral-400">
        Memuat data KYC customer...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-neutral-800">Customer tidak ditemukan</p>
        <Link href="/corporate/customers">
          <Button variant="outline" size="sm" className="text-xs">
            Kembali ke Daftar Customer
          </Button>
        </Link>
      </div>
    );
  }

  const isIndividual = customerType === "INDIVIDUAL";
  const indiv = isIndividual ? (customer as IndividualCustomer) : null;
  const corp = !isIndividual ? (customer as CorporateCustomer) : null;
  const eligibility = evaluateCustomerEligibility(customer);

  const handleStatusChange = async (newStatus: CustomerLifecycleStatus, notes?: string) => {
    await updateCustomerLifecycleStatus(customer.id, newStatus, notes);
    await loadCustomer();
  };

  const getLifecycleBadge = (status: CustomerLifecycleStatus) => {
    switch (status) {
      case "ACTIVE":
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">ACTIVE</span>;
      case "APPROVED":
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">APPROVED</span>;
      case "DOCUMENT_REVIEW":
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">DOC REVIEW</span>;
      case "NEED_REVISION":
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300">NEED REVISION</span>;
      case "SUBMITTED":
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">SUBMITTED</span>;
      case "SUSPENDED":
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">SUSPENDED</span>;
      case "BLACKLISTED":
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-900 text-white">BLACKLISTED</span>;
      default:
        return <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600">DRAFT</span>;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/corporate/customers"
              className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Customer Master
            </Link>
            <span className="text-neutral-300">/</span>
            <span className="text-xs font-mono font-bold text-neutral-700">{customer.id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              {customer.name}
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
              {isIndividual ? "B2C Individual" : "B2B Corporate"}
            </span>
            {getLifecycleBadge(customer.status)}
            <EligibilityBadge eligibility={eligibility} size="md" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {customer.status === "DOCUMENT_REVIEW" || customer.status === "SUBMITTED" ? (
            <Button
              size="sm"
              onClick={() => handleStatusChange("APPROVED")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1 shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approve KYC Customer
            </Button>
          ) : null}

          {customer.status === "APPROVED" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("ACTIVE")}
              className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold gap-1 shadow-xs"
            >
              <Check className="h-3.5 w-3.5" />
              Aktifkan Akun Customer
            </Button>
          )}

          {customer.status === "ACTIVE" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("SUSPENDED", "Ditangguhkan manual oleh operasional.")}
              className="text-xs font-bold text-rose-700 border-rose-300 hover:bg-rose-50"
            >
              <Ban className="h-3.5 w-3.5" />
              Suspend Akun
            </Button>
          )}

          {customer.status === "SUSPENDED" && (
            <Button
              size="sm"
              onClick={() => handleStatusChange("ACTIVE")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              Pulihkan Akun (Reactivate)
            </Button>
          )}

          <Link href={`/operations/reservations/new`}>
            <Button
              size="sm"
              disabled={!eligibility.isEligible}
              className={`text-xs font-bold gap-1 ${
                eligibility.isEligible
                  ? "bg-primary text-primary-foreground"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              Buat Reservasi
            </Button>
          </Link>
        </div>
      </div>

      {/* Review Notes or Warnings Banner */}
      {customer.reviewNotes && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Catatan Peninjauan KYC:</strong>
            <p className="mt-0.5 text-amber-800">{customer.reviewNotes}</p>
          </div>
        </div>
      )}

      {customer.isBlacklisted && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs flex items-start gap-2.5">
          <ShieldX className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Akun Terdaftar Dalam Blacklist:</strong>
            <p className="mt-0.5 text-rose-800">{customer.blacklistReason}</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 max-w-2xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          1. Profil & Identitas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "documents"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          2. Dokumen KYC ({customer.documents?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("agreements")}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "agreements"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          3. Agreement T&C ({customer.agreements?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("eligibility")}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "eligibility"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          4. Rental Eligibility
        </button>
      </div>

      {/* TAB 1: Profile & Structured Info */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isIndividual && indiv ? (
            <>
              {/* Identity Details */}
              <Card className="border-neutral-200 shadow-xs text-xs">
                <CardHeader className="p-4 border-b border-neutral-100">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" />
                    Data Identitas Diri (Identity)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Nama Lengkap:</span>
                    <strong className="text-neutral-900">{indiv.name}</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Nomor NIK KTP:</span>
                    <strong className="font-mono text-neutral-900">{indiv.nik}</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Nomor WhatsApp/HP:</span>
                    <span className="text-neutral-900 font-semibold">{indiv.phone}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Alamat Email:</span>
                    <span className="text-neutral-900">{indiv.email}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Tanggal Lahir:</span>
                    <span className="text-neutral-800">{indiv.dateOfBirth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Alamat Domisili:</span>
                    <span className="text-neutral-800 text-right max-w-xs">{indiv.address}, {indiv.city}, {indiv.province}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Driving & Emergency Info */}
              <div className="space-y-4">
                <Card className="border-neutral-200 shadow-xs text-xs">
                  <CardHeader className="p-4 border-b border-neutral-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Data Surat Izin Mengemudi (Driving License)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Nomor SIM:</span>
                      <strong className="font-mono text-neutral-900">{indiv.drivingInfo?.licenseNumber || "-"}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Jenis SIM:</span>
                      <span className="font-bold text-neutral-800">{indiv.drivingInfo?.licenseType || "SIM A"}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Masa Berlaku SIM:</span>
                      <strong className={`font-mono ${indiv.drivingInfo?.verificationStatus === "EXPIRED" ? "text-rose-600 font-bold" : "text-neutral-900"}`}>
                        {indiv.drivingInfo?.licenseExpiry || "-"}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Status Keabsahan SIM:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {indiv.drivingInfo?.verificationStatus || "PENDING"}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-xs text-xs">
                  <CardHeader className="p-4 border-b border-neutral-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <Phone className="h-4 w-4 text-primary" />
                      Kontak Darurat (Emergency Contact)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Nama Kontak:</span>
                      <strong className="text-neutral-900">{indiv.emergencyContact?.name || "-"}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Hubungan Relasi:</span>
                      <span className="text-neutral-800">{indiv.emergencyContact?.relationship || "FAMILY"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Nomor HP Darurat:</span>
                      <span className="font-mono text-neutral-900 font-bold">{indiv.emergencyContact?.phone || "-"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : corp ? (
            <>
              {/* Corporate Legal & Entity Info */}
              <Card className="border-neutral-200 shadow-xs text-xs">
                <CardHeader className="p-4 border-b border-neutral-100">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" />
                    Legalitas Badan Usaha (Company Info)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Nama Perusahaan:</span>
                    <strong className="text-neutral-900">{corp.name}</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Nama Legal Badan Hukum:</span>
                    <span className="font-semibold text-neutral-800">{corp.companyInfo?.legalName}</span>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Nomor NPWP Badan:</span>
                    <strong className="font-mono text-neutral-900">{corp.companyInfo?.npwp}</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Nomor NIB:</span>
                    <strong className="font-mono text-neutral-900">{corp.companyInfo?.nib}</strong>
                  </div>
                  <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                    <span className="text-neutral-500">Bidang Industri:</span>
                    <span className="text-neutral-800">{corp.companyInfo?.industry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Alamat Kantor:</span>
                    <span className="text-neutral-800 text-right max-w-xs">{corp.companyInfo?.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* PIC & Billing Info */}
              <div className="space-y-4">
                <Card className="border-neutral-200 shadow-xs text-xs">
                  <CardHeader className="p-4 border-b border-neutral-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <User className="h-4 w-4 text-primary" />
                      Person in Charge (PIC Operasional)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Nama PIC:</span>
                      <strong className="text-neutral-900">{corp.pic?.name || "PIC"}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Jabatan:</span>
                      <span className="text-neutral-800">{corp.pic?.role || "Manager"}</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Nomor HP/WA:</span>
                      <span className="font-mono text-neutral-900 font-bold">{corp.pic?.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Email PIC:</span>
                      <span className="text-neutral-800">{corp.pic?.email}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-neutral-200 shadow-xs text-xs">
                  <CardHeader className="p-4 border-b border-neutral-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Informasi Penagihan (Billing & Invoicing)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Kontak Billing:</span>
                      <strong className="text-neutral-900">{corp.billingInfo?.billingContactName || "Finance AP"}</strong>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-neutral-100">
                      <span className="text-neutral-500">Email Tagihan (e-Faktur):</span>
                      <span className="text-neutral-800">{corp.billingInfo?.billingEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Term of Payment:</span>
                      <span className="font-bold font-mono text-neutral-900">Net {corp.billingInfo?.paymentTermDays || 30} Hari</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: KYC Documents */}
      {activeTab === "documents" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                Daftar Dokumen KYC & Legalitas
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Audit keabsahan berkas legalitas untuk memastikan integritas dan kepatuhan penyewa.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-neutral-50/80">
                <TableRow className="text-xs">
                  <TableHead className="w-12 font-bold text-center">No</TableHead>
                  <TableHead className="font-bold">Jenis Dokumen</TableHead>
                  <TableHead className="font-bold">Nomor Dokumen</TableHead>
                  <TableHead className="font-bold">Masa Berlaku</TableHead>
                  <TableHead className="font-bold">Kewajiban</TableHead>
                  <TableHead className="font-bold">Status Verifikasi</TableHead>
                  <TableHead className="font-bold">Verifikator</TableHead>
                  <TableHead className="text-right font-bold">Aksi Audit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(customer.documents || []).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-neutral-500 text-xs">
                      Belum ada dokumen KYC yang diunggah.
                    </TableCell>
                  </TableRow>
                ) : (
                  (customer.documents || []).map((doc, idx) => {
                    const isVerified = doc.verificationStatus === "VERIFIED";
                    const isRejected = doc.verificationStatus === "REJECTED";
                    const isNeedRevision = doc.verificationStatus === "NEED_REVISION";
                    const isExpired = doc.verificationStatus === "EXPIRED";

                    return (
                      <TableRow key={doc.id} className="text-xs hover:bg-neutral-50/60">
                        <TableCell className="text-center font-mono font-bold text-neutral-500">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <strong className="text-neutral-900 block">{doc.documentName}</strong>
                            <span className="text-[10px] text-neutral-400 font-mono">{doc.documentType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-neutral-800">
                          {doc.documentNumber || "-"}
                        </TableCell>
                        <TableCell>
                          {doc.expiryDate ? (
                            <span className={`font-mono text-[11px] ${isExpired ? "text-rose-600 font-bold" : "text-neutral-700"}`}>
                              {doc.expiryDate}
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">Seumur Hidup / Permanen</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              doc.isRequired
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {doc.isRequired ? "REQUIRED" : "OPTIONAL"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                              isVerified
                                ? "bg-emerald-100 text-emerald-800"
                                : isRejected
                                ? "bg-rose-100 text-rose-800"
                                : isNeedRevision
                                ? "bg-amber-100 text-amber-800"
                                : isExpired
                                ? "bg-rose-100 text-rose-800"
                                : "bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {doc.verificationStatus}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] text-neutral-600 block">
                            {doc.verifiedBy || "-"}
                          </span>
                          {doc.verifiedDate && (
                            <span className="text-[10px] text-neutral-400 font-mono block">
                              {doc.verifiedDate}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDocToReview(doc);
                              setIsDocViewerOpen(true);
                            }}
                            className="h-7 text-xs font-semibold gap-1 bg-white hover:bg-neutral-50"
                          >
                            <ShieldCheck className="h-3 w-3 text-primary" />
                            Audit Dokumen
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Versioned Agreement Acceptance Log */}
      {activeTab === "agreements" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                Riwayat Persetujuan Syarat & Ketentuan (Agreement Acceptance Audit)
              </h3>
              <p className="text-xs text-neutral-500">
                Log bukti persetujuan klausul hukum berversi, identitas penandatangan, timestamp, dan IP Address.
              </p>
            </div>

            <Button
              size="sm"
              onClick={() => setIsAgreementModalOpen(true)}
              className="text-xs font-bold gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              + Rekam Persetujuan Agreement
            </Button>
          </div>

          <Card className="border-neutral-200 shadow-xs">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-neutral-50/80">
                  <TableRow className="text-xs">
                    <TableHead className="w-12 font-bold text-center">No</TableHead>
                    <TableHead className="font-bold">Tipe & Versi Agreement</TableHead>
                    <TableHead className="font-bold">Penandatangan / PIC</TableHead>
                    <TableHead className="font-bold">Waktu Persetujuan</TableHead>
                    <TableHead className="font-bold">IP Address & Consent</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(customer.agreements || []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-neutral-500 text-xs">
                        Customer belum menyetujui versi Syarat & Ketentuan manapun.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (customer.agreements || []).map((acc, idx) => (
                      <TableRow key={acc.id} className="text-xs hover:bg-neutral-50/60">
                        <TableCell className="text-center font-mono font-bold text-neutral-500">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-bold text-neutral-900 block font-mono">
                              Versi {acc.agreementVersion} ({acc.agreementType})
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">{acc.agreementId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <strong className="text-neutral-900 block">{acc.acceptedBy}</strong>
                            <span className="text-[10px] text-neutral-500">{acc.acceptedByRole || "Penyewa"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-neutral-800">
                          {new Date(acc.acceptedAt).toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 text-[11px]">
                            <span className="font-mono text-neutral-600 block">IP: {acc.ipAddress}</span>
                            <span className="text-[10px] text-neutral-400 block">{acc.digitalConsentNote || "Disetujui secara sadar."}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ACCEPTED ✓
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: Rental Eligibility Diagnostic */}
      {activeTab === "eligibility" && (
        <Card className="border-neutral-200 shadow-xs text-xs max-w-3xl">
          <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm font-bold text-neutral-900">
                  {eligibility.summaryTitle}
                </CardTitle>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {eligibility.summaryMessage}
                </p>
              </div>
            </div>
            <EligibilityBadge eligibility={eligibility} size="md" />
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Blocking checks */}
            {eligibility.blockingChecks.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  Pemeriksaan Yang Menggagalkan / Blocker ({eligibility.blockingChecks.length}):
                </span>
                <div className="space-y-2">
                  {eligibility.blockingChecks.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-2.5"
                    >
                      <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold text-xs">{item.label}</strong>
                        <p className="text-[11px] text-rose-800 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Passed checks */}
            {eligibility.passedChecks.length > 0 && (
              <div className="space-y-2">
                <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Kriteria Yang Berhasil Lolos ({eligibility.passedChecks.length}):
                </span>
                <div className="space-y-2">
                  {eligibility.passedChecks.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold text-xs">{item.label}</strong>
                        <p className="text-[11px] text-emerald-800 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* KYC Document Viewer Modal */}
      <KycDocumentViewer
        open={isDocViewerOpen}
        onOpenChange={setIsDocViewerOpen}
        customerId={customer.id}
        customerName={customer.name}
        document={selectedDocToReview}
        onDocumentUpdated={async () => {
          await loadCustomer();
        }}
      />

      {/* Agreement Acceptance Modal */}
      <AgreementAcceptanceModal
        open={isAgreementModalOpen}
        onOpenChange={setIsAgreementModalOpen}
        customerId={customer.id}
        customerName={customer.name}
        customerType={customerType}
        onAgreementAccepted={async () => {
          await loadCustomer();
        }}
      />
    </div>
  );
}
