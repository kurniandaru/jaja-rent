"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { TestDriveItem } from "@/lib/types/inspection";
import {
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Camera,
  Upload,
  X,
  MessageSquare,
} from "lucide-react";

interface TestDriveStepProps {
  items: TestDriveItem[];
  onChangeItems: (items: TestDriveItem[]) => void;
}

export function TestDriveStep({ items, onChangeItems }: TestDriveStepProps) {
  const [openPhotoId, setOpenPhotoId] = React.useState<string | null>(null);

  const handleStatusChange = (itemId: string, status: "NORMAL" | "ISSUE") => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, status } : item
    );
    onChangeItems(updated);
  };

  const handleNoteChange = (itemId: string, note: string) => {
    const updated = items.map((item) =>
      item.id === itemId ? { ...item, note } : item
    );
    onChangeItems(updated);
  };

  const handleAddPhoto = (itemId: string) => {
    const sample =
      "https://images.unsplash.com/photo-1597687210367-a4915552d890?w=600&auto=format&fit=crop&q=80";
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const existing = item.photos || [];
        return { ...item, photos: [...existing, sample] };
      }
      return item;
    });
    onChangeItems(updated);
  };

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

  const handleMarkAllNormal = () => {
    const updated = items.map((item) => ({
      ...item,
      status: "NORMAL" as const,
    }));
    onChangeItems(updated);
  };

  const issueCount = items.filter((i) => i.status === "ISSUE").length;

  return (
    <div className="space-y-4">
      <Card className="border-neutral-200/80 shadow-xs">
        <CardHeader className="p-4 sm:p-5 border-b border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-neutral-900 text-white shadow-xs shrink-0">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-neutral-900">
                  Pemeriksaan Test Drive (Uji Jalan)
                </CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-neutral-100 text-neutral-700">
                  8 Item Pemeriksaan
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Evaluasi performa dinamis mesin, transmisi, pengereman, suspensi, dan kenyamanan kemudi saat kendaraan berjalan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                issueCount > 0
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {issueCount > 0 ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Ditemukan {issueCount} Masalah</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Semua Normal</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleMarkAllNormal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer"
              title="Tandai semua poin test drive dalam kondisi Normal"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Tandai Semua Normal
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {items.map((item, index) => {
              const isIssue = item.status === "ISSUE";

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isIssue
                      ? "bg-rose-50/40 border-rose-200 shadow-xs"
                      : "bg-white border-neutral-200/80 hover:border-neutral-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-neutral-400 font-bold">
                          0{index + 1}.
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-neutral-900 leading-snug">
                          {item.nameId}
                        </h4>
                      </div>
                      <span className="text-[10px] text-neutral-400 block mt-0.5 ml-6">
                        {item.name}
                      </span>
                    </div>

                    {/* Segmented Normal vs Ada Masalah */}
                    <div className="inline-flex rounded-lg bg-neutral-100 p-1 border border-neutral-200/80 gap-1 shrink-0 select-none">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, "NORMAL")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          !isIssue
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        Normal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item.id, "ISSUE")}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          isIssue
                            ? "bg-rose-600 text-white shadow-xs"
                            : "text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        Ada Masalah
                      </button>
                    </div>
                  </div>

                  {/* Notes & Photos for issues */}
                  {isIssue && (
                    <div className="mt-3 pt-2.5 border-t border-rose-100 space-y-2">
                      <div>
                        <label className="text-[11px] font-bold text-rose-800 flex items-center gap-1 mb-1">
                          <MessageSquare className="h-3 w-3" />
                          Rincian Keluhan / Gejala Masalah:
                        </label>
                        <Textarea
                          value={item.note || ""}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                          placeholder="Jelaskan bunyi, hentakan, atau gejala ketidaknormalan saat test drive..."
                          rows={2}
                          className="text-xs bg-white border-rose-200 focus-visible:ring-rose-500"
                        />
                      </div>

                      {/* Photo evidence for test drive issue */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1">
                            <Camera className="h-3 w-3 text-rose-600" />
                            Foto Bukti Kerusakan:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddPhoto(item.id)}
                            className="text-[10px] font-bold text-rose-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Upload className="h-2.5 w-2.5" />
                            Upload Foto
                          </button>
                        </div>

                        {item.photos && item.photos.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1.5">
                            {item.photos.map((pUrl, pIdx) => (
                              <div
                                key={pIdx}
                                className="relative group h-12 w-12 rounded-md overflow-hidden border border-neutral-200"
                              >
                                <img
                                  src={pUrl}
                                  alt="Bukti Masalah"
                                  className="h-full w-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(item.id, pIdx)}
                                  className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-2 w-2" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
