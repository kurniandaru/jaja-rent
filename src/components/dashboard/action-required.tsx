"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/ui/priority-badge";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ShieldAlert,
  FileWarning,
  Wrench,
  ClipboardList,
  Clock,
  Radio,
} from "lucide-react";
import { mockActionRequired } from "@/lib/data";

export function ActionRequired() {
  const router = useRouter();
  const [filter, setFilter] = React.useState<
    "ALL" | "CRITICAL" | "WARNING" | "INFO"
  >("ALL");

  const filteredItems = mockActionRequired.filter((item) => {
    if (filter === "ALL") return true;
    if (filter === "CRITICAL") return item.priority === "CRITICAL";
    if (filter === "WARNING") return item.priority === "WARNING";
    if (filter === "INFO") return item.priority === "INFORMATIONAL";
    return true;
  });

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case "SHORTAGE":
        return <ShieldAlert className="h-4 w-4 text-rose-600" />;
      case "DOCUMENT":
        return <FileWarning className="h-4 w-4 text-rose-600" />;
      case "MAINTENANCE":
        return <Wrench className="h-4 w-4 text-amber-600" />;
      case "INSPECTION":
        return <ClipboardList className="h-4 w-4 text-amber-600" />;
      case "RENTAL":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "GPS":
        return <Radio className="h-4 w-4 text-neutral-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-neutral-600" />;
    }
  };

  return (
    <Card id="action-required" className="border-neutral-200 shadow-xs">
      <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-100 text-rose-700">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base font-semibold text-neutral-900">
                Action Required
              </CardTitle>
              <span className="flex h-5 items-center justify-center rounded-full bg-rose-600 px-2 text-[10px] font-bold text-white">
                {mockActionRequired.length}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Operational items requiring immediate decision or dispatch
            </p>
          </div>
        </div>

        {/* Priority Filter Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === "ALL"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            All ({mockActionRequired.length})
          </button>
          <button
            onClick={() => setFilter("CRITICAL")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === "CRITICAL"
                ? "bg-rose-600 text-white"
                : "text-neutral-600 hover:bg-rose-50 hover:text-rose-700"
            }`}
          >
            Critical (2)
          </button>
          <button
            onClick={() => setFilter("WARNING")}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              filter === "WARNING"
                ? "bg-amber-500 text-white"
                : "text-neutral-600 hover:bg-amber-50 hover:text-amber-800"
            }`}
          >
            Warning (3)
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-neutral-100">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(item.actionUrl)}
            className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-neutral-50/80 cursor-pointer transition-colors group"
          >
            <div className="flex items-start gap-3 min-w-0 pr-4">
              <div className="mt-0.5 p-1.5 rounded-md bg-neutral-100/90 group-hover:bg-white group-hover:shadow-xs transition-all shrink-0">
                {getTargetIcon(item.targetType)}
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  {item.badgeLabel && (
                    <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded uppercase">
                      {item.badgeLabel}
                    </span>
                  )}
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-neutral-950 truncate">
                    {item.title}
                  </h4>
                </div>
                <p className="text-xs text-neutral-600 line-clamp-1 sm:line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden sm:inline-block text-[11px] font-medium text-neutral-500">
                {item.dueText}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-neutral-400 group-hover:text-neutral-900 group-hover:bg-neutral-200/60"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
