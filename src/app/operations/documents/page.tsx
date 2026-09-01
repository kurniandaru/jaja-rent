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
import { StatusBadge } from "@/components/ui/status-badge";
import { OwnershipBadge } from "@/components/ui/priority-badge";
import {
  FileCheck2,
  FileWarning,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockDocuments, getVehicleDocuments, getDocumentExpirySummary } from "@/lib/data";
import { formatDate, formatRupiah } from "@/lib/utils";

export default function DocumentMonitoringPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");
  const [docFilter, setDocFilter] = React.useState("ALL");

  const filtered = mockDocuments.filter((d) => {
    const matchesSearch =
      d.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.model.toLowerCase().includes(search.toLowerCase()) ||
      d.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.documentType.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = docFilter === "ALL" ? true : d.status === docFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Document Monitoring & Legal Compliance
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            STNK, KIR uji berkala, Pajak tahunan, and Commercial All Risk
            insurance tracking
          </p>
        </div>
      </div>

      {/* Expiry Bucket KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-rose-200 bg-rose-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-rose-800 tracking-wider">
                Expired
              </span>
              <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">
                2
              </div>
              <span className="text-[11px] text-rose-700 font-medium">
                Immediate hold
              </span>
            </div>
            <div className="p-2 rounded-md bg-rose-100 text-rose-700">
              <FileWarning className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase text-amber-800 tracking-wider">
                Expires &lt; 7 Days
              </span>
              <div className="text-2xl font-bold text-amber-800 mt-1 font-mono">
                1
              </div>
              <span className="text-[11px] text-amber-700 font-medium">
                Critical countdown
              </span>
            </div>
            <div className="p-2 rounded-md bg-amber-100 text-amber-800">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Expires &lt; 30 Days
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                8
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">
                Renewal processing
              </span>
            </div>
            <div className="p-2 rounded-md bg-neutral-100 text-neutral-800">
              <FileCheck2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase text-neutral-500 tracking-wider">
                Expires &lt; 90 Days
              </span>
              <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">
                17
              </div>
              <span className="text-[11px] text-neutral-500 font-medium">
                Upcoming renewal
              </span>
            </div>
            <div className="p-2 rounded-md bg-neutral-100 text-neutral-800">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Search document no, plate, vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs bg-neutral-50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={docFilter}
              onChange={(e) => setDocFilter(e.target.value)}
              className="h-8 rounded-md border border-neutral-200 bg-white px-2 py-1 text-xs text-neutral-700"
            >
              <option value="ALL">All Document Statuses</option>
              <option value="EXPIRED">Expired Only</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="ACTIVE">Active</option>
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
                <TableHead>Vehicle</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Document Number</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc, idx) => {
                const isExpired = doc.daysUntilExpiry < 0;
                const isUrgent =
                  doc.daysUntilExpiry <= 30 && doc.daysUntilExpiry >= 0;

                return (
                  <TableRow
                    key={doc.id}
                    onClick={() => router.push(`/fleet/${doc.vehicleId}`)}
                    className={`cursor-pointer ${
                      isExpired
                        ? "bg-rose-50/40 hover:bg-rose-50/70"
                        : isUrgent
                          ? "bg-amber-50/30 hover:bg-amber-50/60"
                          : "hover:bg-neutral-50"
                    }`}
                  >
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="font-semibold text-neutral-900">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">
                          {doc.plateNumber}
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          {doc.model}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded text-xs">
                        {doc.documentType}
                      </span>
                    </TableCell>

                    <TableCell className="font-mono text-neutral-700 text-xs">
                      {doc.documentNumber}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <OwnershipBadge ownership={doc.ownership} />
                        {doc.vendorName && (
                          <span className="text-[10px] text-neutral-400 mt-0.5">
                            {doc.vendorName}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="font-mono font-medium text-neutral-900 text-xs">
                      {formatDate(doc.expiryDate)}
                    </TableCell>

                    <TableCell>
                      {isExpired ? (
                        <span className="font-mono font-bold text-rose-700 text-xs">
                          Expired ({Math.abs(doc.daysUntilExpiry)} days ago)
                        </span>
                      ) : isUrgent ? (
                        <span className="font-mono font-bold text-amber-700 text-xs">
                          {doc.daysUntilExpiry} days remaining
                        </span>
                      ) : (
                        <span className="font-mono text-neutral-600 text-xs">
                          {doc.daysUntilExpiry} days
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={doc.status} />
                    </TableCell>

                    <TableCell>
                      <Button variant="outline" size="xs">
                        Renew
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
