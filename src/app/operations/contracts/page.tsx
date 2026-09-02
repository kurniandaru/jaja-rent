"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { CorporateContract } from "@/lib/types/corporate";
import { getCorporateContracts } from "@/lib/data/contracts";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowUpRight,
  Layers,
  Plus,
} from "lucide-react";

export default function ContractsListPage() {
  const router = useRouter();
  const [contracts, setContracts] = React.useState<CorporateContract[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");

  React.useEffect(() => {
    async function load() {
      const data = await getCorporateContracts();
      setContracts(data);
    }
    load();
  }, []);

  const filtered = contracts.filter((c) => {
    const s = search.toLowerCase();
    const matchesSearch =
      c.contractNumber.toLowerCase().includes(s) ||
      c.corporateCustomerName.toLowerCase().includes(s);

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRequiredFleet = contracts.reduce((acc, c) => acc + (c.requiredFleet || 0), 0);
  const totalAllocatedFleet = contracts.reduce((acc, c) => acc + (c.allocatedFleet || 0), 0);
  const totalShortages = contracts.reduce((acc, c) => acc + (c.shortageCount || 0), 0);
  const activeContractsCount = contracts.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Corporate Contracts & Allocation
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Kelola kesepakatan kontrak B2B resmi, alokasi armada Jaja/Vendor, dan monitoring kekurangan unit.
          </p>
        </div>

        <Link href="/operations/reservations">
          <Button className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm gap-2 font-bold shadow-xs">
            <Plus className="h-4 w-4" />
            + Buat Kontrak dari Reservasi
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Kontrak Aktif
              </span>
              <FileText className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">
                {activeContractsCount}
              </span>
              <span className="text-xs text-neutral-500">perusahaan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Total Armada Kontrak
              </span>
              <Layers className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {totalRequiredFleet}
              </span>
              <span className="text-xs text-neutral-500">unit disepakati</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Unit Teralokasi
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {totalAllocatedFleet}
              </span>
              <span className="text-xs text-neutral-500">unit operasional</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Fleet Shortage Alert
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-rose-600">
                {totalShortages}
              </span>
              <span className="text-xs text-rose-600 font-semibold">butuh replacement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Contracts Table */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-900">
              Daftar Kontrak Sewa Korporat (B2B)
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Setiap kontrak memuat klausul SLA resmi dan pembagian alokasi unit Jaja-owned / Vendor-owned.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Cari nomor kontrak, nama customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8.5 h-8.5 text-xs bg-neutral-50/70"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-800"
            >
              <option value="ALL">Status: Semua</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50/80 text-neutral-600">
              <TableRow className="border-b border-neutral-200/80 hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Contract Number
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Corporate Customer
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Period (Start – End)
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                  Billing / Bln
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Fleet (Req / Alloc)
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-neutral-500 text-sm">
                    Tidak ada kontrak yang sesuai kriteria pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    onClick={() => router.push(`/operations/contracts/${item.id}`)}
                    className="border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors cursor-pointer"
                  >
                    {/* 1. No */}
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {idx + 1}
                    </TableCell>

                    {/* 2. Contract Number */}
                    <TableCell className="font-mono font-semibold text-blue-600 hover:underline text-xs">
                      {item.contractNumber}
                    </TableCell>

                    {/* 3. Corporate Customer */}
                    <TableCell>
                      <div className="font-bold text-neutral-900 text-xs flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                        {item.corporateCustomerName}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        ID: {item.corporateCustomerId}
                      </div>
                    </TableCell>

                    {/* 4. Period */}
                    <TableCell className="text-xs font-mono text-neutral-700">
                      {item.startDate} &rarr; {item.endDate}
                    </TableCell>

                    {/* 5. Billing */}
                    <TableCell className="text-right font-mono font-bold text-xs text-neutral-900">
                      {formatCurrency(item.monthlyBillingAmount)}
                    </TableCell>

                    {/* 6. Fleet Allocation */}
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold">
                        <span className="text-neutral-900">{item.allocatedFleet}</span>
                        <span className="text-neutral-400">/</span>
                        <span className="text-neutral-600">{item.requiredFleet}</span>
                        {item.shortageCount > 0 && (
                          <span className="ml-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                            -{item.shortageCount} unit
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* 7. Status */}
                    <TableCell className="text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "EXPIRING_SOON"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>

                    {/* 8. Action */}
                    <TableCell className="text-right pr-6">
                      <Link
                        href={`/operations/contracts/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        Alokasi Unit
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
