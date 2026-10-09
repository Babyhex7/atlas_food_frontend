"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Loader2,
  ArrowRight,
  AlertCircle,
  Search,
  FileSpreadsheet,
  Play,
  X,
} from "lucide-react";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS, loginWithRedirect } from "@/internal/lib/layout";
import { apiClient } from "@/internal/lib/axios";
import { getAccessToken } from "@/internal/lib/cookies";
import { initRecallSession } from "@/internal/domain/recall/services/recallStorage";
import { useAuthStore } from "@/internal/domain/auth/store/authStore";
import { getApiErrorMessage } from "@/internal/pkg/utils/apiError";

type ActiveSurvey = {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at?: string;
};

type MealConfig = { name: string; time: string };

const DEFAULT_MEALS: MealConfig[] = [
  { name: "Sarapan", time: "07:00" },
  { name: "Makan Siang", time: "12:00" },
  { name: "Makan Malam", time: "19:00" },
];

function resolveAlias(user: { name?: string; email?: string; id?: string } | null | undefined): string {
  const name = user?.name?.trim();
  if (name) return name;
  const email = user?.email?.trim();
  if (email) return email.split("@")[0] || email;
  if (user?.id) return `RESP-${user.id.slice(0, 8)}`;
  return "Responden";
}

export default function SurveysHubPage() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["active-surveys"],
    queryFn: async () => {
      const { data: res } = await apiClient.get("/survey/active", { params: { page: 1, limit: 50 } });
      return res.data as { surveys: ActiveSurvey[]; total: number };
    },
  });

  const surveys = data?.surveys ?? [];

  const filteredSurveys = surveys.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  });

  const handleJoin = async (survey: ActiveSurvey) => {
    if (!getAccessToken()) {
      router.push(loginWithRedirect("/surveys"));
      return;
    }

    setJoiningId(survey.id);
    setJoinError(null);
    const alias = resolveAlias(session?.user);

    try {
      const response = await apiClient.post("/survey/access", {
        survey_id: survey.id,
        alias,
      });
      const payload = response.data.data;
      const surveyInfo = payload.survey;
      const participant = payload.participant;
      const accessToken = payload.access_token as string;

      const mealsConfig = surveyInfo.meals_config;
      const rawMeals: MealConfig[] = Array.isArray(mealsConfig)
        ? mealsConfig
        : Array.isArray(mealsConfig?.meals)
          ? mealsConfig.meals
          : DEFAULT_MEALS;
      const parsedMeals =
        rawMeals.length > 0
          ? rawMeals.map((m) => ({ name: m.name, time: m.time || "07:00" }))
          : DEFAULT_MEALS;

      initRecallSession({
        survey_id: surveyInfo.id,
        access_token: accessToken,
        participant_id: participant.id,
        respondent_name: participant.alias || alias,
        available_meals: parsedMeals,
      });

      router.push(`/surveys/${accessToken}/recall`);
    } catch (err: unknown) {
      setJoinError(getApiErrorMessage(err, "Gagal masuk survey. Pastikan Anda sudah login sebagai responden."));
      setJoiningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-primary/20">
      <AppHeader />

      <div className={`${CONTAINER_CLASS} py-8 sm:py-10 flex-1`}>
        <div className="w-full space-y-6">
          {/* Header Banner */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface p-6 sm:p-8 shadow-sm">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
                  <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                    Portal Survey Recall 24 Jam
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
                    Pilih Survey Recall Aktif
                  </h1>
                  <p className="text-sm sm:text-base text-muted mt-1 max-w-2xl">
                    Silakan login terlebih dahulu, lalu pilih kegiatan survey aktif di bawah ini untuk memulai pengisian konsumsi 24 jam.
                  </p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-80 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Cari survey aktif..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Join Error Banner */}
          {joinError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3 shadow-sm animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold">Gagal Mengakses Survey</p>
                <p className="mt-0.5">{joinError}</p>
              </div>
            </div>
          )}

          {/* Query Error Banner */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>Gagal memuat daftar survey. Pastikan Anda telah terhubung dan sudah login sebagai responden.</span>
            </div>
          )}

          {/* Survey List Section */}
          <div className="space-y-4">
            {/* Counter bar */}
            {!isLoading && !error && (
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {searchQuery ? `Hasil Pencarian (${filteredSurveys.length})` : `Daftar Survey (${surveys.length})`}
                </span>
                {searchQuery && (
                  <span className="text-xs text-muted">
                    Menampilkan {filteredSurveys.length} dari {surveys.length} survey
                  </span>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="bg-surface rounded-2xl border border-border p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted">Memuat daftar survey aktif...</p>
              </div>
            ) : filteredSurveys.length === 0 ? (
              <div className="bg-surface rounded-2xl border border-dashed border-border p-12 sm:p-16 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mb-4">
                  <FileSpreadsheet className="w-8 h-8 text-muted" />
                </div>
                <h3 className="font-bold text-foreground text-lg">
                  {searchQuery ? "Tidak Ada Survey Yang Cocok" : "Belum Ada Survey Aktif"}
                </h3>
                <p className="text-sm text-muted mt-1 max-w-md">
                  {searchQuery
                    ? `Tidak ada survey yang cocok dengan kata kunci "${searchQuery}".`
                    : "Saat ini belum ada kegiatan survey recall yang dibuka oleh admin."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 px-4 py-2 rounded-xl bg-muted/10 text-xs font-semibold text-foreground hover:bg-muted/20 transition-colors"
                  >
                    Bersihkan Pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredSurveys.map((survey, index) => {
                  const busy = joiningId === survey.id;
                  return (
                    <button
                      key={survey.id}
                      type="button"
                      disabled={Boolean(joiningId)}
                      onClick={() => handleJoin(survey)}
                      className="group w-full text-left bg-surface rounded-2xl border border-border p-5 sm:p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-5 disabled:opacity-60 disabled:cursor-wait"
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-mono font-semibold text-muted bg-muted/20 px-2 py-0.5 rounded-md">
                              #{index + 1}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Aktif
                            </span>
                          </div>
                          <h2 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                            {survey.name}
                          </h2>
                          {survey.description ? (
                            <p className="text-sm text-muted mt-1 leading-relaxed line-clamp-2">
                              {survey.description}
                            </p>
                          ) : (
                            <p className="text-xs text-muted/60 italic mt-1">Tidak ada deskripsi tambahan</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                        <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm group-hover:bg-primary-hover active:scale-[0.98] transition-all shadow-sm">
                          {busy ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Memproses…</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 fill-current" />
                              <span>Mulai Survey</span>
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </>
                          )}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
