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
  ExternalLink,
  Car,
  FileText,
  User,
  Plus,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Clock,
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

      {/* Tabs */}
      <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 max-w-md text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("corporate")}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "corporate"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Corporate (B2B) ({corporateCustomers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("individual")}
          className={`flex-1 py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "individual"
              ? "bg-white text-neutral-900 shadow-xs font-bold"
              : "text-neutral-600 hover:text-neutral-900"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          Individual (B2C) ({individualCustomers.length})
        </button>
      </div>

      {/* Main Table */}
      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder={activeTab === "corporate" ? "Cari nama PT, PIC, kota..." : "Cari nama customer, nomor HP..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs bg-neutral-50"
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
                    <TableCell colSpan={8} className="text-center py-8 text-neutral-500 text-xs">
                      Tidak ada data corporate customer yang cocok.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCorp.map((corp, index) => {
                    const eligibility = evaluateCustomerEligibility(corp);
                    const verifiedDocsCount = (corp.documents || []).filter((d) => d.verificationStatus === "VERIFIED").length;
                    const totalReqDocs = (corp.documents || []).filter((d) => d.isRequired).length;
                    const latestAgreement = (corp.agreements || [])[0];

                    return (
                      <TableRow key={corp.id} className="text-xs hover:bg-neutral-50/60 transition-colors">
                        <TableCell className="font-mono text-center text-neutral-500 font-bold">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-bold text-neutral-900 block">{corp.name}</span>
                            <span className="text-[11px] text-neutral-500 block">
                              {corp.companyInfo?.industry || "Corporate"} &middot; {corp.companyInfo?.city || "Jakarta"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 text-[11px] text-neutral-600">
                            <div>PIC: <strong>{corp.pic?.name || "PIC"}</strong></div>
                            <div className="text-neutral-500">{corp.pic?.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getLifecycleBadge(corp.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-neutral-400" />
                            <span className={`font-mono font-bold text-[11px] ${verifiedDocsCount >= totalReqDocs && totalReqDocs > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                              {verifiedDocsCount}/{totalReqDocs} Verified
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {latestAgreement ? (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              MSA v{latestAgreement.agreementVersion} ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 italic">Belum T&C</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <EligibilityBadge eligibility={eligibility} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/corporate/customers/${corp.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 font-semibold">
                              Review KYC
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )
              ) : (
                filteredIndiv.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-neutral-500 text-xs">
                      Tidak ada data individual customer yang cocok.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIndiv.map((indiv, index) => {
                    const eligibility = evaluateCustomerEligibility(indiv);
                    const verifiedDocsCount = (indiv.documents || []).filter((d) => d.verificationStatus === "VERIFIED").length;
                    const totalReqDocs = (indiv.documents || []).filter((d) => d.isRequired).length;
                    const latestAgreement = (indiv.agreements || [])[0];

                    return (
                      <TableRow key={indiv.id} className="text-xs hover:bg-neutral-50/60 transition-colors">
                        <TableCell className="font-mono text-center text-neutral-500 font-bold">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-bold text-neutral-900 block">{indiv.name}</span>
                            <span className="text-[11px] text-neutral-500 font-mono">
                              NIK: {indiv.nik}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5 text-[11px] text-neutral-600">
                            <div>{indiv.phone}</div>
                            <div className="text-neutral-400">{indiv.city}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getLifecycleBadge(indiv.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1">
                              <span className={`font-mono font-bold text-[11px] ${verifiedDocsCount >= totalReqDocs && totalReqDocs > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                                {verifiedDocsCount}/{totalReqDocs} Verified
                              </span>
                            </div>
                            {indiv.drivingInfo && (
                              <span className={`text-[10px] block font-mono ${indiv.drivingInfo.verificationStatus === "EXPIRED" ? "text-rose-600 font-bold" : "text-neutral-400"}`}>
                                SIM: {indiv.drivingInfo.licenseExpiry}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {latestAgreement ? (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              T&C v{latestAgreement.agreementVersion} ✓
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 italic">Belum T&C</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <EligibilityBadge eligibility={eligibility} size="sm" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/corporate/customers/${indiv.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 font-semibold">
                              Review KYC
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddCustomerModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        defaultType={activeTab === "corporate" ? "CORPORATE" : "INDIVIDUAL"}
        onCustomerCreated={() => loadData()}
      />
    </div>
  );
}
