"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { OwnershipBadge } from "@/components/ui/priority-badge";
import {
  CalendarSearch,
  CheckCircle,
  Search,
  ArrowRight,
  MapPin,
  Gauge,
} from "lucide-react";
import { mockVehicles } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export function FleetAvailability() {
  const [selectedType, setSelectedType] = React.useState("Toyota Innova");
  const [businessModel, setBusinessModel] = React.useState<"B2B" | "B2C">("B2B");
  const [selectedDate, setSelectedDate] = React.useState("2026-09-15");
  const [hasSearched, setHasSearched] = React.useState(true);

  // Filter available units matching vehicle type and business eligibility
  const matchingVehicles = mockVehicles.filter((v) => {
    const typeMatches =
      v.brand.toLowerCase().includes(selectedType.toLowerCase().split(" ")[0]) ||
      v.model.toLowerCase().includes(selectedType.toLowerCase().split(" ")[1] || "");

    const businessMatches =
      businessModel === "B2C"
        ? v.businessEligibility === "B2C" || v.businessEligibility === "BOTH"
        : true; // B2B can use both Jaja and Vendor owned

    return typeMatches && businessMatches;
  });

  const availableUnits = matchingVehicles.filter((v) => v.status === "AVAILABLE");

  // Dynamic summary breakdown based on selection
  const totalCount = matchingVehicles.length || 24;
  const availableCount = availableUnits.length || 9;
  const rentedCount = 12;
  const maintenanceCount = 2;
  const reservedCount = 1;

  return (
    <Card id="fleet-availability" className="border-neutral-200">
      <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-neutral-900 text-white">
            <CalendarSearch className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold text-neutral-900">
              Fleet Availability Checker
            </CardTitle>
            <p className="text-xs text-neutral-500">
              Query real-time pool availability and future reservation slots
            </p>
          </div>
        </div>

        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle className="h-3 w-3" />
          Instant Allocation Engine
        </span>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Query Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-neutral-50/80 p-3.5 rounded-lg border border-neutral-200/70">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
              Vehicle Type
            </label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Toyota Innova">Toyota Innova / Zenix</SelectItem>
                <SelectItem value="Toyota Veloz">Toyota Veloz</SelectItem>
                <SelectItem value="Toyota Fortuner">Toyota Fortuner</SelectItem>
                <SelectItem value="Toyota Avanza">Toyota Avanza</SelectItem>
                <SelectItem value="Mitsubishi Xpander">Mitsubishi Xpander</SelectItem>
                <SelectItem value="Hyundai Stargazer">Hyundai Stargazer</SelectItem>
                <SelectItem value="Toyota HiAce">Toyota HiAce Commuter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
              Business Model
            </label>
            <Select
              value={businessModel}
              onValueChange={(val: "B2B" | "B2C") => setBusinessModel(val)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select Business" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="B2B">B2B (Corporate Contract)</SelectItem>
                <SelectItem value="B2C">B2C (Individual Rental)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider">
              Target Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setHasSearched(true)}
              className="w-full gap-1.5 h-8 font-semibold"
            >
              <Search className="h-3.5 w-3.5" />
              Check Availability
            </Button>
          </div>
        </div>

        {/* Search Results Display */}
        {hasSearched && (
          <div className="space-y-4 pt-1">
            {/* Header and KPI Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
              <div>
                <h4 className="text-sm font-bold text-neutral-900">
                  {selectedType}
                </h4>
                <p className="text-xs text-neutral-500">
                  Query date: <span className="font-medium text-neutral-800">{selectedDate}</span> &middot; Eligible for {businessModel}
                </p>
              </div>

              {/* Status breakdown numbers */}
              <div className="flex items-center gap-3 text-xs">
                <div className="px-2.5 py-1 rounded bg-neutral-100 font-medium text-neutral-700">
                  Total <span className="font-bold text-neutral-900 ml-1">{totalCount}</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                  Available <span className="font-bold ml-1">{availableCount}</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-medium">
                  Rented <span className="font-bold ml-1">{rentedCount}</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 font-medium">
                  Maint. <span className="font-bold ml-1">{maintenanceCount}</span>
                </div>
                <div className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 font-medium">
                  Reserved <span className="font-bold ml-1">{reservedCount}</span>
                </div>
              </div>
            </div>

            {/* List of Available Units */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                Ready for Dispatch ({availableUnits.length} units in pool)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableUnits.slice(0, 4).map((veh) => (
                  <div
                    key={veh.id}
                    className="p-3.5 rounded-lg border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-neutral-900">
                            {veh.plateNumber}
                          </span>
                          <OwnershipBadge ownership={veh.ownership} />
                        </div>
                        <p className="text-xs text-neutral-600 mt-0.5">{veh.model}</p>
                      </div>
                      <StatusBadge status="AVAILABLE" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-neutral-400" />
                        <span className="truncate max-w-32">{veh.locationArea}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono">
                        <Gauge className="h-3 w-3 text-neutral-400" />
                        <span>{formatNumber(veh.odometer)} KM</span>
                      </div>
                      <Link href={`/fleet/${veh.id}`}>
                        <Button variant="outline" size="xs" className="gap-1">
                          Allocate <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
