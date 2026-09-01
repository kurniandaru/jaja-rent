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
  User,
  KeyRound,
  CalendarClock,
  RotateCcw,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Car,
} from "lucide-react";
import { mockRentals, getRentals } from "@/lib/data";
import { formatDate, formatRupiah, formatShortDate } from "@/lib/utils";

export default function B2CRentalPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const pageSize = 8;

  // Filter only B2C records
  const b2cRentals = mockRentals.filter((r) => r.type === "B2C");

  const filtered = b2cRentals.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicleModel.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ? true : r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            B2C Rentals
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Individual retail rentals &middot; Daily agreements &middot;
            Jaja-owned fleet only
          </p>
        </div>

        <Link href="/rental/reservations">
          <Button size="sm" className="gap-1.5 font-medium">
            <CalendarClock className="h-3.5 w-3.5" />
            View Reservations Queue
          </Button>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Active Rentals
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">28</div>
              <span className="text-[11px] text-emerald-600 font-medium">
                Currently dispatched
              </span>
            </div>
            <div className="p-2 rounded-md bg-blue-50 text-blue-700">
              <KeyRound className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Reservations
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">12</div>
              <span className="text-[11px] text-amber-600 font-medium">
                Next 7 days
              </span>
            </div>
            <div className="p-2 rounded-md bg-amber-50 text-amber-700">
              <CalendarClock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Returns Today
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1">4</div>
              <span className="text-[11px] text-neutral-500 font-medium">
                Require return inspection
              </span>
            </div>
            <div className="p-2 rounded-md bg-emerald-50 text-emerald-700">
              <RotateCcw className="h-5 w-5" />
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
                placeholder="Search Rental ID, customer, plate..."
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
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead>Rental ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Driver Option</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                  >
                    No B2C rental records found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((r, idx) => (
                  <TableRow
                    key={r.id}
                    onClick={() => router.push(`/fleet/${r.vehicleId}`)}
                    className="cursor-pointer hover:bg-neutral-50"
                  >
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {(page - 1) * pageSize + idx + 1}
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
                    <TableCell className="font-medium text-neutral-800">
                      {r.customerName}
                    </TableCell>
                    <TableCell className="font-mono text-neutral-600">
                      {formatShortDate(r.startDate)}
                    </TableCell>
                    <TableCell className="font-mono text-neutral-900 font-medium">
                      {formatShortDate(r.endDate)}
                    </TableCell>
                    <TableCell className="text-neutral-700">
                      {r.withDriver ? (
                        <span className="text-blue-700 font-medium text-[11px]">
                          With Driver ({r.driverName})
                        </span>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">
                          Self Drive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-neutral-900">
                      {formatRupiah(r.totalAmount)}
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
