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
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  ExternalLink,
  Car,
  FileText,
} from "lucide-react";
import { mockCorporateCustomers, getCorporateCustomers } from "@/lib/data";
import { CorporateCustomer } from "@/lib/types/corporate";

export default function CorporateCustomersPage() {
  const [search, setSearch] = React.useState("");
  const [selectedCustomer, setSelectedCustomer] = React.useState<CorporateCustomer | null>(null);

  const filtered = mockCorporateCustomers.filter((c) => {
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.picName.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Corporate Customers
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            B2B accounts &middot; Fleet utilization &middot; Dedicated PIC contacts
          </p>
        </div>

        <Link href="/corporate/contracts">
          <Button variant="outline" size="sm" className="gap-1.5 font-medium text-xs">
            <FileText className="h-3.5 w-3.5" />
            View All Contracts
          </Button>
        </Link>
      </div>

      {/* Main Table */}
      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Search company, PIC name, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs bg-neutral-50"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead>Company</TableHead>
                <TableHead>PIC & Contact</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Active Contracts</TableHead>
                <TableHead>Allocated Fleet</TableHead>
                <TableHead>Operational Health</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c, idx) => {
                const isShortage = c.maintenanceVehicles > 0;
                return (
                  <TableRow
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="cursor-pointer hover:bg-neutral-50"
                  >
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-900">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-purple-50 text-purple-700">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm">{c.name}</div>
                          <div className="text-[11px] font-normal text-neutral-400">{c.city}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-neutral-900">{c.picName}</span>
                        <span className="text-[11px] text-neutral-500">{c.picPhone}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-neutral-600 text-xs">
                      {c.industry}
                    </TableCell>

                    <TableCell className="font-semibold text-neutral-900">
                      {c.activeContractsCount} Contracts
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium text-xs text-neutral-900">
                        <Car className="h-3.5 w-3.5 text-neutral-400" />
                        <span>{c.totalAllocatedVehicles} Vehicles</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isShortage ? "text-rose-700" : "text-emerald-700"
                          }`}
                        >
                          {c.operationalVehicles} / {c.totalAllocatedVehicles}
                        </span>
                        {isShortage && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                            1 Maint.
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Quick Overview Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                <DialogTitle>{selectedCustomer.name}</DialogTitle>
              </div>
              <DialogDescription>
                Corporate Client Overview &middot; {selectedCustomer.city}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-xs py-2">
              <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200/70">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Person in Charge (PIC)</span>
                  <span className="font-bold text-neutral-900">{selectedCustomer.picName}</span>
                  <span className="text-neutral-500 block text-[11px]">{selectedCustomer.picRole}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Contact Info</span>
                  <span className="text-neutral-800 block">{selectedCustomer.picPhone}</span>
                  <span className="text-neutral-500 block truncate">{selectedCustomer.picEmail}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-neutral-50 rounded border">
                  <span className="text-[10px] uppercase text-neutral-400 block font-semibold">Total Fleet</span>
                  <span className="text-lg font-bold text-neutral-900">{selectedCustomer.totalAllocatedVehicles}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                  <span className="text-[10px] uppercase text-emerald-700 block font-semibold">Operational</span>
                  <span className="text-lg font-bold text-emerald-800">{selectedCustomer.operationalVehicles}</span>
                </div>
                <div className="p-3 bg-rose-50 rounded border border-rose-200">
                  <span className="text-[10px] uppercase text-rose-700 block font-semibold">Under Maint.</span>
                  <span className="text-lg font-bold text-rose-800">{selectedCustomer.maintenanceVehicles}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                >
                  Close
                </Button>
                <Link href={`/corporate/contracts/CTR-2026-001`}>
                  <Button size="sm" className="gap-1.5">
                    View Active Contract <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
