"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createIndividualCustomer, createCorporateCustomer } from "@/lib/data/customers";
import { mockAgreementVersions } from "@/lib/mock-data/agreements";
import { User, Building2, Phone, Mail, MapPin, CreditCard, ShieldCheck } from "lucide-react";

interface AddCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: "INDIVIDUAL" | "CORPORATE";
  onCustomerCreated: (customer: { id: string; name: string; phone: string; type: "INDIVIDUAL" | "CORPORATE" }) => void;
}

export function AddCustomerModal({
  open,
  onOpenChange,
  defaultType = "INDIVIDUAL",
  onCustomerCreated,
}: AddCustomerModalProps) {
  const [customerType, setCustomerType] = React.useState<"INDIVIDUAL" | "CORPORATE">(defaultType);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Individual Form States
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [nik, setNik] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [simNumber, setSimNumber] = React.useState("");
  const [simExpiry, setSimExpiry] = React.useState("2029-08-19");

  // Corporate Form States
  const [companyName, setCompanyName] = React.useState("");
  const [industry, setIndustry] = React.useState("Consumer Goods / FMCG");
  const [city, setCity] = React.useState("Jakarta Selatan");
  const [corpAddress, setCorpAddress] = React.useState("");
  const [picName, setPicName] = React.useState("");
  const [picRole, setPicRole] = React.useState("Head of General Affairs & Fleet");
  const [picPhone, setPicPhone] = React.useState("");
  const [picEmail, setPicEmail] = React.useState("");
  const [npwp, setNpwp] = React.useState("");
  const [nib, setNib] = React.useState("");

  React.useEffect(() => {
    if (defaultType) {
      setCustomerType(defaultType);
    }
  }, [defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (customerType === "INDIVIDUAL") {
        if (!name || !phone) return;
        const newIndiv = await createIndividualCustomer({
          name,
          nik: nik || "3174000000000000",
          phone,
          email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
          address: address || "Jakarta",
          city: "Jakarta Selatan",
          province: "DKI Jakarta",
          status: "APPROVED",
          drivingInfo: {
            licenseNumber: simNumber || "SIM-A-99882211",
            licenseType: "SIM_A",
            licenseExpiry: simExpiry,
            verificationStatus: "VERIFIED",
          },
          documents: [
            {
              id: `DOC-${Date.now()}-KTP`,
              documentType: "KTP",
              documentName: "KTP Elektronik",
              documentNumber: nik || "3174000000000000",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "Quick KYC Validator",
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
              verifiedBy: "Quick KYC Validator",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
          ],
          agreements: [
            {
              id: `ACC-${Date.now().toString().slice(-4)}`,
              customerId: "",
              agreementId: "AGR-B2C-V1.3",
              agreementType: "B2C_RENTAL_TERMS",
              agreementVersion: "1.3",
              acceptedAt: new Date().toISOString(),
              acceptedBy: name,
              acceptedByRole: "Penyewa Perorangan",
              acceptedByPhone: phone,
              acceptedByEmail: email,
              ipAddress: "182.253.44.12",
              status: "ACCEPTED",
              acceptedClauses: [
                "CLAUSE-B2C-01",
                "CLAUSE-B2C-02",
                "CLAUSE-B2C-03",
                "CLAUSE-B2C-04",
                "CLAUSE-B2C-05",
                "CLAUSE-B2C-06",
              ],
              digitalConsentNote: "Disetujui secara sadar saat pendaftaran instan.",
            },
          ],
        });

        onCustomerCreated({
          id: newIndiv.id,
          name: newIndiv.name,
          phone: newIndiv.phone,
          type: "INDIVIDUAL",
        });
      } else {
        if (!companyName || !picName || !picPhone) return;
        const newCorp = await createCorporateCustomer({
          name: companyName,
          companyInfo: {
            name: companyName,
            legalName: `PT ${companyName}`,
            entityType: "PT",
            npwp: npwp || "01.234.567.8-000.000",
            nib: nib || "9120000000000",
            address: corpAddress || "Jakarta",
            city,
            province: "DKI Jakarta",
            industry,
          },
          pic: {
            name: picName,
            role: picRole,
            phone: picPhone,
            email: picEmail || "procurement@company.co.id",
          },
          billingInfo: {
            billingContactName: picName,
            billingEmail: picEmail || "finance@company.co.id",
            billingPhone: picPhone,
            billingAddress: corpAddress || "Jakarta",
            paymentTermDays: 30,
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
              verifiedBy: "Quick KYC Validator",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
            {
              id: `DOC-${Date.now()}-NPWP`,
              documentType: "NPWP",
              documentName: "NPWP Badan Usaha",
              documentNumber: npwp || "01.234.567.8-000.000",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "Quick KYC Validator",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
            {
              id: `DOC-${Date.now()}-AKTA`,
              documentType: "AKTA_PENDIRIAN",
              documentName: "Akta Pendirian",
              documentNumber: "AHU-VERIFIED",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "Quick KYC Validator",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
            {
              id: `DOC-${Date.now()}-KTPPIC`,
              documentType: "KTP_PIC",
              documentName: "KTP PIC Pengurus",
              documentNumber: "3174000000000000",
              isRequired: true,
              verificationStatus: "VERIFIED",
              verifiedBy: "Quick KYC Validator",
              verifiedDate: new Date().toISOString().split("T")[0],
            },
          ],
          agreements: [
            {
              id: `ACC-${Date.now().toString().slice(-4)}`,
              customerId: "",
              agreementId: "AGR-B2B-V2.0",
              agreementType: "B2B_MASTER_SERVICE_AGREEMENT",
              agreementVersion: "2.0",
              acceptedAt: new Date().toISOString(),
              acceptedBy: picName,
              acceptedByRole: `${picRole} (Authorized PIC)`,
              acceptedByPhone: picPhone,
              acceptedByEmail: picEmail,
              ipAddress: "182.253.44.12",
              status: "ACCEPTED",
              acceptedClauses: [
                "CLAUSE-B2B-01",
                "CLAUSE-B2B-02",
                "CLAUSE-B2B-03",
                "CLAUSE-B2B-04",
                "CLAUSE-B2B-05",
              ],
            },
          ],
        });

        onCustomerCreated({
          id: newCorp.id,
          name: newCorp.name,
          phone: newCorp.pic.phone,
          type: "CORPORATE",
        });
      }

      onOpenChange(false);
      setName("");
      setPhone("");
      setCompanyName("");
      setPicName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg bg-white border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Pendaftaran & KYC Cepat Customer
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500">
            Daftarkan pelanggan baru langsung dengan verifikasi identitas dan persetujuan syarat sewa otomatis.
          </DialogDescription>
        </DialogHeader>

        {/* Type Selector Tabs */}
        <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setCustomerType("INDIVIDUAL")}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              customerType === "INDIVIDUAL"
                ? "bg-white text-neutral-900 shadow-xs font-bold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Individual (B2C)
          </button>
          <button
            type="button"
            onClick={() => setCustomerType("CORPORATE")}
            className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              customerType === "CORPORATE"
                ? "bg-white text-neutral-900 shadow-xs font-bold"
                : "text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Corporate (B2B)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {customerType === "INDIVIDUAL" ? (
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Raditya Dika Pratama"
                    className="pl-8.5 h-8.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Nomor WhatsApp / HP <span className="text-rose-500">*</span>
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
                    Nomor NIK KTP <span className="text-rose-500">*</span>
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Nomor SIM A <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={simNumber}
                    onChange={(e) => setSimNumber(e.target.value)}
                    placeholder="SIM-A-xxxxxxxx"
                    className="h-8.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Masa Berlaku SIM <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="date"
                    required
                    value={simExpiry}
                    onChange={(e) => setSimExpiry(e.target.value)}
                    className="h-8.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Email & Alamat Domisili
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="h-8.5 text-xs"
                  />
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat jalan domisili..."
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">
                  Nama Perusahaan (Corporate) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <Input
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Contoh: PT Surya Kencana Indonesia"
                    className="pl-8.5 h-8.5 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    NPWP Badan Usaha <span className="text-rose-500">*</span>
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
                    Nomor NIB <span className="text-rose-500">*</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Nama PIC Operasional <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    placeholder="Nama kontak PIC"
                    className="h-8.5 text-xs font-semibold"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Email PIC / Billing
                  </label>
                  <Input
                    type="email"
                    value={picEmail}
                    onChange={(e) => setPicEmail(e.target.value)}
                    placeholder="pic@company.com"
                    className="h-8.5 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Alamat Kantor
                  </label>
                  <Input
                    value={corpAddress}
                    onChange={(e) => setCorpAddress(e.target.value)}
                    placeholder="Alamat kantor..."
                    className="h-8.5 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Customer otomatis menyetujui Rental T&C v1.3 / MSA v2.0 dan terverifikasi untuk sewa.</span>
          </div>

          <DialogFooter className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan & Pilih Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
