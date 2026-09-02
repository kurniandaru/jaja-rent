"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ReservationRecord, RentalType, ReservationStatus } from "@/lib/types/rental";
import { getReservations } from "@/lib/data/reservations";
import {
  Calendar,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  User,
  Building2,
  Car,
  FileCheck2,
} from "lucide-react";

export default function ReservationsListPage() {
  const router = useRouter();
  const [reservations, setReservations] = React.useState<ReservationRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"ALL" | RentalType>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | ReservationStatus>("ALL");

  React.useEffect(() => {
    async function loadData() {
      const data = await getReservations();
      setReservations(data);
    }
    loadData();
  }, []);

  const filtered = reservations.filter((r) => {
    const s = search.toLowerCase();
    const matchesSearch =
      r.id.toLowerCase().includes(s) ||
      r.customerName.toLowerCase().includes(s) ||
      r.customerPhone.toLowerCase().includes(s) ||
      (r.b2cRequirement?.vehicleModel && r.b2cRequirement.vehicleModel.toLowerCase().includes(s)) ||
      (r.b2bRequirement?.vehicleType && r.b2bRequirement.vehicleType.toLowerCase().includes(s));

    const matchesType = typeFilter === "ALL" || r.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const b2cCount = reservations.filter((r) => r.type === "B2C").length;
  const b2bCount = reservations.filter((r) => r.type === "B2B").length;
  const convertedCount = reservations.filter((r) => r.status === "CONVERTED").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Reservations & Requirements
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Kelola seluruh pencatatan kebutuhan booking B2C dan pengadaan armada B2B sebelum transaksi rental aktif.
          </p>
        </div>

        <Link href="/operations/reservations/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm gap-2 font-bold shadow-xs">
            <Plus className="h-4 w-4" />
            + Buat Reservation
          </Button>
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Total Reservasi
              </span>
              <Calendar className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">
                {reservations.length}
              </span>
              <span className="text-xs text-neutral-500">permintaan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                B2C Booking
              </span>
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {b2cCount}
              </span>
              <span className="text-xs text-neutral-500">perorangan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                B2B Sourcing
              </span>
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-600">
                {b2bCount}
              </span>
              <span className="text-xs text-neutral-500">korporasi</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Converted to Rental
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {convertedCount}
              </span>
              <span className="text-xs text-neutral-500">telah terbit</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-900">
              Daftar Permintaan & Reservasi Kendaraan
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Klik baris tabel untuk meninjau detail penawaran vendor sourcing atau menerbitkan rental operasional.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Cari no. reservasi, customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8.5 h-8.5 text-xs bg-neutral-50/70"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-800"
            >
              <option value="ALL">Tipe: Semua</option>
              <option value="B2C">B2C (Perorangan)</option>
              <option value="B2B">B2B (Korporat)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-800"
            >
              <option value="ALL">Status: Semua</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing (Sourcing)</option>
              <option value="PENDING">Pending</option>
              <option value="CONVERTED">Converted</option>
              <option value="DRAFT">Draft</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50/80 text-neutral-600">
              <TableRow className="border-b border-neutral-200/80 hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Reservation Number
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Vehicle / Requirement
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Start Date
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Duration
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Created Date
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-neutral-500 text-sm">
                    Tidak ada reservasi yang sesuai dengan filter.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, idx) => {
                  const isB2C = item.type === "B2C";
                  const reqText = isB2C
                    ? item.b2cRequirement?.vehicleModel || "Avanza"
                    : `${item.b2bRequirement?.quantity} Unit ${item.b2bRequirement?.vehicleType}`;

                  const startDate = isB2C
                    ? item.b2cRequirement?.startDate
                    : item.b2bRequirement?.startDate;

                  const duration = isB2C
                    ? `${item.b2cRequirement?.durationDays} Hari`
                    : `${item.b2bRequirement?.durationMonths} Bulan`;

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => router.push(`/operations/reservations/${item.id}`)}
                      className="border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    >
                      {/* 1. No */}
                      <TableCell className="text-center font-medium text-neutral-500 text-xs">
                        {idx + 1}
                      </TableCell>

                      {/* 2. Reservation Number */}
                      <TableCell className="font-mono font-semibold text-blue-600 hover:underline text-xs">
                        {item.id}
                      </TableCell>

                      {/* 3. Customer */}
                      <TableCell>
                        <div className="font-semibold text-neutral-900 text-xs">
                          {item.customerName}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {item.customerPhone}
                        </div>
                      </TableCell>

                      {/* 4. Type */}
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isB2C
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {item.type}
                        </span>
                      </TableCell>

                      {/* 5. Vehicle / Requirement */}
                      <TableCell className="font-medium text-neutral-800 text-xs">
                        {reqText}
                      </TableCell>

                      {/* 6. Start Date */}
                      <TableCell className="text-neutral-600 text-xs font-mono">
                        {startDate || "-"}
                      </TableCell>

                      {/* 7. Duration */}
                      <TableCell className="text-neutral-800 text-xs font-semibold">
                        {duration}
                      </TableCell>

                      {/* 8. Status */}
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "CONFIRMED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "PROCESSING"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : item.status === "CONVERTED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>

                      {/* 9. Created Date */}
                      <TableCell className="text-neutral-500 text-xs font-mono">
                        {item.createdAt}
                      </TableCell>

                      {/* 10. Action */}
                      <TableCell className="text-right pr-6">
                        <Link
                          href={`/operations/reservations/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Lihat Detail
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
