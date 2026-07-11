"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ClipboardList, Loader2, ArrowRight } from "lucide-react";
import { AppHeader } from "@/internal/components/layout/AppHeader";
import { CONTAINER_CLASS } from "@/internal/lib/layout";
import { apiClient } from "@/internal/lib/axios";

type ActiveSurvey = {
  id: string;
  name: string;
  description?: string;
  access_token: string;
  status: string;
};

export default function SurveysHubPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["active-surveys"],
    queryFn: async () => {
      const { data: res } = await apiClient.get("/survey/active", { params: { page: 1, limit: 20 } });
      return res.data as { surveys: ActiveSurvey[]; total: number };
    },
  });

  const surveys = data?.surveys ?? [];

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
              <p className="text-sm text-muted">Pilih survey aktif untuk mulai mengisi recall makanan.</p>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Gagal memuat daftar survey. Pastikan Anda sudah login dan backend berjalan.
            </div>
          )}

          {!isLoading && !error && surveys.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="text-muted mb-2">Belum ada survey aktif saat ini.</p>
              <p className="text-sm text-muted">
                Gunakan link undangan dari peneliti, atau hubungi admin untuk mendapatkan akses survey.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {surveys.map((survey) => (
              <Link
                key={survey.id}
                href={`/surveys/${survey.access_token}/join`}
                className="flex items-center gap-4 p-5 rounded-xl border border-border bg-surface hover:border-primary/40 hover:shadow-md transition-all group"
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
                  Mulai
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
