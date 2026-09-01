"use client";

import * as React from "react";
import Link from "next/link";
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
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  ExternalLink,
  Car,
  Layers,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Wrench,
  Plus,
} from "lucide-react";
import { mockVendors, getVendors } from "@/lib/data";
import { VendorPartner } from "@/lib/types/vendor";

export default function VendorManagementPage() {
  const [vendors, setVendors] = React.useState<VendorPartner[]>(mockVendors);
  const [search, setSearch] = React.useState("");
  const [selectedVendor, setSelectedVendor] = React.useState<VendorPartner | null>(null);

  React.useEffect(() => {
    async function loadData() {
      const data = await getVendors();
      setVendors(data);
    }
    loadData();
  }, []);

  const filtered = vendors.filter((v) => {
    const s = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(s) ||
      v.companyName.toLowerCase().includes(s) ||
      v.contactPerson.toLowerCase().includes(s) ||
      v.phone.toLowerCase().includes(s) ||
      v.email.toLowerCase().includes(s)
    );
  });

  const totalVendors = vendors.length;
  const totalVehicles = vendors.reduce((acc, v) => acc + v.totalVehicles, 0);
  const totalActiveRented = vendors.reduce((acc, v) => acc + v.activeRentedVehicles, 0);
  const totalAvailable = vendors.reduce((acc, v) => acc + v.availableVehicles, 0);
  const totalMaintenance = vendors.reduce((acc, v) => acc + v.maintenanceVehicles, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Vendor Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Kelola mitra penyedia kendaraan (asset vendor partners), pantau armada yang disewakan ke Jaja, serta utilisasi unit aktif di klien B2B.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="text-xs sm:text-sm gap-2">
            <Layers className="h-4 w-4 text-neutral-500" />
            Export Data
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm gap-2">
            <Plus className="h-4 w-4" />
            Tambah Mitra Vendor
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Mitra Vendor
              </span>
              <Building2 className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{totalVendors}</span>
              <span className="text-xs text-emerald-600 font-medium">Aktif</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Total Armada Vendor
              </span>
              <Car className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-neutral-900">{totalVehicles}</span>
              <span className="text-xs text-neutral-500">unit disewakan ke Jaja</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Sedang Disewa (Aktif)
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600">{totalActiveRented}</span>
              <span className="text-xs text-neutral-500">
                unit ({totalVehicles > 0 ? Math.round((totalActiveRented / totalVehicles) * 100) : 0}%)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Tersedia di Pool
              </span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-600">{totalAvailable}</span>
              <span className="text-xs text-neutral-500">unit ready</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200/80 shadow-xs col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Maint / Doc Hold
              </span>
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">{totalMaintenance}</span>
              <span className="text-xs text-neutral-500">unit tertahan</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Vendor Table Card */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-900">
              Daftar Mitra Vendor & Alokasi Armada
            </CardTitle>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kendaraan milik vendor hanya diperbolehkan untuk disewa oleh klien B2B (Rent-to-Rent)
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Cari vendor, PIC, telepon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs sm:text-sm bg-neutral-50/50"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50/80 text-neutral-600">
              <TableRow className="border-b border-neutral-200/80 hover:bg-transparent">
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider min-w-[220px]">
                  Mitra Vendor
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider min-w-[200px]">
                  Kontak PIC
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Total Unit
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Sedang Disewa
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Di Pool
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Maint/Hold
                </TableHead>
                <TableHead className="text-center text-xs font-semibold uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold uppercase tracking-wider pr-6">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-neutral-500 text-sm">
                    Tidak ada mitra vendor yang sesuai dengan pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((vendor, index) => (
                  <TableRow
                    key={vendor.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors"
                  >
                    {/* No column */}
                    <TableCell className="text-center font-medium text-neutral-500 text-xs">
                      {index + 1}
                    </TableCell>

                    {/* Vendor Name & Company */}
                    <TableCell>
                      <div>
                        <div className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
                          {vendor.companyName}
                          <span className="text-[10px] bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded font-normal">
                            {vendor.name}
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-neutral-400" />
                            {vendor.address}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Contact Person */}
                    <TableCell>
                      <div className="text-xs space-y-0.5">
                        <div className="font-medium text-neutral-800">{vendor.contactPerson}</div>
                        <div className="text-neutral-500 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-neutral-400" />
                          {vendor.phone}
                        </div>
                        <div className="text-neutral-500 flex items-center gap-1">
                          <Mail className="h-3 w-3 text-neutral-400" />
                          {vendor.email}
                        </div>
                      </div>
                    </TableCell>

                    {/* Total Units */}
                    <TableCell className="text-center font-bold text-neutral-900 text-sm">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-neutral-100 text-neutral-800 rounded-md font-semibold text-xs">
                        {vendor.totalVehicles} unit
                      </span>
                    </TableCell>

                    {/* Active Rented */}
                    <TableCell className="text-center font-semibold text-emerald-600 text-sm">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md font-semibold text-xs">
                        {vendor.activeRentedVehicles} unit
                      </span>
                    </TableCell>

                    {/* Available */}
                    <TableCell className="text-center font-semibold text-blue-600 text-sm">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-md font-semibold text-xs">
                        {vendor.availableVehicles} unit
                      </span>
                    </TableCell>

                    {/* Maintenance */}
                    <TableCell className="text-center font-semibold text-amber-600 text-sm">
                      {vendor.maintenanceVehicles > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md font-semibold text-xs">
                          {vendor.maintenanceVehicles} unit
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-400">-</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {vendor.status}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVendor(vendor)}
                        className="h-8 text-xs font-medium gap-1.5 hover:bg-neutral-100 hover:text-neutral-900 border-neutral-200"
                      >
                        <Car className="h-3.5 w-3.5 text-neutral-500" />
                        Lihat Unit Armada
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Vendor Vehicle Breakdown Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="max-w-4xl p-6">
          <DialogHeader className="pb-3 border-b border-neutral-200/80">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {selectedVendor?.companyName}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 mt-1">
                  Daftar kendaraan yang disewakan oleh {selectedVendor?.name} kepada Jaja-Rent Fleet Operations
                </DialogDescription>
              </div>
              <span className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md font-semibold">
                Total {selectedVendor?.vehicles?.length || 0} Unit
              </span>
            </div>
          </DialogHeader>

          {/* Dialog Body */}
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200/60 text-xs">
              <div>
                <span className="text-neutral-500 block">Contact Person:</span>
                <span className="font-semibold text-neutral-800">{selectedVendor?.contactPerson}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">No. Telepon / Email:</span>
                <span className="font-semibold text-neutral-800">{selectedVendor?.phone} / {selectedVendor?.email}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">NPWP / Tax ID:</span>
                <span className="font-semibold text-neutral-800">{selectedVendor?.taxId || "Tercatat"}</span>
              </div>
            </div>

            <div className="border border-neutral-200 rounded-lg overflow-hidden max-h-[380px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-neutral-100/80 sticky top-0">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs">No</TableHead>
                    <TableHead className="text-xs">Plat Nomor & Kendaraan</TableHead>
                    <TableHead className="text-xs">Tahun & Warna</TableHead>
                    <TableHead className="text-center text-xs">Status</TableHead>
                    <TableHead className="text-xs">Sedang Disewa Oleh (Klien B2B)</TableHead>
                    <TableHead className="text-xs">Lokasi / Pool</TableHead>
                    <TableHead className="text-right text-xs pr-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedVendor?.vehicles && selectedVendor.vehicles.length > 0 ? (
                    selectedVendor.vehicles.map((veh, vIdx) => (
                      <TableRow key={veh.id} className="hover:bg-neutral-50/70 text-xs">
                        <TableCell className="text-center font-medium text-neutral-500">
                          {vIdx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-neutral-900">{veh.plateNumber}</div>
                          <div className="text-neutral-500 text-[11px]">{veh.brand} {veh.model}</div>
                        </TableCell>
                        <TableCell>
                          <div>{veh.year}</div>
                          <div className="text-neutral-500 text-[11px]">{veh.color}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={veh.status as any} />
                        </TableCell>
                        <TableCell>
                          {veh.currentCustomerName ? (
                            <div>
                              <div className="font-medium text-neutral-900">{veh.currentCustomerName}</div>
                              <div className="text-neutral-500 text-[11px]">{veh.currentContractNumber || "Kontrak Aktif"}</div>
                            </div>
                          ) : (
                            <span className="text-neutral-400 italic">Tersedia di Pool (Standby)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-neutral-600">
                          {veh.locationArea}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <Link
                            href={`/fleet/${veh.plateNumber.replace(/\s+/g, "-")}`}
                            className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs"
                          >
                            Detail
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-neutral-500">
                        Belum ada kendaraan yang tercatat untuk vendor ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
