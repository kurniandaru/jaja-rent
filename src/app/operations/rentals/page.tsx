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
import { RentalRecord, RentalType, RentalStatus } from "@/lib/types/rental";
import { getRentals } from "@/lib/data/rentals";
import {
  Car,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  User,
  Building2,
  FileCheck2,
} from "lucide-react";

export default function RentalsListPage() {
  const router = useRouter();
  const [rentals, setRentals] = React.useState<RentalRecord[]>([]);
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<"ALL" | RentalType>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | RentalStatus>("ALL");

  React.useEffect(() => {
    async function load() {
      const data = await getRentals();
      setRentals(data);
    }
    load();
  }, []);

  const filtered = rentals.filter((r) => {
    const s = search.toLowerCase();
    const matchesSearch =
      r.id.toLowerCase().includes(s) ||
      r.customerName.toLowerCase().includes(s) ||
      r.vehiclePlate.toLowerCase().includes(s) ||
      r.vehicleModel.toLowerCase().includes(s);

    const matchesType = typeFilter === "ALL" || r.type === typeFilter;
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const activeCount = rentals.filter((r) => r.status === "ACTIVE").length;
  const handoverPendingCount = rentals.filter(
    (r) => r.status === "HANDOVER" || r.status === "READY_FOR_DELIVERY" || r.status === "DELIVERY"
  ).length;
  const b2cCount = rentals.filter((r) => r.type === "B2C").length;
  const b2bCount = rentals.filter((r) => r.type === "B2B").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Active Fleet Rentals (B2C & B2B)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Manajemen transaksi operasional rental aktual, proses delivery, serah terima BAST, dan pengembalian unit.
          </p>
        </div>

        <Link href="/operations/reservations/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm gap-2 font-bold shadow-xs">
            <Plus className="h-4 w-4" />
            + Buat Rental / Reservasi
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Rental Aktif (Berjalan)
              </span>
              <Car className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">
                {activeCount}
              </span>
              <span className="text-xs text-neutral-500">unit di jalan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Menunggu Serah Terima
              </span>
              <FileCheck2 className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">
                {handoverPendingCount}
              </span>
              <span className="text-xs text-neutral-500">belum BAST</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                B2C Individual
              </span>
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">
                {b2cCount}
              </span>
              <span className="text-xs text-neutral-500">transaksi</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                B2B Corporate
              </span>
              <Building2 className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-purple-600">
                {b2bCount}
              </span>
              <span className="text-xs text-neutral-500">transaksi</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Rental Table */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-900">
              Daftar Seluruh Transaksi Rental Kendaraan
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Unit baru akan berstatus Active setelah dokumen Serah Terima Kendaraan (BAST) di-upload.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <Input
                placeholder="Cari nomor rental, plat, customer..."
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
              <option value="B2B">B2B (Corporate)</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8.5 rounded-md border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-800"
            >
              <option value="ALL">Status: Semua</option>
              <option value="ACTIVE">Active (Operasional)</option>
              <option value="HANDOVER">Handover BAST</option>
              <option value="READY_FOR_DELIVERY">Ready for Delivery</option>
              <option value="DELIVERY">Delivery</option>
              <option value="COMPLETED">Completed</option>
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
                  Rental Number
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Vehicle & Plate
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider">
                  Rental Period
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Rental Status
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Handover BAST
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider pr-6">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-neutral-500 text-sm">
                    Tidak ada transaksi rental yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item, idx) => {
                  const isB2C = item.type === "B2C";
                  const isHandedOver = item.handover?.isHandedOver;

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() => router.push(`/operations/rentals/${item.id}`)}
                      className="border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors cursor-pointer"
                    >
                      {/* 1. No */}
                      <TableCell className="text-center font-medium text-neutral-500 text-xs">
                        {idx + 1}
                      </TableCell>

                      {/* 2. Rental Number */}
                      <TableCell className="font-mono font-semibold text-blue-600 hover:underline text-xs">
                        {item.id}
                      </TableCell>

                      {/* 3. Customer */}
                      <TableCell>
                        <div className="font-semibold text-neutral-900 text-xs">
                          {item.customerName}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono">
                          {item.customerPhone || "Corporate Client"}
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

                      {/* 5. Vehicle & Plate */}
                      <TableCell>
                        <div className="font-mono font-bold text-xs text-neutral-900">
                          {item.vehiclePlate}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                          {item.vehicleModel}
                        </div>
                      </TableCell>

                      {/* 6. Rental Period */}
                      <TableCell className="text-xs font-mono text-neutral-700">
                        {item.startDate} &rarr; {item.endDate}
                      </TableCell>

                      {/* 7. Status */}
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "ACTIVE"
                              ? "bg-emerald-600 text-white"
                              : item.status === "HANDOVER"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : item.status === "READY_FOR_DELIVERY"
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : item.status === "DELIVERY"
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                          }`}
                        >
                          {item.status}
                        </span>
                      </TableCell>

                      {/* 8. Handover BAST */}
                      <TableCell className="text-center">
                        {isHandedOver ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="h-3 w-3" />
                            Belum BAST
                          </span>
                        )}
                      </TableCell>

                      {/* 9. Action */}
                      <TableCell className="text-right pr-6">
                        <Link
                          href={`/operations/rentals/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Kelola
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
