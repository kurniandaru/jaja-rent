"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
} from "lucide-react";
import { mockRentals } from "@/lib/data";
import { formatShortDate } from "@/lib/utils";

export function ActiveRentals() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"ALL" | "B2C" | "B2B">(
    "ALL",
  );
  const [page, setPage] = React.useState(1);
  const pageSize = 5;

  const filteredRentals = mockRentals.filter((item) => {
    const matchesSearch =
      item.vehiclePlate.toLowerCase().includes(search.toLowerCase()) ||
      item.vehicleModel.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (item.driverName &&
        item.driverName.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === "ALL" ? true : item.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredRentals.length / pageSize) || 1;
  const paginatedData = filteredRentals.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <Card className="border-neutral-200">
      <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-sm sm:text-base font-semibold text-neutral-900">
            Active Rentals & Dispatches
          </CardTitle>
          <p className="text-xs text-neutral-500">
            Live operational vehicle deployments across B2C and B2B clients
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Filter plate, customer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-8 w-48 sm:w-56 pl-8 text-xs bg-neutral-50 focus:bg-white"
            />
          </div>

          {/* Type filter toggles */}
          <div className="flex rounded-md bg-neutral-100 p-0.5 border border-neutral-200/60">
            <button
              onClick={() => {
                setTypeFilter("ALL");
                setPage(1);
              }}
              className={`px-2 py-1 text-xs font-medium rounded ${
                typeFilter === "ALL"
                  ? "bg-white shadow-xs text-neutral-900"
                  : "text-neutral-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setTypeFilter("B2C");
                setPage(1);
              }}
              className={`px-2 py-1 text-xs font-medium rounded ${
                typeFilter === "B2C"
                  ? "bg-white shadow-xs text-neutral-900"
                  : "text-neutral-600"
              }`}
            >
              B2C
            </button>
            <button
              onClick={() => {
                setTypeFilter("B2B");
                setPage(1);
              }}
              className={`px-2 py-1 text-xs font-medium rounded ${
                typeFilter === "B2B"
                  ? "bg-white shadow-xs text-neutral-900"
                  : "text-neutral-600"
              }`}
            >
              B2B
            </button>
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
              <TableHead>Vehicle</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-neutral-500"
                >
                  No active rental records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((rental, idx) => (
                <TableRow
                  key={rental.id}
                  onClick={() => router.push(`/fleet/${rental.vehicleId}`)}
                  className="cursor-pointer hover:bg-neutral-50/80"
                >
                  <TableCell className="text-center font-medium text-neutral-500 text-xs">
                    {(page - 1) * pageSize + idx + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-neutral-900">
                    <div className="flex flex-col">
                      <span>{rental.vehiclePlate}</span>
                      <span className="text-[11px] font-normal text-neutral-500">
                        {rental.vehicleModel}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        rental.type === "B2B"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {rental.type === "B2B" ? (
                        <Building2 className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {rental.type}
                    </span>
                  </TableCell>

                  <TableCell className="font-medium text-neutral-800 max-w-44 truncate">
                    {rental.customerName}
                  </TableCell>

                  <TableCell className="text-neutral-600">
                    {rental.driverName || "-"}
                  </TableCell>

                  <TableCell className="font-mono text-neutral-600">
                    {formatShortDate(rental.startDate)}
                  </TableCell>

                  <TableCell className="font-mono text-neutral-900 font-medium">
                    {formatShortDate(rental.endDate)}
                  </TableCell>

                  <TableCell className="text-neutral-600 max-w-36 truncate">
                    {rental.dropoffLocation}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={rental.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 text-xs text-neutral-500">
          <div>
            Showing{" "}
            <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, filteredRentals.length)}
            </span>{" "}
            of <span className="font-medium">{filteredRentals.length}</span>{" "}
            deployments
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
  );
}
