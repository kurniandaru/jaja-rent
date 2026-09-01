"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Car,
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { mockCorporateCustomers, mockContracts, getCorporateCustomers } from "@/lib/data";

export default function FleetAllocationPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Fleet Allocation Matrix
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            High-level distribution of corporate dedicated vehicles and
            operational reserve pools
          </p>
        </div>

        <Link href="/corporate/contracts">
          <Button variant="outline" size="sm" className="text-xs font-medium">
            Manage Contracts
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCorporateCustomers.map((cust) => {
          const contract = mockContracts.find(
            (c) => c.corporateCustomerId === cust.id,
          );
          const ratio =
            (cust.operationalVehicles / cust.totalAllocatedVehicles) * 100;
          return (
            <Card
              key={cust.id}
              className="border-neutral-200 hover:border-neutral-300 transition-all"
            >
              <CardHeader className="p-4 pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  <CardTitle className="text-sm font-semibold">
                    {cust.name}
                  </CardTitle>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                  {cust.city}
                </span>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-neutral-500 font-medium">
                    Quota Fulfillment
                  </span>
                  <span className="font-mono font-bold text-neutral-900">
                    {cust.operationalVehicles} / {cust.totalAllocatedVehicles}{" "}
                    Units ({Math.round(ratio)}%)
                  </span>
                </div>

                <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      ratio < 100 ? "bg-rose-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100 text-neutral-600">
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                      PIC
                    </span>
                    <span className="font-medium text-neutral-900">
                      {cust.picName}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px] uppercase font-semibold">
                      Active Contract
                    </span>
                    <span className="font-mono text-blue-600">
                      {contract ? contract.contractNumber : "CTR-2026-001"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/corporate/contracts/${contract ? contract.id : "CTR-2026-001"}`}
                  >
                    <Button
                      variant="subtle"
                      size="xs"
                      className="w-full justify-between"
                    >
                      <span>View Contract Allocation</span>
                      <ChevronRight className="h-3 w-3 text-neutral-400" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
