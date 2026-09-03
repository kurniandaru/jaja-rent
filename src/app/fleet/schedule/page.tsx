"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  List,
  ChevronLeft,
  ChevronRight,
  Search,
  Car,
  FileText,
  KeyRound,
  Wrench,
  ShieldCheck,
  FileCheck2,
  Clock,
  MapPin,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { ScheduleEvent, ScheduleEventType } from "@/lib/types/schedule";
import { getScheduleEvents } from "@/lib/data/schedules";

export default function FleetSchedulePage() {
  const [viewMode, setViewMode] = React.useState<"list" | "calendar">("list");
  const [selectedTypeFilter, setSelectedTypeFilter] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [events, setEvents] = React.useState<ScheduleEvent[]>([]);

  // Calendar Date State (Default: September 2026)
  const [currentYear, setCurrentYear] = React.useState(2026);
  const [currentMonth, setCurrentMonth] = React.useState(8); // 0-indexed: 8 = September

  // Date Modal Popup State
  const [selectedDateEvents, setSelectedDateEvents] = React.useState<{
    dateStr: string;
    events: ScheduleEvent[];
  } | null>(null);
  const [isDateModalOpen, setIsDateModalOpen] = React.useState(false);

  const loadEvents = React.useCallback(async () => {
    const all = await getScheduleEvents();
    setEvents(all);
  }, []);

  React.useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Event category helper badges
  const getEventBadge = (type: ScheduleEventType) => {
    switch (type) {
      case "CONTRACT_EXPIRY":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <FileText className="h-3 w-3" />
            Kontrak Habis
          </span>
        );
      case "VEHICLE_PICKUP":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <KeyRound className="h-3 w-3" />
            Pengambilan Unit
          </span>
        );
      case "VEHICLE_RETURN":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Car className="h-3 w-3" />
            Pengembalian Unit
          </span>
        );
      case "DOCUMENT_EXPIRY":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <FileCheck2 className="h-3 w-3" />
            Dokumen Expired
          </span>
        );
      case "MAINTENANCE_DUE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            <Wrench className="h-3 w-3" />
            Maintenance / Servis
          </span>
        );
      case "INSPECTION_SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="h-3 w-3" />
            Inspeksi Kendaraan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
            <Clock className="h-3 w-3" />
            Operasional
          </span>
        );
    }
  };

  const getCalendarPillStyle = (type: ScheduleEventType) => {
    switch (type) {
      case "CONTRACT_EXPIRY":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "VEHICLE_PICKUP":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "VEHICLE_RETURN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DOCUMENT_EXPIRY":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "MAINTENANCE_DUE":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "INSPECTION_SCHEDULED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-200";
    }
  };

  // Filter events
  const filteredEvents = events.filter((e) => {
    // Type filter
    if (selectedTypeFilter !== "ALL") {
      if (selectedTypeFilter === "HANDOVER") {
        if (e.type !== "VEHICLE_PICKUP" && e.type !== "VEHICLE_RETURN") return false;
      } else if (e.type !== selectedTypeFilter) {
        return false;
      }
    }

    // Keyword search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlate = e.plateNumber?.toLowerCase().includes(q);
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchDesc = e.description ? e.description.toLowerCase().includes(q) : false;
      const matchModel = e.vehicleModel?.toLowerCase().includes(q);
      const matchCust = e.customerName?.toLowerCase().includes(q);
      const matchVendor = e.vendorName?.toLowerCase().includes(q);
      const matchLoc = e.location?.toLowerCase().includes(q);
      return matchPlate || matchTitle || matchDesc || matchModel || matchCust || matchVendor || matchLoc;
    }

    return true;
  });

  // Calendar logic
  const monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  // Days in month calculation
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(8); // September 2026
  };

  const handleDateCellClick = (dateStr: string, dayEvents: ScheduleEvent[]) => {
    setSelectedDateEvents({
      dateStr,
      events: dayEvents,
    });
    setIsDateModalOpen(true);
  };

  // Group events by date string
  const eventsByDate = React.useMemo(() => {
    const map: { [dateStr: string]: ScheduleEvent[] } = {};
    for (const ev of filteredEvents) {
      if (!map[ev.date]) {
        map[ev.date] = [];
      }
      map[ev.date].push(ev);
    }
    return map;
  }, [filteredEvents]);

  // Simulated Today date
  const todayStr = "2026-09-03";

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              Master Schedule Operasional (Jadwal Terpadu)
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
              {filteredEvents.length} Agenda
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">
            Pusat pemantauan seluruh jadwal bisnis Jaja Rent: kontrak sewa habis, serah terima & pengembalian unit, masa berlaku STNK/KIR, jadwal masuk bengkel, dan inspeksi QC.
          </p>
        </div>

        {/* View Mode Toggle: List vs Monthly Calendar */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Tampilan List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-neutral-900 shadow-xs font-bold"
                  : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Kalendar Bulanan
            </button>
          </div>
        </div>
      </div>

      {/* Inline Filters & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-neutral-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider mr-1 hidden sm:inline">
            Kategori:
          </span>
          {[
            { id: "ALL", label: "Semua Jadwal" },
            { id: "CONTRACT_EXPIRY", label: "Kontrak Habis" },
            { id: "HANDOVER", label: "Serah Terima / Return" },
            { id: "DOCUMENT_EXPIRY", label: "Dokumen Expired" },
            { id: "MAINTENANCE_DUE", label: "Maintenance" },
            { id: "INSPECTION_SCHEDULED", label: "Inspeksi" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedTypeFilter(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedTypeFilter === cat.id
                  ? "bg-neutral-900 text-white shadow-2xs font-bold"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <Input
            placeholder="Cari plat, agenda, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-xs bg-neutral-50"
          />
        </div>
      </div>

      {/* MODE 1: LIST VIEW (DEFAULT) */}
      {viewMode === "list" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-neutral-50/80">
                <TableRow className="text-xs">
                  <TableHead className="w-12 font-bold text-center">No</TableHead>
                  <TableHead className="font-bold">Tanggal & Waktu</TableHead>
                  <TableHead className="font-bold">Kategori & Agenda</TableHead>
                  <TableHead className="font-bold">Unit / Plat Nomor</TableHead>
                  <TableHead className="font-bold">Pihak Terkait / Customer</TableHead>
                  <TableHead className="font-bold">Lokasi</TableHead>
                  <TableHead className="font-bold">Keterangan</TableHead>
                  <TableHead className="text-right font-bold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-neutral-500 text-xs">
                      Tidak ada jadwal kegiatan yang sesuai dengan filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvents.map((item, idx) => {
                    const isToday = item.date === todayStr;
                    return (
                      <TableRow
                        key={item.id}
                        className={`text-xs hover:bg-neutral-50/60 ${
                          isToday ? "bg-amber-50/30" : ""
                        }`}
                      >
                        <TableCell className="text-center font-mono font-bold text-neutral-500">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <span
                              className={`font-mono font-bold block ${
                                isToday ? "text-primary font-extrabold" : "text-neutral-900"
                              }`}
                            >
                              {item.date}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {item.time || "Sepanjang Hari"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {getEventBadge(item.type)}
                              {isToday && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary text-primary-foreground uppercase">
                                  HARI INI
                                </span>
                              )}
                            </div>
                            <strong className="text-neutral-900 block text-xs">
                              {item.title}
                            </strong>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.plateNumber ? (
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-[11px] border border-neutral-200 inline-block">
                                {item.plateNumber}
                              </span>
                              {item.vehicleModel && (
                                <span className="text-[10px] text-neutral-500 block truncate max-w-[150px]">
                                  {item.vehicleModel}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-neutral-400 text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-neutral-800 block">
                            {item.customerName || item.vendorName || "Internal Jaja"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-neutral-600 text-[11px] flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-neutral-400 shrink-0" />
                            {item.location || "Jakarta"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-[11px] text-neutral-600 max-w-xs line-clamp-2">
                            {item.description || "-"}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.actionUrl ? (
                            <Link href={item.actionUrl}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs font-semibold gap-1 bg-white hover:bg-neutral-50"
                              >
                                {item.actionLabel || "Detail"}
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDateCellClick(item.date, [item])}
                              className="h-7 text-xs font-semibold"
                            >
                              Rincian
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* MODE 2: MONTHLY CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <Card className="border-neutral-200 shadow-xs">
          <CardHeader className="p-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold text-neutral-900">
                {monthNames[currentMonth]} {currentYear}
              </CardTitle>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="text-xs h-8 font-semibold bg-neutral-50"
              >
                Hari Ini (3 Sep 2026)
              </Button>
              <div className="flex items-center rounded-lg border border-neutral-200 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-neutral-200" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextMonth}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/80 text-center text-xs font-bold text-neutral-600 py-2.5">
              {daysOfWeek.map((day, idx) => (
                <div
                  key={day}
                  className={idx === 0 || idx === 6 ? "text-rose-500" : ""}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr bg-neutral-200 gap-px border-b border-neutral-200">
              {/* Previous Month trailing days */}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => {
                const dayNum = daysInPrevMonth - firstDayOfMonth + i + 1;
                return (
                  <div
                    key={`prev-${i}`}
                    className="min-h-[110px] bg-neutral-50/50 p-2 text-neutral-300 select-none opacity-60"
                  >
                    <span className="text-xs font-mono font-medium">{dayNum}</span>
                  </div>
                );
              })}

              {/* Current Month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
                  2,
                  "0"
                )}-${String(dayNum).padStart(2, "0")}`;

                const isToday = dateStr === todayStr;
                const dayEvents = eventsByDate[dateStr] || [];

                // Rules: max 3 rows visible. If >3 events, show 2 events + "+ X more" on line 3
                const hasMore = dayEvents.length > 3;
                const visibleEvents = hasMore ? dayEvents.slice(0, 2) : dayEvents.slice(0, 3);
                const moreCount = dayEvents.length - 2;

                return (
                  <div
                    key={`day-${dayNum}`}
                    onClick={() => handleDateCellClick(dateStr, dayEvents)}
                    className={`min-h-[115px] p-2 bg-white transition-all hover:bg-neutral-50/80 cursor-pointer flex flex-col justify-between group ${
                      isToday ? "bg-amber-50/40 ring-1 ring-inset ring-amber-300" : ""
                    }`}
                  >
                    {/* Date Number with Today Circle Indicator */}
                    <div className="flex items-center justify-between mb-1.5">
                      {isToday ? (
                        <div className="h-6 w-6 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {dayNum}
                        </div>
                      ) : (
                        <span className="text-xs font-mono font-semibold text-neutral-700">
                          {dayNum}
                        </span>
                      )}

                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-900">
                          {dayEvents.length} item
                        </span>
                      )}
                    </div>

                    {/* Event Rows */}
                    <div className="space-y-1 flex-1">
                      {visibleEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded border truncate font-medium leading-tight ${getCalendarPillStyle(
                            ev.type
                          )}`}
                          title={`${ev.time ? ev.time + " - " : ""}${ev.title} (${ev.plateNumber || ""})`}
                        >
                          <span className="font-bold mr-1">{ev.plateNumber ? ev.plateNumber.split(" ")[1] || ev.plateNumber : ""}</span>
                          {ev.title}
                        </div>
                      ))}

                      {/* + X more line indicator */}
                      {hasMore && (
                        <div className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-center hover:bg-neutral-200">
                          + {moreCount} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Next Month leading days */}
              {Array.from({
                length: (7 - ((firstDayOfMonth + daysInMonth) % 7)) % 7,
              }).map((_, i) => (
                <div
                  key={`next-${i}`}
                  className="min-h-[110px] bg-neutral-50/50 p-2 text-neutral-300 select-none opacity-60"
                >
                  <span className="text-xs font-mono font-medium">{i + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL POPUP: ALL EVENTS FOR CLICKED DATE */}
      <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
        <DialogContent className="max-w-md sm:max-w-xl bg-white border border-neutral-200 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Agenda Kegiatan: {selectedDateEvents?.dateStr}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500">
              Daftar seluruh jadwal dan kegiatan operasional yang tercatat pada tanggal ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-1">
            {(!selectedDateEvents?.events || selectedDateEvents.events.length === 0) ? (
              <div className="py-8 text-center text-neutral-400">
                Tidak ada agenda kegiatan yang terjadwal pada tanggal ini.
              </div>
            ) : (
              selectedDateEvents.events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getEventBadge(ev.type)}
                        {ev.time && (
                          <span className="font-mono font-bold text-[11px] text-neutral-700">
                            {ev.time} WIB
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-neutral-900 text-sm">{ev.title}</h4>
                    </div>

                    {ev.actionUrl && (
                      <Link href={ev.actionUrl}>
                        <Button
                          size="sm"
                          className="h-7 text-xs font-bold gap-1 bg-neutral-900 text-white"
                        >
                          {ev.actionLabel || "Buka"}
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  {ev.plateNumber && (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1 border-t border-neutral-200/60">
                      <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                        {ev.plateNumber}
                      </span>
                      {ev.vehicleModel && (
                        <span className="text-neutral-700 font-medium">{ev.vehicleModel}</span>
                      )}
                      {(ev.customerName || ev.vendorName) && (
                        <span className="text-neutral-500">
                          &middot; {ev.customerName || ev.vendorName}
                        </span>
                      )}
                    </div>
                  )}

                  {ev.description && (
                    <p className="text-neutral-600 text-[11px] leading-relaxed">
                      {ev.description}
                    </p>
                  )}

                  {ev.location && (
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                      <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter className="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">
              Total {selectedDateEvents?.events?.length || 0} agenda
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDateModalOpen(false)}
              className="text-xs"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
