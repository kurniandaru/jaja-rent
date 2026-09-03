"use client";

import * as React from "react";
import Link from "next/link";
import {
  Car,
  KeyRound,
  Users,
  DollarSign,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileCheck2,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ManagementCockpitProps {
  metrics?: {
    fleet: {
      total: number;
      available: number;
      rented: number;
      maintenance: number;
      inspection: number;
      reserved: number;
    };
    rental: {
      active: number;
      todayPickup: number;
      todayReturn: number;
      overdue: number;
    };
    customer: {
      total: number;
      pendingVerification: number;
      verified: number;
      suspended: number;
    };
    finance: {
      todayRevenue: number;
      pendingPayment: number;
      depositHeld: number;
      outstanding: number;
    };
  };
}

export function ManagementCockpit({ metrics }: ManagementCockpitProps) {
  // Default realistic values if not provided
  const data = metrics || {
    fleet: {
      total: 42,
      available: 18,
      rented: 16,
      maintenance: 4,
      inspection: 2,
      reserved: 2,
    },
    rental: {
      active: 16,
      todayPickup: 3,
      todayReturn: 2,
      overdue: 1,
    },
    customer: {
      total: 68,
      pendingVerification: 4,
      verified: 62,
      suspended: 2,
    },
    finance: {
      todayRevenue: 14750000,
      pendingPayment: 3800000,
      depositHeld: 24000000,
      outstanding: 1250000,
    },
  };

  // Calculated Fleet Health Index (Section 23)
  const healthScore = React.useMemo(() => {
    let score = 100;
    // Deduct for overdue rentals
    score -= data.rental.overdue * 15;
    // Deduct for units in maintenance
    score -= data.fleet.maintenance * 5;
    // Deduct for inspection backlog
    score -= data.fleet.inspection * 3;

    if (score >= 80)
      return { status: "HEALTHY", label: "Fleet Sehat", color: "emerald" };
    if (score >= 60)
      return {
        status: "NEEDS_ATTENTION",
        label: "Perlu Perhatian",
        color: "amber",
      };
    return { status: "CRITICAL", label: "Status Kritis", color: "rose" };
  }, [data]);

  // Operational Work Queue Items (Section 24: "Needs Attention")
  const workQueueItems = [
    {
      id: "WQ-1",
      title: "12 Reservasi Menunggu Persetujuan",
      description:
        "Reservasi baru membutuhkan verifikasi ketersediaan armada & approval.",
      count: 12,
      severity: "CRITICAL",
      href: "/operations/reservations",
      actionLabel: "Tinjau Reservasi",
      icon: Clock,
    },
    {
      id: "WQ-2",
      title: `${data.customer.pendingVerification} Customer Menunggu Verifikasi KYC`,
      description:
        "Dokumen KTP & SIM telah diunggah dan siap diverifikasi oleh tim operasional.",
      count: data.customer.pendingVerification,
      severity: "WARNING",
      href: "/corporate/customers",
      actionLabel: "Verifikasi KYC",
      icon: Users,
    },
    {
      id: "WQ-3",
      title: `${data.fleet.inspection} Unit Menunggu Inspeksi Fisik`,
      description:
        "Unit selesai sewa membutuhkan inspeksi sebelum dapat dialokasikan kembali.",
      count: data.fleet.inspection,
      severity: "WARNING",
      href: "/operations/inspections",
      actionLabel: "Mulai Inspeksi",
      icon: ShieldCheck,
    },
    {
      id: "WQ-4",
      title: `${data.fleet.maintenance} Unit Menunggu / Sedang Servis Bengkel`,
      description:
        "Unit berada di bengkel rekanan untuk perbaikan bodi dan servis berkala.",
      count: data.fleet.maintenance,
      severity: "WARNING",
      href: "/operations/maintenance",
      actionLabel: "Lihat Bengkel",
      icon: Wrench,
    },
    {
      id: "WQ-5",
      title: "2 Dokumen Kendaraan Segera Kedaluwarsa",
      description:
        "STNK dan uji KIR armada memasuki ambang batas peringatan <= 30 hari.",
      count: 2,
      severity: "CRITICAL",
      href: "/operations/documents",
      actionLabel: "Perpanjang STNK",
      icon: FileCheck2,
    },
    {
      id: "WQ-6",
      title: `${data.rental.overdue} Rental Melewati Jadwal Pengembalian (Overdue)`,
      description:
        "Penyewa belum mengembalikan kendaraan melebihi toleransi waktu sewa.",
      count: data.rental.overdue,
      severity: "CRITICAL",
      href: "/operations/rentals",
      actionLabel: "Tindak Lanjuti",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Executive Health & Top Level Cockpit */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">
              Enterprise Health Cockpit
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                healthScore.color === "emerald"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : healthScore.color === "amber"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              }`}
            >
              <Activity className="h-3 w-3" />
              {healthScore.label}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mt-1 tracking-tight">
            Ringkasan Operasional & Kontrol Enterprise
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitoring waktu-nyata status armada, siklus rental aktif, kelayakan
            customer, dan rekonsiliasi finansial.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/reports">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-neutral-700 text-white hover:bg-neutral-800 text-xs"
            >
              Laporan Utilisasi
            </Button>
          </Link>
          <Link href="/admin/audit-logs">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-neutral-700 text-white hover:bg-neutral-800 text-xs"
            >
              Audit Trail
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Four Operational Metric Categories (Section 22) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Category A: Fleet Metrics */}
        <Card className="shadow-2xs border-neutral-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Fleet Operations
            </CardTitle>
            <Car className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">
              {data.fleet.total} Unit
            </div>
            <div className="mt-2 text-[11px] grid grid-cols-2 gap-1 text-neutral-500">
              <div>
                Tersedia:{" "}
                <strong className="text-emerald-700 font-semibold">
                  {data.fleet.available}
                </strong>
              </div>
              <div>
                Disewa:{" "}
                <strong className="text-blue-700 font-semibold">
                  {data.fleet.rented}
                </strong>
              </div>
              <div>
                Servis:{" "}
                <strong className="text-amber-700 font-semibold">
                  {data.fleet.maintenance}
                </strong>
              </div>
              <div>
                Inspeksi:{" "}
                <strong className="text-indigo-700 font-semibold">
                  {data.fleet.inspection}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category B: Rental Lifecycle Metrics */}
        <Card className="shadow-2xs border-neutral-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Rental Pipeline
            </CardTitle>
            <KeyRound className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">
              {data.rental.active} Aktif
            </div>
            <div className="mt-2 text-[11px] grid grid-cols-2 gap-1 text-neutral-500">
              <div>
                Pickup Hari Ini:{" "}
                <strong className="text-neutral-900 font-semibold">
                  {data.rental.todayPickup}
                </strong>
              </div>
              <div>
                Return Hari Ini:{" "}
                <strong className="text-neutral-900 font-semibold">
                  {data.rental.todayReturn}
                </strong>
              </div>
              <div className="col-span-2 text-rose-700">
                Overdue:{" "}
                <strong className="font-bold">
                  {data.rental.overdue} Unit
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category C: Customer Compliance Metrics */}
        <Card className="shadow-2xs border-neutral-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Customer & KYC
            </CardTitle>
            <Users className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">
              {data.customer.total} Pelanggan
            </div>
            <div className="mt-2 text-[11px] grid grid-cols-2 gap-1 text-neutral-500">
              <div>
                Verified:{" "}
                <strong className="text-emerald-700 font-semibold">
                  {data.customer.verified}
                </strong>
              </div>
              <div>
                Pending:{" "}
                <strong className="text-amber-700 font-semibold">
                  {data.customer.pendingVerification}
                </strong>
              </div>
              <div className="col-span-2">
                Suspended:{" "}
                <strong className="text-rose-700 font-semibold">
                  {data.customer.suspended}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category D: Financial Foundation Metrics */}
        <Card className="shadow-2xs border-neutral-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Financial Control
            </CardTitle>
            <DollarSign className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neutral-900">
              Rp {data.finance.todayRevenue.toLocaleString("id-ID")}
            </div>
            <div className="mt-2 text-[11px] grid grid-cols-1 gap-0.5 text-neutral-500">
              <div>
                Pending Payment:{" "}
                <strong className="text-amber-800 font-semibold">
                  Rp {data.finance.pendingPayment.toLocaleString("id-ID")}
                </strong>
              </div>
              <div>
                Deposit Held:{" "}
                <strong className="text-neutral-900 font-semibold">
                  Rp {data.finance.depositHeld.toLocaleString("id-ID")}
                </strong>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Operational Work Queue: Needs Attention (Section 24) */}
      <Card className="shadow-2xs border-neutral-200">
        <CardHeader className="pb-3 border-b border-neutral-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <CardTitle className="text-sm font-bold text-neutral-900">
                Operational Work Queue &middot; Perlu Tindakan Operator (Needs
                Attention)
              </CardTitle>
            </div>
            <span className="text-[11px] font-semibold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full">
              {workQueueItems.length} Agenda Aksi
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Daftar tugas terintegrasi yang harus diselesaikan untuk menjaga
            kelancaran armada dan kepatuhan kontrak.
          </p>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-neutral-100">
          {workQueueItems.map((item) => {
            const Icon = item.icon;
            const isCritical = item.severity === "CRITICAL";
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-neutral-50/80 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isCritical
                        ? "bg-rose-50 text-rose-700 border border-rose-200/80"
                        : "bg-amber-50 text-amber-700 border border-amber-200/80"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-neutral-900">
                        {item.title}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                          isCritical
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={item.href}
                  className="shrink-0 self-end sm:self-center"
                >
                  <Button
                    variant="outline"
                    size="xs"
                    className="gap-1 font-semibold text-xs text-neutral-800 hover:text-neutral-900"
                  >
                    {item.actionLabel}
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
