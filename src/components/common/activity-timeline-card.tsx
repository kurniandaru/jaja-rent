"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuditLogEntry } from "@/lib/types/business-core";
import { getAuditLogsForEntity } from "@/lib/services/audit-service";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  ShieldCheck,
  KeyRound,
  Banknote,
  Car,
  Activity,
} from "lucide-react";

interface ActivityTimelineCardProps {
  entityType: AuditLogEntry["entityType"];
  entityId: string;
  title?: string;
  fallbackEvents?: {
    id: string;
    action: string;
    actorName: string;
    notes?: string;
    createdAt: string;
  }[];
}

export function ActivityTimelineCard({
  entityType,
  entityId,
  title = "Riwayat Aktivitas & Audit Trail",
  fallbackEvents = [],
}: ActivityTimelineCardProps) {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadLogs = React.useCallback(async () => {
    setLoading(true);
    const result = await getAuditLogsForEntity(entityType, entityId);
    setLogs(result);
    setLoading(false);
  }, [entityType, entityId]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const displayItems = logs.length > 0 ? logs : fallbackEvents;

  const getActionIcon = (action: string) => {
    if (
      action.includes("VERIFY") ||
      action.includes("APPROVE") ||
      action.includes("SIGNED")
    ) {
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
    }
    if (action.includes("REJECT") || action.includes("CANCEL")) {
      return <XCircle className="h-3.5 w-3.5 text-rose-600" />;
    }
    if (
      action.includes("PAYMENT") ||
      action.includes("SETTLE") ||
      action.includes("DEPOSIT")
    ) {
      return <Banknote className="h-3.5 w-3.5 text-amber-600" />;
    }
    if (action.includes("ALLOCAT") || action.includes("VEHICLE")) {
      return <Car className="h-3.5 w-3.5 text-blue-600" />;
    }
    if (
      action.includes("CONTRACT") ||
      action.includes("AGREEMENT") ||
      action.includes("DOCUMENT")
    ) {
      return <FileCheck2 className="h-3.5 w-3.5 text-purple-600" />;
    }
    return <Activity className="h-3.5 w-3.5 text-neutral-500" />;
  };

  return (
    <Card className="border-neutral-200 shadow-xs">
      <CardHeader className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-neutral-500" />
          <CardTitle className="text-sm font-bold text-neutral-900">
            {title}
          </CardTitle>
        </div>
        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
          {displayItems.length} Log Tercatat
        </span>
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            Memuat riwayat audit...
          </div>
        ) : displayItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            Belum ada log mutasi atau status perubahan yang terekam.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
            {displayItems.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                <div className="absolute -left-6 top-0.5 p-1 rounded-full bg-white border border-neutral-200 shadow-2xs">
                  {getActionIcon(item.action)}
                </div>
                <div className="p-2.5 rounded-lg border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors text-xs space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-bold text-neutral-900">
                      {item.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(item.createdAt).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-600">
                    <span className="font-semibold text-neutral-800">
                      Operator: {item.actorName}
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-neutral-500 pt-0.5 border-t border-neutral-100">
                      {item.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
