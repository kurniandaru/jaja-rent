"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { AddCustomerModal } from "@/components/customers/add-customer-modal";
import { EligibilityBadge } from "@/components/customers/eligibility-badge";
import { evaluateCustomerEligibility } from "@/lib/services/eligibility-engine";
import {
  Building2,
  Search,
  User,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { getCorporateCustomers, getIndividualCustomers } from "@/lib/data/customers";
import { CorporateCustomer, IndividualCustomer } from "@/lib/types/customer";

export default function CustomersMasterPage() {
  const [activeTab, setActiveTab] = React.useState<"corporate" | "individual">("corporate");
  const [search, setSearch] = React.useState("");
  const [corporateCustomers, setCorporateCustomers] = React.useState<CorporateCustomer[]>([]);
  const [individualCustomers, setIndividualCustomers] = React.useState<IndividualCustomer[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    const corp = await getCorporateCustomers();
    const ind = await getIndividualCustomers();
    setCorporateCustomers(corp);
    setIndividualCustomers(ind);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCorp = corporateCustomers.filter((c) => {
    const s = search.toLowerCase();
    const picName = c.pic?.name || "";
    const city = c.companyInfo?.city || "";
    const industry = c.companyInfo?.industry || "";
    return (
      c.name.toLowerCase().includes(s) ||
      picName.toLowerCase().includes(s) ||
      city.toLowerCase().includes(s) ||
      industry.toLowerCase().includes(s)
    );
  });

  const filteredIndiv = individualCustomers.filter((c) => {
    const s = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(s) ||
      c.phone.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.address.toLowerCase().includes(s)
    );
  });

  const getLifecycleBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">ACTIVE</span>;
      case "APPROVED":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">APPROVED</span>;
      case "DOCUMENT_REVIEW":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">DOC REVIEW</span>;
      case "NEED_REVISION":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300">REVISION</span>;
      case "SUBMITTED":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">SUBMITTED</span>;
      case "SUSPENDED":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">SUSPENDED</span>;
      case "BLACKLISTED":
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white">BLACKLIST</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">DRAFT</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Customer KYC & Master Data
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Pusat audit KYC dokumen, persetujuan T&C berversi, dan gerbang kelayakan rental (Eligibility Gate).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            + Onboarding Customer Baru
          </Button>
        </div>
      </div>

      {/* Main Table with Inline Filter Tabs and Search Bar */}
      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-3.5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Filter Pills */}
          <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 shrink-0 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("corporate")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "corporate"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Corporate B2B ({corporateCustomers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("individual")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "individual"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Individual B2C ({individualCustomers.length})
            </button>
          </div>

          {/* Search Box Inline */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder={activeTab === "corporate" ? "Cari nama PT, PIC, kota..." : "Cari nama customer, HP..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-neutral-50"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-50/80">
              <TableRow className="text-xs">
                <TableHead className="w-12 font-bold text-neutral-700 text-center">No</TableHead>
                <TableHead className="font-bold text-neutral-700">Profil Pelanggan</TableHead>
                <TableHead className="font-bold text-neutral-700">Kontak / Legalitas</TableHead>
                <TableHead className="font-bold text-neutral-700">Status Akun</TableHead>
                <TableHead className="font-bold text-neutral-700">Dokumen KYC</TableHead>
                <TableHead className="font-bold text-neutral-700">Agreement</TableHead>
                <TableHead className="font-bold text-neutral-700">Rental Eligibility</TableHead>
                <TableHead className="text-right font-bold text-neutral-700">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeTab === "corporate" ? (
                filteredCorp.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-neutral-500 text-xs">
                      Tidak ada data customer corporate yang sesuai.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCorp.map((c, idx) => {
                    const eligibility = evaluateCustomerEligibility(c);
                    const verifiedDocsCount = (c.documents || []).filter(
                      (d) => d.verificationStatus === "VERIFIED"
                    ).length;
                    const totalRequiredDocs = (c.documents || []).filter(
                      (d) => d.isRequired
                    ).length;

                    return (
                      <TableRow key={c.id} className="text-xs hover:bg-neutral-50/60">
                        <TableCell className="text-center font-mono font-bold text-neutral-500">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <Link
                              href={`/corporate/customers/${c.id}`}
                              className="font-bold text-neutral-900 hover:text-primary hover:underline block"
                            >
                              {c.name}
                            </Link>
                            <span className="text-[10px] text-neutral-500 flex items-center gap-1 font-mono">
                              <Building2 className="h-3 w-3 text-neutral-400" />
                              {c.companyInfo?.legalName || c.name} &middot; {c.id}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="space-y-0.5 text-[11px]">
                            <span className="font-semibold text-neutral-800 block">
                              PIC: {c.pic?.name || "-"}
                            </span>
                            <span className="text-neutral-500 font-mono block">
                              {c.pic?.phone || "-"}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              NPWP: {c.companyInfo?.npwp || "-"}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>{getLifecycleBadge(c.status)}</TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                                verifiedDocsCount >= totalRequiredDocs && totalRequiredDocs > 0
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {verifiedDocsCount}/{totalRequiredDocs} Verified
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {(c.agreements || []).length > 0 ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              MSA v{(c.agreements || [])[0].agreementVersion} ✓
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                              Belum TTD
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <EligibilityBadge eligibility={eligibility} size="sm" />
                        </TableCell>

                        <TableCell className="text-right">
                          <Link href={`/corporate/customers/${c.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-semibold gap-1 bg-white hover:bg-neutral-50"
                            >
                              <ShieldCheck className="h-3 w-3 text-primary" />
                              Audit KYC
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )
              ) : filteredIndiv.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-neutral-500 text-xs">
                    Tidak ada data customer perorangan yang sesuai.
                  </TableCell>
                </TableRow>
              ) : (
                filteredIndiv.map((c, idx) => {
                  const eligibility = evaluateCustomerEligibility(c);
                  const verifiedDocsCount = (c.documents || []).filter(
                    (d) => d.verificationStatus === "VERIFIED"
                  ).length;
                  const totalRequiredDocs = (c.documents || []).filter(
                    (d) => d.isRequired
                  ).length;

                  return (
                    <TableRow key={c.id} className="text-xs hover:bg-neutral-50/60">
                      <TableCell className="text-center font-mono font-bold text-neutral-500">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <Link
                            href={`/corporate/customers/${c.id}`}
                            className="font-bold text-neutral-900 hover:text-primary hover:underline block"
                          >
                            {c.name}
                          </Link>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            NIK: {c.nik} &middot; {c.id}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5 text-[11px]">
                          <span className="font-semibold text-neutral-800 font-mono block">
                            {c.phone}
                          </span>
                          <span className="text-neutral-500 block truncate max-w-[150px]">
                            {c.email}
                          </span>
                          {c.drivingInfo && (
                            <span className="text-[10px] font-mono text-neutral-600 block">
                              SIM Exp: {c.drivingInfo.licenseExpiry}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>{getLifecycleBadge(c.status)}</TableCell>

                      <TableCell>
                        <div className="space-y-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              verifiedDocsCount >= totalRequiredDocs && totalRequiredDocs > 0
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {verifiedDocsCount}/{totalRequiredDocs} Verified
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {(c.agreements || []).length > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            T&C v{(c.agreements || [])[0].agreementVersion} ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Belum TTD
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        <EligibilityBadge eligibility={eligibility} size="sm" />
                      </TableCell>

                      <TableCell className="text-right">
                        <Link href={`/corporate/customers/${c.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold gap-1 bg-white hover:bg-neutral-50"
                          >
                            <ShieldCheck className="h-3 w-3 text-primary" />
                            Audit KYC
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inline Onboarding Modal */}
      <AddCustomerModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onCustomerCreated={async () => {
          await loadData();
        }}
        defaultType={activeTab === "corporate" ? "CORPORATE" : "INDIVIDUAL"}
      />
    </div>
  );
}
