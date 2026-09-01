"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  User,
  Building2,
  KeyRound,
  CalendarClock,
  RotateCcw,
  FileCheck2,
  Car,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

export function BusinessSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* B2C Rental Operations Card */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-neutral-100 text-neutral-900">
              <User className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">
                B2C Rental
              </CardTitle>
              <p className="text-[11px] text-neutral-500">
                Individual daily rentals &middot; Jaja-owned only
              </p>
            </div>
          </div>
          <Link
            href="/rental/b2c"
            className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
          >
            Manage B2C <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent className="pt-4 grid grid-cols-3 gap-3">
          <Link
            href="/rental/b2c?status=active"
            className="p-3 rounded-md bg-neutral-50 hover:bg-neutral-100/80 transition-colors border border-neutral-100 text-center"
          >
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <KeyRound className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-neutral-900">28</div>
            <div className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Active Rentals
            </div>
          </Link>

          <Link
            href="/rental/reservations"
            className="p-3 rounded-md bg-neutral-50 hover:bg-neutral-100/80 transition-colors border border-neutral-100 text-center"
          >
            <div className="flex items-center justify-center text-amber-600 mb-1">
              <CalendarClock className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-neutral-900">12</div>
            <div className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Reservations
            </div>
          </Link>

          <Link
            href="/rental/b2c?filter=returns_today"
            className="p-3 rounded-md bg-neutral-50 hover:bg-neutral-100/80 transition-colors border border-neutral-100 text-center"
          >
            <div className="flex items-center justify-center text-emerald-600 mb-1">
              <RotateCcw className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-neutral-900">4</div>
            <div className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Returns Today
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* B2B Rent-to-Rent Operations Card */}
      <Card className="border-neutral-200">
        <CardHeader className="pb-3 border-b border-neutral-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-50 text-purple-700">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">
                B2B Rent-to-Rent
              </CardTitle>
              <p className="text-[11px] text-neutral-500">
                Corporate long-term &middot; Jaja & Vendor fleets
              </p>
            </div>
          </div>
          <Link
            href="/rental/b2b"
            className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
          >
            Manage B2B <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent className="pt-4 grid grid-cols-3 gap-3">
          <Link
            href="/corporate/contracts"
            className="p-3 rounded-md bg-neutral-50 hover:bg-neutral-100/80 transition-colors border border-neutral-100 text-center"
          >
            <div className="flex items-center justify-center text-neutral-700 mb-1">
              <FileCheck2 className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-neutral-900">44</div>
            <div className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Active Contracts
            </div>
          </Link>

          <Link
            href="/rental/b2b"
            className="p-3 rounded-md bg-neutral-50 hover:bg-neutral-100/80 transition-colors border border-neutral-100 text-center"
          >
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <Car className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-neutral-900">68</div>
            <div className="text-[10px] uppercase font-semibold text-neutral-500 tracking-wider">
              Deployed Fleet
            </div>
          </Link>

          <Link
            href="/corporate/contracts/CTR-2026-001?action=replacement"
            className="p-3 rounded-md bg-rose-50/70 hover:bg-rose-100/80 transition-colors border border-rose-200 text-center"
          >
            <div className="flex items-center justify-center text-rose-600 mb-1">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <div className="text-xl font-bold text-rose-700">2</div>
            <div className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">
              Replacement Req.
            </div>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
