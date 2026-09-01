"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Car,
  Building2,
  Calendar,
  Download,
  Percent,
} from "lucide-react";
import { formatRupiah } from "@/lib/utils";

const utilizationData = [
  { month: "Apr", b2c: 68, b2b: 92, total: 84 },
  { month: "May", b2c: 74, b2b: 94, total: 87 },
  { month: "Jun", b2c: 82, b2b: 95, total: 91 },
  { month: "Jul", b2c: 79, b2b: 93, total: 89 },
  { month: "Aug", b2c: 85, b2b: 96, total: 93 },
  { month: "Sep", b2c: 88, b2b: 96, total: 94 },
];

const revenueData = [
  { month: "Apr", b2cRevenue: 145000000, b2bRevenue: 580000000 },
  { month: "May", b2cRevenue: 162000000, b2bRevenue: 610000000 },
  { month: "Jun", b2cRevenue: 198000000, b2bRevenue: 645000000 },
  { month: "Jul", b2cRevenue: 175000000, b2bRevenue: 680000000 },
  { month: "Aug", b2cRevenue: 210000000, b2bRevenue: 720000000 },
  { month: "Sep", b2cRevenue: 235000000, b2bRevenue: 765000000 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Fleet & Financial Analytics
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Operational utilization &middot; Revenue split &middot; Maintenance expense auditing
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 font-medium text-xs">
          <Download className="h-3.5 w-3.5" />
          Export Executive Report (PDF/XLSX)
        </Button>
      </div>

      {/* High-level Analytics KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-neutral-200 bg-white shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 block">Overall Utilization</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">94.2%</div>
          <span className="text-[10px] text-emerald-600 font-medium">+2.1% from last month</span>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 bg-white shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 block">B2B Fleet Utilization</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">96.0%</div>
          <span className="text-[10px] text-neutral-500">68 / 70 vehicles deployed</span>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 bg-white shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 block">B2C Fleet Utilization</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1 font-mono">88.5%</div>
          <span className="text-[10px] text-neutral-500">28 active + 12 reserved</span>
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 bg-white shadow-xs">
          <span className="text-[11px] uppercase font-semibold text-neutral-500 block">Monthly Run Rate</span>
          <div className="text-xl font-bold text-neutral-900 mt-1 font-mono">Rp 1,00 M</div>
          <span className="text-[10px] text-emerald-600 font-medium">B2B: 76.5% &middot; B2C: 23.5%</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Utilization Trend */}
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="pb-2 border-b border-neutral-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Fleet Utilization Rate (%)</CardTitle>
              <p className="text-xs text-neutral-500">6-Month historical operational index</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-purple-700 font-medium">
                <span className="h-2 w-2 rounded-full bg-purple-600" /> B2B
              </span>
              <span className="flex items-center gap-1 text-blue-700 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> B2C
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-neutral-900 text-white text-xs p-2 rounded shadow-lg border border-neutral-800">
                          <p className="font-bold mb-1">{payload[0].payload.month}</p>
                          <p className="text-purple-300">B2B: {payload[0].value}%</p>
                          <p className="text-blue-300">B2C: {payload[1].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="b2b" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="b2c" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="pb-2 border-b border-neutral-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Monthly Gross Revenue</CardTitle>
              <p className="text-xs text-neutral-500">B2B Long-term vs B2C Daily rentals (IDR)</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-neutral-900 text-white text-xs p-2 rounded shadow-lg border border-neutral-800">
                          <p className="font-bold mb-1">{data.month}</p>
                          <p className="text-purple-300">B2B: {formatRupiah(data.b2bRevenue)}</p>
                          <p className="text-blue-300">B2C: {formatRupiah(data.b2cRevenue)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="b2bRevenue" fill="#18181b" stackId="a" />
                <Bar dataKey="b2cRevenue" fill="#71717a" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

