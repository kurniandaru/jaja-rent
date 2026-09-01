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
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Calendar,
  CalendarCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Car,
  User,
  Building2,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { mockReservations, getReservations } from "@/lib/data";
import { formatShortDate } from "@/lib/utils";

export default function ReservationsPage() {
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  const filtered = mockReservations.filter(
    (r) =>
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicleType.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
            Reservations Queue
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Upcoming bookings & vehicle staging for B2C & B2B dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/#fleet-availability">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-medium text-xs"
            >
              <CalendarCheck className="h-3.5 w-3.5" />
              Check Availability Matrix
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-neutral-200 shadow-xs">
        <CardHeader className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Search reservation, customer, car..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs bg-neutral-50"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center text-xs font-semibold uppercase tracking-wider">
                  No
                </TableHead>
                <TableHead>Reservation ID</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Vehicle Requested</TableHead>
                <TableHead>Assigned Unit</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Pickup Window</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((res, idx) => (
                <TableRow
                  key={res.id}
                  onClick={() =>
                    res.assignedVehicleId &&
                    router.push(`/fleet/${res.assignedVehicleId}`)
                  }
                  className="cursor-pointer hover:bg-neutral-50"
                >
                  <TableCell className="text-center font-medium text-neutral-500 text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-neutral-900">
                    {res.id}
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-neutral-100 text-neutral-700">
                      {res.type}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-neutral-900">
                    {res.vehicleType}
                  </TableCell>
                  <TableCell>
                    {res.assignedVehicleId ? (
                      <span className="font-mono font-bold text-neutral-900 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                        {res.assignedVehicleId}
                      </span>
                    ) : (
                      <span className="text-amber-600 text-xs font-medium">
                        Pending Assignment
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-neutral-800">
                    {res.customerName}
                  </TableCell>
                  <TableCell className="font-mono text-neutral-600 text-xs">
                    {formatShortDate(res.startDate)} —{" "}
                    {formatShortDate(res.endDate)}
                  </TableCell>
                  <TableCell className="text-neutral-600 text-xs">
                    {res.pickupLocation}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={res.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
