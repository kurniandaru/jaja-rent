import type { AuditLogEntry } from "../types/business-core.ts";
import { getSupabaseBrowserClient } from "../supabase/client.ts";

// Global in-memory audit logs storage
const inMemoryAuditLogs: AuditLogEntry[] = [];

// Helper to format sequence
let auditLogSeq = 1;
function generateAuditId(): string {
  const pad = String(auditLogSeq++).padStart(6, "0");
  return `AUD-${pad}`;
}

export async function recordAuditLog(
  entry: Omit<AuditLogEntry, "id" | "createdAt">,
): Promise<AuditLogEntry> {
  const timestamp = new Date().toISOString();
  const id = generateAuditId();

  const completeEntry: AuditLogEntry = {
    ...entry,
    id,
    createdAt: timestamp,
  };

  // 1. Store in memory for instant reactivity & test runner
  inMemoryAuditLogs.unshift(completeEntry);

  // 2. Persist to Supabase if configured
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      await (supabase as any).from("audit_logs").insert({
        actor_id: entry.actorId || null,
        actor_name: entry.actorName,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        action: entry.action,
        old_data: entry.oldData || null,
        new_data: entry.newData || null,
        notes: entry.notes || null,
      });
    } catch (err) {
      console.warn(
        "Could not insert audit log to Supabase, fallback to memory",
        err,
      );
    }
  }

  return completeEntry;
}

export async function getAuditLogsForEntity(
  entityType: AuditLogEntry["entityType"],
  entityId: string,
): Promise<AuditLogEntry[]> {
  // Check memory
  const memoryLogs = inMemoryAuditLogs.filter(
    (l) =>
      l.entityType === entityType &&
      l.entityId.toLowerCase() === entityId.toLowerCase(),
  );

  // If Supabase is available, attempt query
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { data, error } = await (supabase as any)
        .from("audit_logs")
        .select("*")
        .eq("entity_type", entityType)
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          actorId: d.actor_id,
          actorName: d.actor_name || "System Operator",
          entityType: d.entity_type,
          entityId: d.entity_id,
          action: d.action,
          oldData: d.old_data,
          newData: d.new_data,
          notes: d.notes,
          createdAt: d.created_at,
        }));
      }
    } catch (e) {
      console.warn("Error reading audit logs from Supabase", e);
    }
  }

  return memoryLogs;
}

export function getAllRecentAuditLogs(limit = 50): AuditLogEntry[] {
  return inMemoryAuditLogs.slice(0, limit);
}

export interface AuditQueryFilters {
  search?: string;
  actorName?: string;
  entityType?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export async function queryAuditLogs(
  filters: AuditQueryFilters = {},
): Promise<AuditLogEntry[]> {
  let logs = [...inMemoryAuditLogs];

  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        (l.notes && l.notes.toLowerCase().includes(q)) ||
        (l.newData && JSON.stringify(l.newData).toLowerCase().includes(q)) ||
        (l.oldData && JSON.stringify(l.oldData).toLowerCase().includes(q)),
    );
  }

  if (filters.actorName && filters.actorName !== "ALL") {
    logs = logs.filter(
      (l) => l.actorName.toLowerCase() === filters.actorName!.toLowerCase(),
    );
  }

  if (filters.entityType && filters.entityType !== "ALL") {
    logs = logs.filter((l) => l.entityType === filters.entityType);
  }

  if (filters.action && filters.action !== "ALL") {
    logs = logs.filter((l) =>
      l.action.toUpperCase().includes(filters.action!.toUpperCase()),
    );
  }

  if (filters.dateFrom) {
    logs = logs.filter((l) => l.createdAt >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    logs = logs.filter((l) => l.createdAt <= filters.dateTo!);
  }

  const limit = filters.limit || 100;
  return logs.slice(0, limit);
}

// Initial realistic enterprise seed audit logs
inMemoryAuditLogs.push(
  {
    id: "AUD-000101",
    actorName: "Operations Lead Dimas",
    entityType: "RESERVATION",
    entityId: "RES-2026-001",
    action: "RESERVATION_APPROVED",
    oldData: { status: "PENDING_APPROVAL" },
    newData: { status: "APPROVED", approvedBy: "Operations Lead Dimas" },
    notes:
      "Persetujuan reservasi B2C sewa 3 hari untuk customer terverifikasi Hendrawan Putra.",
    createdAt: "2026-09-02T09:15:00Z",
  },
  {
    id: "AUD-000102",
    actorName: "Fleet Ops Hendra",
    entityType: "ALLOCATION",
    entityId: "ALC-2026-001",
    action: "VEHICLE_ALLOCATED",
    oldData: { vehicleStatus: "AVAILABLE" },
    newData: {
      vehicleId: "VEH-001",
      vehiclePlate: "B 1234 XYZ",
      status: "ALLOCATED",
    },
    notes:
      "Alokasi Toyota Innova Zenix untuk reservasi RES-2026-001 tanpa benturan jadwal.",
    createdAt: "2026-09-02T09:30:00Z",
  },
  {
    id: "AUD-000103",
    actorName: "QC Lead Rudi",
    entityType: "INSPECTION",
    entityId: "INSP-2026-001",
    action: "INSPECTION_PASSED",
    oldData: { result: "PENDING" },
    newData: { result: "PASSED", odometer: 14500, fuelLevel: 100 },
    notes:
      "Pemeriksaan fisik 10 area komponen pre-rental selesai dengan hasil PASSED.",
    createdAt: "2026-09-02T10:00:00Z",
  },
  {
    id: "AUD-000104",
    actorName: "Field Ops Hendra",
    entityType: "RENTAL",
    entityId: "RNT-B2C-2026-001",
    action: "RENTAL_ACTIVATED",
    oldData: { status: "RESERVED" },
    newData: { status: "ACTIVE", handedAt: "2026-09-02T10:30:00Z" },
    notes:
      "Serah terima unit fisik ke customer Hendrawan Putra di Pool SCBD Lot 8.",
    createdAt: "2026-09-02T10:30:00Z",
  },
  {
    id: "AUD-000105",
    actorName: "Finance Officer Maya",
    entityType: "PAYMENT",
    entityId: "PAY-2026-001",
    action: "PAYMENT_RECORDED",
    oldData: { paidAmount: 0 },
    newData: {
      paidAmount: 4750000,
      method: "BANK_TRANSFER",
      status: "VERIFIED",
    },
    notes:
      "Penerimaan pembayaran sewa penuh dan deposit via BCA Virtual Account.",
    createdAt: "2026-09-02T14:30:00Z",
  },
  {
    id: "AUD-000106",
    actorName: "Return Inspector Dimas",
    entityType: "DAMAGE",
    entityId: "DMG-2026-001",
    action: "DAMAGE_RECORDED",
    oldData: null,
    newData: {
      area: "BODY",
      severity: "MINOR",
      estimatedCost: 250000,
      description: "Baret bemper belakang kiri",
    },
    notes: "Deteksi kerusakan baru saat pengembalian unit sewa B-1234-XYZ.",
    createdAt: "2026-09-03T07:15:00Z",
  },
);
