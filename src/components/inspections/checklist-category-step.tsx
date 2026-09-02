"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GradeSelector } from "./grade-selector";
import { InspectionItem, InspectionGrade } from "@/lib/types/inspection";
import { calculateCategoryGrade, getGradeColor } from "@/lib/inspections/inspection-calculator";
import {
  Search,
  Camera,
  MessageSquare,
  AlertTriangle,
  Sparkles,
  X,
  Upload,
} from "lucide-react";

interface ChecklistCategoryStepProps {
  title: string;
  description: string;
  categoryIcon: React.ElementType;
  items: InspectionItem[];
  onChangeItems: (items: InspectionItem[]) => void;
}

export function ChecklistCategoryStep({
  title,
  description,
  categoryIcon: Icon,
  items,
  onChangeItems,
}: ChecklistCategoryStepProps) {
  const [search, setSearch] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"ALL" | "ISSUES" | "UNGRADED">("ALL");
  const [openNoteId, setOpenNoteId] = React.useState<string | null>(null);
  const [openPhotoId, setOpenPhotoId] = React.useState<string | null>(null);

  // Update item grade
  const handleGradeChange = (itemId: string, grade: InspectionGrade) => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, grade } : item
    );
    onChangeItems(updated);
  };

  // Update item note
  const handleNoteChange = (itemId: string, note: string) => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, note } : item
    );
    onChangeItems(updated);
  };

  // Add dummy photo to item
  const handleAddPhoto = (itemId: string) => {
    const samplePhotos = [
      "https://images.unsplash.com/photo-1600793575654-910699b5e4d4?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1597687210367-a4915552d890?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
    ];
    const randomPhoto = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];

    const updated = items.map((item) => {
      if (item.id === itemId) {
        const existing = item.photos || [];
        return { ...item, photos: [...existing, randomPhoto] };
      }
      return item;
    });
    onChangeItems(updated);
  };

  // Remove photo from item
  const handleRemovePhoto = (itemId: string, photoIdx: number) => {
    const updated = items.map((item) => {
      if (item.id === itemId && item.photos) {
        const photos = item.photos.filter((_, idx) => idx !== photoIdx);
        return { ...item, photos };
      }
      return item;
    });
    onChangeItems(updated);
  };

  // Fast Action: Mark All remaining as Grade A
  const handleMarkAllA = () => {
    const updated = items.map((item) => ({
      ...item,
      grade: item.grade || ("A" as InspectionGrade),
    }));
    onChangeItems(updated);
  };

  // Compute category grade and counts
  const categoryGrade = calculateCategoryGrade(items);
  const gradeConfig = getGradeColor(categoryGrade);
  const gradedCount = items.filter((i) => i.grade !== undefined).length;
  const issuesCount = items.filter(
    (i) => i.grade === "C" || i.grade === "D" || i.grade === "E"
  ).length;
  const ungradedCount = items.length - gradedCount;

  // Filter items
  const filteredItems = items.filter((item) => {
    const s = search.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(s) ||
      item.nameId.toLowerCase().includes(s);

    let matchesFilter = true;
    if (filterMode === "ISSUES") {
      matchesFilter = item.grade === "C" || item.grade === "D" || item.grade === "E";
    } else if (filterMode === "UNGRADED") {
      matchesFilter = item.grade === undefined;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Category Header Card */}
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-neutral-900 text-white shadow-xs shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-neutral-900">
                  {title}
                </CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-neutral-100 text-neutral-700">
                  {items.length} Komponen
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
            </div>
          </div>

          {/* Category Grade Badge + Fast Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${gradeConfig.bg} ${gradeConfig.border} ${gradeConfig.text}`}
            >
              <span>Nilai Kategori:</span>
              <span className="px-2 py-0.5 rounded-md bg-white font-bold shadow-2xs">
                Grade {categoryGrade}
              </span>
            </div>

            <button
              type="button"
              onClick={handleMarkAllA}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
              title="Isi komponen yang masih kosong dengan Grade A (Sangat Baik)"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Tandai Sisa Grade A
            </button>
          </div>
        </CardHeader>

        {/* Toolbar: Search + Filters */}
        <div className="p-3 sm:px-5 bg-neutral-50/70 border-b border-neutral-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Cari komponen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs bg-white"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filterMode === "ALL"
                  ? "bg-neutral-900 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              Semua ({items.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("ISSUES")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                filterMode === "ISSUES"
                  ? "bg-amber-600 text-white"
                  : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200"
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              Bermasalah ({issuesCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterMode("UNGRADED")}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                filterMode === "UNGRADED"
                  ? "bg-rose-600 text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              Belum Diisi ({ungradedCount})
            </button>
          </div>
        </div>

        {/* Checklist Item Cards List */}
        <CardContent className="p-3 sm:p-5 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-neutral-400 text-xs">
              Tidak ada komponen yang sesuai dengan filter pencarian.
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const hasNotes = Boolean(item.note);
              const hasPhotos = Boolean(item.photos && item.photos.length > 0);
              const isIssue = item.grade === "C" || item.grade === "D" || item.grade === "E";
              const isNoteOpen = openNoteId === item.id || hasNotes;
              const isPhotoOpen = openPhotoId === item.id || hasPhotos;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-lg border transition-all ${
                    isIssue
                      ? "bg-amber-50/30 border-amber-200/90 shadow-2xs"
                      : item.grade
                      ? "bg-white border-neutral-200/90"
                      : "bg-neutral-50/50 border-dashed border-neutral-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Component Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-neutral-400 font-semibold w-5">
                          {index + 1}.
                        </span>
                        <span className="font-bold text-xs sm:text-sm text-neutral-900">
                          {item.nameId}
                        </span>
                        <span className="text-[10px] text-neutral-400 hidden lg:inline">
                          ({item.name})
                        </span>
                      </div>
                    </div>

                    {/* Grade Selector & Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                      <GradeSelector
                        value={item.grade}
                        onChange={(g) => handleGradeChange(item.id, g)}
                        size="md"
                      />

                      {/* Note button */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenNoteId((prev) => (prev === item.id ? null : item.id))
                        }
                        className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                          hasNotes
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : "bg-white text-neutral-500 hover:text-neutral-900 border-neutral-200"
                        }`}
                        title="Tambah Catatan Pemeriksaan"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </button>

                      {/* Photo upload button */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenPhotoId((prev) => (prev === item.id ? null : item.id))
                        }
                        className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                          hasPhotos
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : "bg-white text-neutral-500 hover:text-neutral-900 border-neutral-200"
                        }`}
                        title="Upload Foto Kerusakan Komponen"
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Notes Input */}
                  {isNoteOpen && (
                    <div className="mt-2.5 pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 text-amber-600" />
                          Catatan Masalah / Kerusakan:
                        </span>
                        {!hasNotes && (
                          <button
                            type="button"
                            onClick={() => setOpenNoteId(null)}
                            className="text-[10px] text-neutral-400 hover:text-neutral-700"
                          >
                            Tutup
                          </button>
                        )}
                      </div>
                      <Textarea
                        value={item.note || ""}
                        onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        placeholder="Jelaskan kondisi detail kerusakan, baret, retak, atau kebocoran..."
                        rows={2}
                        className="text-xs bg-white"
                      />
                    </div>
                  )}

                  {/* Expandable Photos Section */}
                  {isPhotoOpen && (
                    <div className="mt-2.5 pt-2 border-t border-neutral-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                          <Camera className="h-3 w-3 text-blue-600" />
                          Foto Kerusakan Komponen ({item.photos?.length || 0}):
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddPhoto(item.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          <Upload className="h-3 w-3" />
                          Upload / Ambil Foto
                        </button>
                      </div>

                      {/* Photo Thumbnails */}
                      {item.photos && item.photos.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.photos.map((photoUrl, pIdx) => (
                            <div
                              key={pIdx}
                              className="relative group h-14 w-14 rounded-md overflow-hidden border border-neutral-200 shadow-2xs"
                            >
                              <img
                                src={photoUrl}
                                alt={`Kerusakan ${item.nameId}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(item.id, pIdx)}
                                className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div
                          onClick={() => handleAddPhoto(item.id)}
                          className="border border-dashed border-neutral-300 hover:border-neutral-400 p-2 rounded text-center text-neutral-400 text-[11px] cursor-pointer bg-white"
                        >
                          Klik untuk menambahkan foto bukti kondisi/kerusakan komponen ini
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
