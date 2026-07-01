"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { getSurveySubmissions, getSurveyExportUrl } from "../services/submissionService";
import type { SurveySubmission } from "../types/submission";

function NutrientBadge({ label, value, unit }: { label: string; value?: number; unit: string }) {
  if (value == null) return null;
  return (
    <span className="inline-flex flex-col items-center px-3 py-1 bg-gray-50 border border-border rounded-lg text-xs">
      <span className="font-semibold text-foreground">{value.toFixed(1)}{unit}</span>
      <span className="text-muted">{label}</span>
    </span>
  );
}

export function SubmissionList() {
  const params = useParams();
  const router = useRouter();
  const surveyId = String(params?.id ?? "");

  const { data: submissions = [], isLoading, isError } = useQuery<SurveySubmission[]>({
    queryKey: ["submissions", surveyId],
    queryFn: () => getSurveySubmissions(surveyId),
    enabled: Boolean(surveyId),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <EmptyState title="Gagal memuat submissions" description="Pastikan survey ID valid dan Anda login sebagai admin." />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/surveys")}
            className="text-muted hover:text-foreground transition-colors"
          >
            ← Kembali
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Submissions</h1>
            <p className="text-sm text-muted mt-0.5">{submissions.length} respons ditemukan</p>
          </div>
        </div>
        {submissions.length > 0 && (
          <a
            href={getSurveyExportUrl(surveyId, "csv" as never)}
            className="text-sm px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium"
          >
            ↓ Export CSV
          </a>
        )}
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          title="Belum ada submission"
          description="Belum ada responden yang mengisi survey ini."
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const meals = typeof sub.meals_data === "string"
              ? JSON.parse(sub.meals_data)
              : sub.meals_data;
            const totalFoods = Array.isArray(meals)
              ? meals.reduce((acc: number, m: { foods?: unknown[] }) => acc + (m.foods?.length ?? 0), 0)
              : 0;

            return (
              <div key={sub.id} className="bg-surface border border-border rounded-xl p-5 hover:border-primary/30 transition-all shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">
                        {sub.respondent_name ?? "Anonim"}
                      </span>
                      {sub.respondent_email && (
                        <span className="text-xs text-muted">({sub.respondent_email})</span>
                      )}
                    </div>
                    <p className="text-xs text-muted">
                      Disubmit: {new Date(sub.submitted_at ?? sub.created_at).toLocaleString("id-ID")}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {Array.isArray(meals) ? meals.length : 0} waktu makan · {totalFoods} makanan
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <NutrientBadge label="Energi" value={sub.total_energy as unknown as number} unit=" kcal" />
                    <NutrientBadge label="Protein" value={sub.total_protein as unknown as number} unit="g" />
                    <NutrientBadge label="Karb" value={sub.total_carbs as unknown as number} unit="g" />
                    <NutrientBadge label="Lemak" value={sub.total_fat as unknown as number} unit="g" />
                  </div>
                </div>

                {/* Meal breakdown */}
                {Array.isArray(meals) && meals.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex flex-wrap gap-2">
                      {meals.map((meal: { name: string; foods?: { food_name?: string }[] }, i: number) => (
                        <span key={i} className="text-xs bg-gray-100 px-2.5 py-1 rounded-full text-muted">
                          {meal.name} ({meal.foods?.length ?? 0} item)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
