"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ClipboardList, Loader2, ArrowRight, AlertCircle } from "lucide-react";
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["active-surveys"],
    queryFn: async () => {
      const { data: res } = await apiClient.get("/survey/active", { params: { page: 1, limit: 20 } });
      return res.data as { surveys: ActiveSurvey[]; total: number };
    },
  });

  const surveys = data?.surveys ?? [];

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
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className={`${CONTAINER_CLASS} py-10 flex-1`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Survey Recall 24 Jam</h1>
              <p className="text-sm text-muted">
                Login dulu, lalu pilih survey aktif — semua responden mengisi survey yang sama.
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Gagal memuat daftar survey. Pastikan Anda sudah login sebagai responden.
            </div>
          )}

          {joinError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {joinError}
            </div>
          )}

          {!isLoading && !error && surveys.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-muted mb-2">Belum ada survey aktif saat ini.</p>
              <p className="text-sm text-muted">Hubungi admin jika survey seharusnya sudah dibuka.</p>
            </div>
          )}

          <div className="space-y-3">
            {surveys.map((survey) => {
              const busy = joiningId === survey.id;
              return (
                <button
                  key={survey.id}
                  type="button"
                  disabled={Boolean(joiningId)}
                  onClick={() => handleJoin(survey)}
                  className="w-full flex items-center gap-4 p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-md transition-all group text-left disabled:opacity-60 disabled:cursor-wait"
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {survey.name}
                    </h2>
                    {survey.description && (
                      <p className="text-sm text-muted mt-1 line-clamp-2">{survey.description}</p>
                    )}
                  </div>
                  <span className="inline-flex items-center text-sm font-medium text-primary shrink-0">
                    {busy ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Masuk…
                      </>
                    ) : (
                      <>
                        Mulai
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
