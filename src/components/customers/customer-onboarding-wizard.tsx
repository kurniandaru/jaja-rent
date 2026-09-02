"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createIndividualCustomer, createCorporateCustomer } from "@/lib/data/customers";
import { mockAgreementVersions } from "@/lib/mock-data/agreements";
import {
  User,
  Building2,
  ShieldCheck,
  FileText,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

interface CustomerOnboardingWizardProps {
  onSuccess?: (customerId: string) => void;
  defaultType?: "INDIVIDUAL" | "CORPORATE";
}

export function CustomerOnboardingWizard({
  onSuccess,
  defaultType = "INDIVIDUAL",
}: CustomerOnboardingWizardProps) {
  const router = useRouter();
  const [customerType, setCustomerType] = React.useState<"INDIVIDUAL" | "CORPORATE">(defaultType);
  const [step, setStep] = React.useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // B2C Individual States
  const [name, setName] = React.useState("");
  const [nik, setNik] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [dob, setDob] = React.useState("1992-05-14");
  const [address, setAddress] = React.useState("");
  const [city, setCity] = React.useState("Jakarta Selatan");
  const [province, setProvince] = React.useState("DKI Jakarta");

  const [simNumber, setSimNumber] = React.useState("");
  const [simType, setSimType] = React.useState<"SIM_A" | "SIM_B1">("SIM_A");
  const [simExpiry, setSimExpiry] = React.useState("2029-05-14");

  const [emergencyName, setEmergencyName] = React.useState("");
  const [emergencyRel, setEmergencyRel] = React.useState<"FAMILY" | "SPOUSE" | "COLLEAGUE">("FAMILY");
  const [emergencyPhone, setEmergencyPhone] = React.useState("");

  // B2B Corporate States
  const [companyName, setCompanyName] = React.useState("");
  const [legalName, setLegalName] = React.useState("");
  const [entityType, setEntityType] = React.useState<"PT" | "CV">("PT");
  const [npwp, setNpwp] = React.useState("");
  const [nib, setNib] = React.useState("");
  const [corpAddress, setCorpAddress] = React.useState("");
  const [corpCity, setCorpCity] = React.useState("Jakarta Selatan");
  const [industry, setIndustry] = React.useState("Consumer Goods & FMCG");
  const [website, setWebsite] = React.useState("");

  const [picName, setPicName] = React.useState("");
  const [picRole, setPicRole] = React.useState("Head of General Affairs & Fleet");
  const [picPhone, setPicPhone] = React.useState("");
  const [picEmail, setPicEmail] = React.useState("");

  const [billingContact, setBillingContact] = React.useState("");
  const [billingEmail, setBillingEmail] = React.useState("");
  const [billingPhone, setBillingPhone] = React.useState("");
  const [paymentTermDays, setPaymentTermDays] = React.useState(30);

  // Agreement acceptance state
  const isIndividual = customerType === "INDIVIDUAL";
  const targetAgreementType = isIndividual ? "B2C_RENTAL_TERMS" : "B2B_MASTER_SERVICE_AGREEMENT";
  const activeAgreement =
    mockAgreementVersions.find((a) => a.agreementType === targetAgreementType && a.isActive) ||
    mockAgreementVersions[0];

  const [acceptedClauses, setAcceptedClauses] = React.useState<string[]>([]);
  const [signerName, setSignerName] = React.useState("");

  const toggleClause = (id: string) => {
    setAcceptedClauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSelectAllClauses = () => {
    if (acceptedClauses.length === activeAgreement.clauses.length) {
      setAcceptedClauses([]);
    } else {
      setAcceptedClauses(activeAgreement.clauses.map((c: any) => c.id));
    }
  };

  const allClausesAccepted = activeAgreement.clauses
    .filter((c: any) => c.isRequired)
    .every((c: any) => acceptedClauses.includes(c.id));

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);

    try {
      if (customerType === "INDIVIDUAL") {
        const newIndiv = await createIndividualCustomer({
          name,
          nik: nik || "3174000000000000",
          phone,
          email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
          dateOfBirth: dob,
          address: address || "Jakarta",
          city,
          province,
          status: "APPROVED",
          drivingInfo: {
            licenseNumber: simNumber || "SIM-A-99882211",
            licenseType: simType,
            licenseExpiry: simExpiry,
            verificationStatus: "VERIFIED",
          },
          emergencyContact: {
            name: emergencyName || "Keluarga Terdekat",
            relationship: emergencyRel,
            phone: emergencyPhone || phone,
          },
          documents: [
            {
              id: `DOC-${Date.now()}-KTP`,
              documentType: "KTP",
              documentName: "KTP Elektronik",
              documentNumber: nik || "3174000000000000",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "System KYC Engine",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
            {
              id: `DOC-${Date.now()}-SIM`,
              documentType: "SIM",
              documentName: "Surat Izin Mengemudi (SIM A)",
              documentNumber: simNumber || "SIM-A-99882211",
              expiryDate: simExpiry,
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "System KYC Engine",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
          ],
          agreements: [
            {
              id: `ACC-${Date.now().toString().slice(-4)}`,
              customerId: "",
              agreementId: activeAgreement.id,
              agreementType: activeAgreement.agreementType,
              agreementVersion: activeAgreement.version,
              acceptedAt: new Date().toISOString(),
              acceptedBy: signerName || name,
              acceptedByRole: "Penyewa Perorangan",
              acceptedByPhone: phone,
              acceptedByEmail: email,
              ipAddress: "182.253.44.12",
              status: "ACCEPTED",
              acceptedClauses,
              digitalConsentNote: "Disetujui saat pendaftaran Customer Onboarding Portal.",
            },
          ],
        });

        if (onSuccess) onSuccess(newIndiv.id);
        else router.push(`/corporate/customers/${newIndiv.id}`);
      } else {
        const newCorp = await createCorporateCustomer({
          name: companyName,
          companyInfo: {
            name: companyName,
            legalName: legalName || `${entityType} ${companyName}`,
            entityType,
            npwp: npwp || "01.234.567.8-000.000",
            nib: nib || "9120000000000",
            address: corpAddress || "Jakarta",
            city: corpCity,
            province: "DKI Jakarta",
            industry,
            website,
          },
          pic: {
            name: picName,
            role: picRole,
            phone: picPhone,
            email: picEmail || "procurement@company.com",
          },
          billingInfo: {
            billingContactName: billingContact || picName,
            billingEmail: billingEmail || picEmail || "finance@company.com",
            billingPhone: billingPhone || picPhone,
            billingAddress: corpAddress || "Jakarta",
            paymentTermDays,
          },
          status: "APPROVED",
          documents: [
            {
              id: `DOC-${Date.now()}-NIB`,
              documentType: "NIB",
              documentName: "Nomor Induk Berusaha (NIB)",
              documentNumber: nib || "9120000000000",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "System KYC Engine",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
            {
              id: `DOC-${Date.now()}-NPWP`,
              documentType: "NPWP",
              documentName: "NPWP Badan Usaha",
              documentNumber: npwp || "01.234.567.8-000.000",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "System KYC Engine",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
            {
              id: `DOC-${Date.now()}-AKTA`,
              documentType: "AKTA_PENDIRIAN",
              documentName: "Akta Pendirian",
              documentNumber: "AHU-VERIFIED",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "System KYC Engine",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
            {
              id: `DOC-${Date.now()}-KTPPIC`,
              documentType: "KTP_PIC",
              documentName: "KTP PIC Pengurus",
              documentNumber: "3174000000000000",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "System KYC Engine",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
          ],
          agreements: [
            {
              id: `ACC-${Date.now().toString().slice(-4)}`,
              customerId: "",
              agreementId: activeAgreement.id,
              agreementType: activeAgreement.agreementType,
              agreementVersion: activeAgreement.version,
              acceptedAt: new Date().toISOString(),
              acceptedBy: signerName || picName,
              acceptedByRole: `${picRole} (Authorized PIC)`,
              acceptedByPhone: picPhone,
              acceptedByEmail: picEmail,
              ipAddress: "182.253.44.12",
              status: "ACCEPTED",
              acceptedClauses,
              digitalConsentNote: "Disetujui secara digital saat onboarding korporat.",
            },
          ],
        });

        if (onSuccess) onSuccess(newCorp.id);
        else router.push(`/corporate/customers/${newCorp.id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Tipe & Profil", desc: isIndividual ? "Identitas NIK" : "Profil Badan Hukum" },
    { num: 2, title: isIndividual ? "Driving SIM" : "Kontak PIC", desc: isIndividual ? "Masa Berlaku" : "Wewenang PIC" },
    { num: 3, title: isIndividual ? "Emergency" : "Penagihan", desc: isIndividual ? "Kontak Darurat" : "Billing Terms" },
    { num: 4, title: "Dokumen KYC", desc: "Verifikasi Berkas" },
    { num: 5, title: "Agreement v" + activeAgreement.version, desc: "Persetujuan T&C" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Stepper Header */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-2xs">
        <div className="flex items-center justify-between overflow-x-auto gap-2">
          {stepsList.map((s, idx) => {
            const isPassed = s.num < step;
            const isCurrent = s.num === step;

            return (
              <React.Fragment key={s.num}>
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-6 sm:w-12 shrink-0 transition-colors ${
                      isPassed ? "bg-emerald-500" : "bg-neutral-200"
                    }`}
                  />
                )}
                <div
                  className={`flex items-center gap-2 shrink-0 select-none ${
                    isCurrent ? "font-bold text-neutral-900" : isPassed ? "text-emerald-700" : "text-neutral-400"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isCurrent
                        ? "bg-neutral-900 text-white shadow-xs"
                        : isPassed
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                    }`}
                  >
                    {isPassed ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.num}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-semibold leading-tight">{s.title}</span>
                    <span className="block text-[10px] text-neutral-400 font-normal">{s.desc}</span>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Customer KYC Onboarding: Step {step} dari 5
              </CardTitle>
              <p className="text-xs text-neutral-500 mt-0.5">
                Penyewa wajib melengkapi seluruh data dan menyetujui ketentuan resmi sebelum dapat melakukan sewa armada.
              </p>
            </div>

            {step === 1 && (
              <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCustomerType("INDIVIDUAL")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    customerType === "INDIVIDUAL" ? "bg-white text-neutral-900 shadow-xs font-bold" : "text-neutral-500"
                  }`}
                >
                  B2C Perorangan
                </button>
                <button
                  type="button"
                  onClick={() => setCustomerType("CORPORATE")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    customerType === "CORPORATE" ? "bg-white text-neutral-900 shadow-xs font-bold" : "text-neutral-500"
                  }`}
                >
                  B2B Corporate
                </button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 text-xs space-y-4">
          {/* STEP 1: Basic Identity / Company Info */}
          {step === 1 && (
            <div className="space-y-3.5">
              {isIndividual ? (
                <>
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Nama Lengkap Sesuai KTP <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <Input
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setSignerName(e.target.value);
                        }}
                        placeholder="Contoh: Hendrawan Putra"
                        className="pl-8.5 h-8.5 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nomor Induk Kependudukan (NIK) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <Input
                          required
                          value={nik}
                          onChange={(e) => setNik(e.target.value)}
                          placeholder="3174xxxxxxxxxxxx"
                          className="pl-8.5 h-8.5 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Tanggal Lahir <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="h-8.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nomor HP / WhatsApp Aktif <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <Input
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+62 812-xxxx-xxxx"
                          className="pl-8.5 h-8.5 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Alamat Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <Input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@gmail.com"
                          className="pl-8.5 h-8.5 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Alamat Domisili Lengkap
                    </label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Jl. Nama Jalan No. XX, Kelurahan, Kecamatan"
                      className="h-8.5 text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nama Perusahaan (Brand Name) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <Input
                          required
                          value={companyName}
                          onChange={(e) => {
                            setCompanyName(e.target.value);
                            if (!legalName) setLegalName(`PT ${e.target.value}`);
                          }}
                          placeholder="Contoh: ABC Indonesia"
                          className="pl-8.5 h-8.5 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Bentuk Badan Hukum
                      </label>
                      <select
                        value={entityType}
                        onChange={(e) => setEntityType(e.target.value as any)}
                        className="w-full h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-bold text-neutral-900"
                      >
                        <option value="PT">PT (Perseroan Terbatas)</option>
                        <option value="CV">CV (Persekutuan Komanditer)</option>
                        <option value="BUMN">BUMN / BUMD</option>
                        <option value="YAYASAN">Yayasan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nama Legal Badan Usaha Sesuai Akta
                      </label>
                      <Input
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                        placeholder="Contoh: PT ABC Indonesia Tbk"
                        className="h-8.5 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Sektor Industri / Bidang Usaha
                      </label>
                      <Input
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="Contoh: FMCG / Mining / Logistics"
                        className="h-8.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nomor Pokok Wajib Pajak (NPWP Badan) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        value={npwp}
                        onChange={(e) => setNpwp(e.target.value)}
                        placeholder="01.234.567.8-000.000"
                        className="h-8.5 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nomor Induk Berusaha (NIB) <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        value={nib}
                        onChange={(e) => setNib(e.target.value)}
                        placeholder="9120003410982"
                        className="h-8.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Alamat Kantor Pusat Operasional
                    </label>
                    <Input
                      value={corpAddress}
                      onChange={(e) => setCorpAddress(e.target.value)}
                      placeholder="Gedung, Jalan, Kawasan Industri..."
                      className="h-8.5 text-xs"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: Driving Information (B2C) / PIC Info (B2B) */}
          {step === 2 && (
            <div className="space-y-3.5">
              {isIndividual ? (
                <>
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                    <span>
                      Data Surat Izin Mengemudi (SIM) wajib valid dan belum kedaluwarsa untuk memenuhi syarat sewa lepas kunci.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nomor SIM <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        value={simNumber}
                        onChange={(e) => setSimNumber(e.target.value)}
                        placeholder="SIM-A-xxxxxxxx"
                        className="h-8.5 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Jenis SIM
                      </label>
                      <select
                        value={simType}
                        onChange={(e) => setSimType(e.target.value as any)}
                        className="w-full h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-bold text-neutral-900"
                      >
                        <option value="SIM_A">SIM A (Mobil Pribadi)</option>
                        <option value="SIM_B1">SIM B1 (Bus / Truk Kecil)</option>
                        <option value="INTERNATIONAL">SIM Internasional</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Masa Berlaku SIM (Expiry Date) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="date"
                      required
                      value={simExpiry}
                      onChange={(e) => setSimExpiry(e.target.value)}
                      className="h-8.5 text-xs font-mono"
                    />
                    <span className="text-[11px] text-neutral-400 mt-1 block">
                      Sistem akan memblokir reservasi otomatis jika tanggal masa berlaku telah habis.
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nama PIC Operasional / Armada <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                        <Input
                          required
                          value={picName}
                          onChange={(e) => {
                            setPicName(e.target.value);
                            setSignerName(e.target.value);
                          }}
                          placeholder="Nama PIC resmi"
                          className="pl-8.5 h-8.5 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Jabatan / Posisi di Perusahaan
                      </label>
                      <Input
                        value={picRole}
                        onChange={(e) => setPicRole(e.target.value)}
                        placeholder="Head of GA & Procurement"
                        className="h-8.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        No. HP / WhatsApp PIC <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        required
                        value={picPhone}
                        onChange={(e) => setPicPhone(e.target.value)}
                        placeholder="+62 812-xxxx-xxxx"
                        className="h-8.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Email Resmi PIC <span className="text-rose-500">*</span>
                      </label>
                      <Input
                        type="email"
                        required
                        value={picEmail}
                        onChange={(e) => setPicEmail(e.target.value)}
                        placeholder="pic@company.com"
                        className="h-8.5 text-xs"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Emergency Contact (B2C) / Billing (B2B) */}
          {step === 3 && (
            <div className="space-y-3.5">
              {isIndividual ? (
                <>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                    <strong className="text-neutral-900 block font-semibold">Kontak Darurat (Emergency Contact)</strong>
                    <p className="text-neutral-500 text-[11px]">
                      Dihubungi hanya dalam kondisi darurat kecelakaan atau kondisi force majeure di jalan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nama Lengkap Kontak Darurat
                      </label>
                      <Input
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="Nama keluarga / pasangan"
                        className="h-8.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Hubungan
                      </label>
                      <select
                        value={emergencyRel}
                        onChange={(e) => setEmergencyRel(e.target.value as any)}
                        className="w-full h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold"
                      >
                        <option value="FAMILY">Keluarga (Family)</option>
                        <option value="SPOUSE">Pasangan (Spouse)</option>
                        <option value="PARENT">Orang Tua (Parent)</option>
                        <option value="COLLEAGUE">Rekan Kerja (Colleague)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">
                      Nomor HP Kontak Darurat
                    </label>
                    <Input
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+62 812-xxxx-xxxx"
                      className="h-8.5 text-xs"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Nama Kontak Bagian Billing / AP
                      </label>
                      <Input
                        value={billingContact}
                        onChange={(e) => setBillingContact(e.target.value)}
                        placeholder="Finance AP Team"
                        className="h-8.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Term of Payment (Hari)
                      </label>
                      <select
                        value={paymentTermDays}
                        onChange={(e) => setPaymentTermDays(Number(e.target.value))}
                        className="w-full h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-bold text-neutral-900"
                      >
                        <option value={14}>Net 14 Hari</option>
                        <option value={30}>Net 30 Hari (Standar Korporat)</option>
                        <option value={45}>Net 45 Hari</option>
                        <option value={60}>Net 60 Hari</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        Email Penagihan Invoice (e-Faktur)
                      </label>
                      <Input
                        type="email"
                        value={billingEmail}
                        onChange={(e) => setBillingEmail(e.target.value)}
                        placeholder="ap-invoice@company.com"
                        className="h-8.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">
                        No. Telepon Bagian Keuangan
                      </label>
                      <Input
                        value={billingPhone}
                        onChange={(e) => setBillingPhone(e.target.value)}
                        placeholder="+62 21-xxxx-xxxx"
                        className="h-8.5 text-xs"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: KYC Document Requirements Checklist */}
          {step === 4 && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
                <strong className="text-neutral-900 block font-semibold">Persyaratan Dokumen Legalitas (Document Requirements)</strong>
                <p className="text-neutral-500 text-[11px]">
                  Sistem mewajibkan dokumen bertanda <span className="text-rose-500 font-bold">*REQUIRED</span> berstatus terverifikasi sebelum akun dapat menyewa.
                </p>
              </div>

              {isIndividual ? (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <CreditCard className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <strong className="text-xs text-neutral-900 block">KTP Elektronik / Paspor</strong>
                        <span className="text-[11px] text-neutral-400 font-mono">NIK: {nik || "3174000000000000"}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      REQUIRED &middot; SIAP VERIFIKASI
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <strong className="text-xs text-neutral-900 block">Surat Izin Mengemudi (SIM A)</strong>
                        <span className="text-[11px] text-neutral-400 font-mono">Exp: {simExpiry}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      REQUIRED &middot; SIAP VERIFIKASI
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { label: "Nomor Induk Berusaha (NIB)", code: nib || "NIB-AUTO", req: true },
                    { label: "NPWP Badan Usaha", code: npwp || "NPWP-AUTO", req: true },
                    { label: "Akta Pendirian & SK Kemenkumham", code: "AKTA-PENDIRIAN", req: true },
                    { label: "KTP PIC Pengurus Armada", code: picName || "KTP PIC", req: true },
                    { label: "Surat Kuasa Direksi (Jika PIC bukan Direktur)", code: "SURAT-KUASA", req: false },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-neutral-200 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-neutral-100 text-neutral-700">
                          <FileText className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <strong className="text-xs text-neutral-900 block">{doc.label}</strong>
                          <span className="text-[11px] text-neutral-400 font-mono">{doc.code}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          doc.req ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {doc.req ? "REQUIRED" : "OPTIONAL"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Versioned Agreement Acceptance */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      Versi {activeAgreement.version}
                    </span>
                    <span className="text-[10px] text-neutral-300">
                      Efektif: {activeAgreement.effectiveDate}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">{activeAgreement.title}</h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5">{activeAgreement.summary}</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-emerald-400 shrink-0 hidden sm:block" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-neutral-800 text-xs">
                  Persetujuan Klausul ({acceptedClauses.length}/{activeAgreement.clauses.length} Disetujui):
                </span>
                <button
                  type="button"
                  onClick={handleSelectAllClauses}
                  className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                >
                  {acceptedClauses.length === activeAgreement.clauses.length
                    ? "Batal Pilih Semua"
                    : "Centang Semua Klausul"}
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeAgreement.clauses.map((clause: any) => {
                  const isChecked = acceptedClauses.includes(clause.id);
                  return (
                    <div
                      key={clause.id}
                      onClick={() => toggleClause(clause.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                        isChecked ? "bg-emerald-50/40 border-emerald-300" : "bg-white border-neutral-200"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-neutral-300 bg-white"
                        }`}
                      >
                        {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                      <div>
                        <strong className="text-xs text-neutral-900 block font-semibold">{clause.title}</strong>
                        <p className="text-[11px] text-neutral-600">{clause.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Nama Pihak Penandatangan Digital
                </label>
                <Input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Nama penandatangan"
                  className="h-8.5 text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {/* Wizard Footer Navigation */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep((prev) => (prev - 1) as any)}
                className="text-xs gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button
                type="button"
                size="sm"
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white gap-1"
              >
                Lanjutkan
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={!allClausesAccepted || isSubmitting}
                onClick={handleCompleteOnboarding}
                className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isSubmitting ? "Memproses..." : "Selesaikan Onboarding & Aktifkan Customer"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
