"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
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
import { OwnershipBadge } from "@/components/ui/priority-badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Wrench,
  Building2,
  User,
  ShieldCheck,
} from "lucide-react";
import { mockVehicles, getVehicles } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

function FleetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "all";
  const ownershipParam = searchParams.get("ownership") || "all";
  const statusParam = searchParams.get("status") || "all";
  const searchParam = searchParams.get("search") || "";

  const [search, setSearch] = React.useState(searchParam);
  const [activeTab, setActiveTab] = React.useState(
    statusParam !== "all"
      ? statusParam.toLowerCase()
      : ownershipParam !== "all"
      ? ownershipParam.toLowerCase()
      : tabParam
  );
  const [eligibilityFilter, setEligibilityFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<"plate" | "odometer" | "year">("plate");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");
  const [page, setPage] = React.useState(1);
  const pageSize = 10;

  // Filter vehicles based on active tab & secondary filters
  const filteredVehicles = mockVehicles.filter((veh) => {
    // Search text
    const matchesSearch =
      veh.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      veh.brand.toLowerCase().includes(search.toLowerCase()) ||
      veh.model.toLowerCase().includes(search.toLowerCase()) ||
      (veh.currentCustomerName &&
        veh.currentCustomerName.toLowerCase().includes(search.toLowerCase())) ||
      veh.locationCity.toLowerCase().includes(search.toLowerCase());

    // Tab filter
    let matchesTab = true;
    if (activeTab === "jaja_owned") {
      matchesTab = veh.ownership === "JAJA_OWNED";
    } else if (activeTab === "vendor_owned") {
      matchesTab = veh.ownership === "VENDOR_OWNED";
    } else if (activeTab === "available") {
      matchesTab = veh.status === "AVAILABLE";
    } else if (activeTab === "rented") {
      matchesTab = veh.status === "RENTED";
    } else if (activeTab === "maintenance") {
      matchesTab = veh.status === "MAINTENANCE";
    }

    // Eligibility filter
    let matchesEligibility = true;
    if (eligibilityFilter === "B2C") {
      matchesEligibility = veh.businessEligibility === "B2C" || veh.businessEligibility === "BOTH";
    } else if (eligibilityFilter === "B2B") {
      matchesEligibility = true;
    }

    return matchesSearch && matchesTab && matchesEligibility;
  });

  // Sort
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortField === "odometer") {
      return sortOrder === "asc"
        ? a.odometer - b.odometer
        : b.odometer - a.odometer;
    }
    if (sortField === "year") {
      return sortOrder === "asc" ? a.year - b.year : b.year - a.year;
    }
    return sortOrder === "asc"
      ? a.plateNumber.localeCompare(b.plateNumber)
      : b.plateNumber.localeCompare(a.plateNumber);
  });

  const totalPages = Math.ceil(sortedVehicles.length / pageSize) || 1;
  const paginatedVehicles = sortedVehicles.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const toggleSort = (field: "plate" | "odometer" | "year") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Fleet
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Comprehensive registry & operations monitoring across all {mockVehicles.length} vehicles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/operations/inspection">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Inspection Log
            </Button>
          </Link>
          <Link href="/operations/maintenance">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-medium">
              <Wrench className="h-3.5 w-3.5" />
              Service Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-neutral-200 shadow-xs">
        {/* Navigation Tabs */}
        <div className="border-b border-neutral-200/80 bg-neutral-50/75 px-4 pt-3 flex flex-wrap gap-1">
          {[
            { id: "all", label: "All Vehicles", count: mockVehicles.length },
            {
              id: "jaja_owned",
              label: "Jaja Owned",
              count: mockVehicles.filter((v) => v.ownership === "JAJA_OWNED").length,
            },
            {
              id: "vendor_owned",
              label: "Vendor Owned",
              count: mockVehicles.filter((v) => v.ownership === "VENDOR_OWNED").length,
            },
            {
              id: "available",
              label: "Available",
              count: mockVehicles.filter((v) => v.status === "AVAILABLE").length,
            },
            {
              id: "rented",
              label: "Rented",
              count: mockVehicles.filter((v) => v.status === "RENTED").length,
            },
            {
              id: "maintenance",
              label: "Maintenance",
              count: mockVehicles.filter((v) => v.status === "MAINTENANCE").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "border-neutral-900 text-neutral-900 bg-white rounded-t-md font-semibold"
                  : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? "bg-neutral-900 text-white font-semibold"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Controls Strip */}
        <div className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Search plate, model, customer, location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 text-xs bg-neutral-50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Eligibility filter */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span className="text-[11px] font-medium text-neutral-400 uppercase">Eligibility:</span>
              <select
                value={eligibilityFilter}
                onChange={(e) => {
                  setEligibilityFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              >
                <option value="all">All Models</option>
                <option value="B2C">B2C Eligible (Jaja Only)</option>
                <option value="B2B">B2B Eligible (Jaja & Vendor)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dense Data Table */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead
                  onClick={() => toggleSort("plate")}
                  className="cursor-pointer hover:text-neutral-900"
                >
                  <div className="flex items-center gap-1">
                    Vehicle <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                  </div>
                </TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead
                  onClick={() => toggleSort("odometer")}
                  className="cursor-pointer hover:text-neutral-900"
                >
                  <div className="flex items-center gap-1">
                    Odometer <ArrowUpDown className="h-3 w-3 text-neutral-400" />
                  </div>
                </TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Maintenance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-28 text-center text-neutral-500">
                    No vehicles found matching the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVehicles.map((veh, idx) => (
                  <TableRow
                    key={veh.id}
                    onClick={() => router.push(`/fleet/${veh.id}`)}
                    className="cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-900">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs tracking-tight">
                          {veh.plateNumber}
                        </span>
                        <span className="text-[11px] font-normal text-neutral-500 line-clamp-1">
                          {veh.brand} {veh.model} ({veh.year})
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <OwnershipBadge ownership={veh.ownership} />
                    </TableCell>

                    <TableCell>
                      <span className="text-[11px] font-medium text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {veh.businessEligibility === "BOTH" ? "B2C / B2B" : veh.businessEligibility}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={veh.status} />
                    </TableCell>

                    <TableCell className="max-w-44 truncate text-neutral-800 font-medium">
                      {veh.currentCustomerName ? (
                        <div className="flex items-center gap-1.5">
                          {veh.currentRentalType === "B2B" ? (
                            <Building2 className="h-3 w-3 text-purple-600 shrink-0" />
                          ) : (
                            <User className="h-3 w-3 text-blue-600 shrink-0" />
                          )}
                          <span className="truncate">{veh.currentCustomerName}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 font-normal">Unassigned</span>
                      )}
                    </TableCell>

                    <TableCell className="text-neutral-600 text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-800">{veh.locationCity}</span>
                        <span className="text-[10px] text-neutral-400 line-clamp-1">{veh.locationArea}</span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-neutral-800">
                      {formatNumber(veh.odometer)} KM
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          veh.documentStatus === "OK"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : veh.documentStatus === "EXPIRING_SOON"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {veh.documentStatus.replace(/_/g, " ")}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          veh.maintenanceStatus === "OK"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : veh.maintenanceStatus === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {veh.maintenanceStatus.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-xs text-neutral-500">
            <div>
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * pageSize, sortedVehicles.length)}
              </span>{" "}
              of <span className="font-medium">{sortedVehicles.length}</span> vehicles
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

export default function FleetPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-neutral-400">Loading Fleet Registry...</div>}>
      <FleetContent />
    </Suspense>
  );
}
