"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Building2,
  FileText,
  Car,
  AlertTriangle,
  Search,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { mockRentals, getRentals } from "@/lib/data";
import { formatShortDate, formatRupiah } from "@/lib/utils";

export default function B2BRentalPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  // Filter only B2B records
  const b2bRentals = mockRentals.filter((r) => r.type === "B2B");

  const filtered = b2bRentals.filter((r) => {
    return (
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      (r.corporateContractId &&
        r.corporateContractId.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            B2B Rentals
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Corporate long-term rent-to-rent operations &middot; Jaja & Vendor
            fleets &middot; Replacement unit workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/corporate/contracts">
            <Button variant="outline" size="sm" className="gap-1.5 font-medium">
              <FileText className="h-3.5 w-3.5" />
              Corporate Contracts
            </Button>
          </Link>
          <Link href="/corporate/contracts/CTR-2026-001?action=replacement">
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5 font-medium"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Replacement Action (2)
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Active Contracts
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">44</div>
              <span className="text-[11px] text-neutral-500 font-medium">
                Across 10 corporate accounts
              </span>
            </div>
            <div className="p-2 rounded-md bg-neutral-100 text-neutral-800">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Deployed Vehicles
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">68</div>
              <span className="text-[11px] text-blue-600 font-medium">
                Under active corporate lease
              </span>
            </div>
            <div className="p-2 rounded-md bg-blue-50 text-blue-700">
              <Car className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-rose-800 tracking-wider">
                Replacement Required
              </span>
              <div className="text-2xl font-bold text-rose-700 mt-1">2</div>
              <span className="text-[11px] text-rose-700 font-medium">
                Fleet shortage detected
              </span>
            </div>
            <div className="p-2 rounded-md bg-rose-100 text-rose-700">
              <ShieldAlert className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Search contract CTR, corporate name, plate..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs bg-neutral-50 focus:bg-white"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Corporate Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver Assigned</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-neutral-500"
                  >
                    No B2B rental records found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((r, idx) => (
                  <TableRow
                    key={r.id}
                    onClick={() =>
                      router.push(
                        r.corporateContractId
                          ? `/corporate/contracts/${r.corporateContractId}`
                          : `/fleet/${r.vehicleId}`,
                      )
                    }
                    className="cursor-pointer hover:bg-neutral-50"
                  >
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-blue-600 hover:underline">
                      <div className="flex items-center gap-1">
                        {r.corporateContractId || "CTR-DIRECT"}
                        <ExternalLink className="h-3 w-3 text-neutral-400" />
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-900">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                        {r.customerName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 text-xs">
                          {r.vehiclePlate}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {r.vehicleModel}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {r.driverName || "Corporate Designated Driver"}
                    </TableCell>
                    <TableCell className="font-mono text-neutral-600">
                      {formatShortDate(r.startDate)}
                    </TableCell>
                    <TableCell className="font-mono text-neutral-900 font-medium">
                      {formatShortDate(r.endDate)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={r.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-xs text-neutral-500">
            <div>
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
              records
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-mono">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
