import * as React from "react";
import { FleetSummary } from "@/components/dashboard/fleet-summary";
import { BusinessSummary } from "@/components/dashboard/business-summary";
import { ActionRequired } from "@/components/dashboard/action-required";
import { FleetStatusChart } from "@/components/dashboard/fleet-status-chart";
import { LiveFleet } from "@/components/dashboard/live-fleet";
import { ActiveRentals } from "@/components/dashboard/active-rentals";
import { FleetAvailability } from "@/components/dashboard/fleet-availability";

export default function OperationsDashboardPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Jaja-Rent Operations
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Operational cockpit &middot; Dual model (B2C Rental & B2B Rent-to-Rent)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-white border border-neutral-200 px-2.5 py-1 rounded-md">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-neutral-700">Dispatch System Active</span>
            <span className="text-neutral-300">|</span>
            <span className="font-mono text-[11px]">Sep 2026</span>
          </div>
        </div>
      </div>

      {/* 1. Fleet Summary Cards */}
      <section aria-label="Fleet Summary">
        <FleetSummary />
      </section>

      {/* 2. Business Summary (B2C vs B2B) */}
      <section aria-label="Business Summary">
        <BusinessSummary />
      </section>

      {/* 3. Action Required (Critical Alert Management) */}
      <section aria-label="Action Required">
        <ActionRequired />
      </section>

      {/* 4. Fleet Status Distribution Visualization */}
      <section aria-label="Fleet Status">
        <FleetStatusChart />
      </section>

      {/* 5. Live Fleet GPS Telemetry Map */}
      <section aria-label="Live Fleet">
        <LiveFleet />
      </section>

      {/* 6. Active Rentals Operational Data Table */}
      <section aria-label="Active Rentals">
        <ActiveRentals />
      </section>

      {/* 7. Fleet Availability Engine */}
      <section aria-label="Fleet Availability">
        <FleetAvailability />
      </section>
    </div>
  );
}
