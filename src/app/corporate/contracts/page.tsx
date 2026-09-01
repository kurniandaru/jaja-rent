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
import {
  FileText,
  Building2,
  AlertTriangle,
  Search,
  ExternalLink,
  Car,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { mockContracts, getCorporateContracts } from "@/lib/data";
import { formatRupiah, formatDate, formatShortDate } from "@/lib/utils";

export default function CorporateContractsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = mockContracts.filter((c) => {
    return (
      c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.corporateCustomerName.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Corporate Contracts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Long-term B2B fleet leasing agreements, terms, and fleet quota
            health
          </p>
        </div>

        <Link href="/corporate/allocation">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 font-medium text-xs"
          >
            <Car className="h-3.5 w-3.5" />
            Fleet Allocation Matrix
          </Button>
        </Link>
      </div>

      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Search contract number, corporate client..."
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
                <TableHead>Contract No.</TableHead>
                <TableHead>Corporate Customer</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Required Fleet</TableHead>
                <TableHead>Operational Health</TableHead>
                <TableHead>Monthly Billing</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((ctr, idx) => (
                <TableRow
                  key={ctr.id}
                  onClick={() => router.push(`/corporate/contracts/${ctr.id}`)}
                  className="cursor-pointer hover:bg-neutral-50"
                >
                  <TableCell className="text-center font-medium text-neutral-500 text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-mono font-bold text-blue-600">
                    <div className="flex items-center gap-1">
                      {ctr.contractNumber}
                      <ExternalLink className="h-3 w-3 text-neutral-400" />
                    </div>
                  </TableCell>

                  <TableCell className="font-semibold text-neutral-900">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                      {ctr.corporateCustomerName}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-neutral-600 text-xs">
                    {formatShortDate(ctr.startDate)} —{" "}
                    {formatShortDate(ctr.endDate)}
                  </TableCell>

                  <TableCell className="font-semibold text-neutral-900">
                    {ctr.requiredFleet} Vehicles
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs">
                        {ctr.operationalFleet} / {ctr.requiredFleet}
                      </span>
                      {ctr.shortageCount > 0 ? (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          Shortage: {ctr.shortageCount}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                          100% Fulfilled
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono font-medium text-neutral-900 text-xs">
                    {formatRupiah(ctr.monthlyBillingAmount)}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={ctr.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
