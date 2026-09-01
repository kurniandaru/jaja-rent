"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Car,
  CheckCircle2,
  KeyRound,
  Wrench,
  Clock,
  Building,
  CarFront,
  ArrowUpRight,
} from "lucide-react";

export function FleetSummary() {
  const stats = [
    {
      title: "TOTAL FLEET",
      count: 120,
      unit: "Vehicles",
      icon: Car,
      color: "text-neutral-900",
      bgColor: "bg-neutral-100",
      href: "/fleet",
    },
    {
      title: "AVAILABLE",
      count: 35,
      unit: "Vehicles",
      icon: CheckCircle2,
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      href: "/fleet?status=AVAILABLE",
      dotColor: "bg-emerald-500",
    },
    {
      title: "RENTED",
      count: 72,
      unit: "Vehicles",
      icon: KeyRound,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      href: "/fleet?status=RENTED",
      dotColor: "bg-blue-500",
    },
    {
      title: "MAINTENANCE",
      count: 5,
      unit: "Vehicles",
      icon: Wrench,
      color: "text-rose-700",
      bgColor: "bg-rose-50",
      href: "/fleet?status=MAINTENANCE",
      dotColor: "bg-rose-500",
    },
    {
      title: "RESERVED",
      count: 8,
      unit: "Vehicles",
      icon: Clock,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      href: "/fleet?status=RESERVED",
      dotColor: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-3">
      {/* Top metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href} className="group">
              <Card className="hover:border-neutral-300 transition-all hover:shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                      {stat.dotColor && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${stat.dotColor}`}
                        />
                      )}
                      {stat.title}
                    </span>
                    <div className={`p-1.5 rounded-md ${stat.bgColor}`}>
                      <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold tracking-tight text-neutral-900">
                        {stat.count}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {stat.unit}
                      </span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-neutral-300 group-hover:text-neutral-700 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Ownership Breakdown pill banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-lg border border-neutral-200/80 text-xs">
        <div className="flex items-center gap-2 font-medium text-neutral-700">
          <span className="text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
            Ownership Breakdown:
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/fleet?ownership=JAJA_OWNED"
            className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
          >
            <span className="flex h-2 w-2 rounded-full bg-neutral-900" />
            <span className="text-neutral-600 font-medium">Jaja Owned:</span>
            <span className="font-bold text-neutral-900">80</span>
            <span className="text-[11px] text-neutral-400 font-mono">
              (66.7%)
            </span>
          </Link>

          <div className="h-3 w-px bg-neutral-200" />

          <Link
            href="/fleet?ownership=VENDOR_OWNED"
            className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
          >
            <span className="flex h-2 w-2 rounded-full bg-purple-600" />
            <span className="text-neutral-600 font-medium">Vendor Owned:</span>
            <span className="font-bold text-neutral-900">40</span>
            <span className="text-[11px] text-neutral-400 font-mono">
              (33.3%)
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
