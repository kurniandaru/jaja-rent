"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const statusData = [
  { name: "Available", value: 35, color: "#10b981", percent: "29.2%" },
  { name: "Rented", value: 72, color: "#3b82f6", percent: "60.0%" },
  { name: "Reserved", value: 8, color: "#f59e0b", percent: "6.7%" },
  { name: "Maintenance", value: 5, color: "#ef4444", percent: "4.1%" },
  { name: "Inspection", value: 2, color: "#6366f1", percent: "1.7%" },
  { name: "Document Hold", value: 1, color: "#71717a", percent: "0.8%" },
];

export function FleetStatusChart() {
  const total = statusData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="border-neutral-200">
      <CardHeader className="pb-2 border-b border-neutral-100 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">
            Fleet Status Distribution
          </CardTitle>
          <p className="text-xs text-neutral-500">
            Live allocation across {total} registered units
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Donut Chart */}
        <div className="md:col-span-5 h-44 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-neutral-900 text-white text-xs px-2.5 py-1.5 rounded shadow-lg border border-neutral-800">
                        <p className="font-semibold">{data.name}</p>
                        <p className="text-neutral-300">
                          {data.value} Units ({data.percent})
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-neutral-900">{total}</span>
            <span className="text-[10px] text-neutral-400 font-medium uppercase">
              Units
            </span>
          </div>
        </div>

        {/* Dense Status Breakdown List */}
        <div className="md:col-span-7 space-y-2">
          {statusData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 min-w-28">
                <span
                  className="h-2.5 w-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-neutral-700 font-medium">
                  {item.name}
                </span>
              </div>

              {/* Progress bar line */}
              <div className="flex-1 mx-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.value / total) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-right">
                <span className="font-semibold text-neutral-900 w-7 text-right">
                  {item.value}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono w-10 text-right">
                  {item.percent}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
