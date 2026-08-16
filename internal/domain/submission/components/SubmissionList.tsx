"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import { AdminPagination } from "@/internal/components/admin/AdminPagination";
import { cn } from "@/internal/lib/cn";
import { useSurveySubmissions } from "../hooks/useSubmissionQueries";
import { downloadSurveyExport } from "../services/submissionService";
import type { SubmissionMeal } from "../types/submission";

const PAGE_SIZE = 20;

function NutrientBadge({ label, value, unit }: { label: string; value?: number; unit: string }) {
  if (value == null) return null;
  return (
    <span className="inline-flex flex-col items-center rounded-lg border border-border bg-surface-alt px-3 py-1 text-xs">
      <span className="font-semibold text-text-primary tabular-nums">
        {value.toFixed(1)}
        {unit}
      </span>
      <span className="text-text-muted">{label}</span>
    </span>
  );
}

/** meals_data bisa datang sebagai string JSON atau array — keduanya harus aman. */
function parseMeals(raw: unknown): SubmissionMeal[] {
  if (Array.isArray(raw)) return raw as SubmissionMeal[];
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SubmissionMeal[]) : [];
  } catch {
    return [];
  }
}

export function SubmissionList() {
  const params = useParams();
  const surveyId = String(params?.id ?? "");

  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching } = useSurveySubmissions(surveyId, page, PAGE_SIZE);
  const submissions = data?.submissions ?? [];
  const total = data?.total ?? 0;

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      await downloadSurveyExport(surveyId);
    } catch {
      setExportError("Gagal mengunduh CSV. Coba lagi atau pastikan sesi admin masih aktif.");
    } finally {
      setExporting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 px-8">
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((row) => (
            <div key={row} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 px-8">
        <EmptyState
          title="Gagal memuat submissions"
          description="Pastikan survey ID valid dan Anda login sebagai admin."
        />
      </div>
    );
  }

  return (
    <div className="p-6 px-8">
      {/* Tidak ada tombol "Kembali" di sini: breadcrumb top bar sudah memuat
          tautan ke daftar survey, dua kontrol untuk tujuan yang sama hanya
          menambah keputusan. */}
      <PageHeader
        title="Submissions"
        description={`${total} respons masuk untuk survey ini`}
        action={
          total > 0 ? (
            <Button variant="secondary" onClick={handleExport} isLoading={exporting}>
              <Download size={14} />
              Export CSV
            </Button>
          ) : undefined
        }
      />

      {exportError && (
        <div className="alert alert-danger mb-4">
          <span className="text-sm">{exportError}</span>
        </div>
      )}

      {submissions.length === 0 ? (
        <EmptyState
          title="Belum ada submission"
          description="Belum ada responden yang mengisi survey ini."
        />
      ) : (
        <>
          <div
            aria-busy={isFetching}
            className={cn("flex flex-col gap-4 transition-opacity", isFetching && "opacity-60")}
          >
            {submissions.map((sub) => {
              const meals = parseMeals(sub.meals_data);
              const totalFoods = meals.reduce((acc, meal) => acc + (meal.foods?.length ?? 0), 0);

              return (
                <div
                  key={sub.id}
                  className="rounded-xl border-[1.5px] border-border bg-surface p-5 transition-base hover:border-primary-border hover:shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text-primary">
                          {sub.respondent_name ?? "Anonim"}
                        </span>
                        {sub.respondent_email && (
                          <span className="text-xs text-text-muted">({sub.respondent_email})</span>
                        )}
                      </div>
                      <p className="m-0 text-xs text-text-muted">
                        Disubmit:{" "}
                        {new Date(sub.submitted_at ?? sub.created_at).toLocaleString("id-ID")}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-text-muted">
                        {meals.length} waktu makan · {totalFoods} makanan
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <NutrientBadge label="Energi" value={sub.total_energy ?? 0} unit=" kcal" />
                      <NutrientBadge label="Protein" value={sub.total_protein ?? 0} unit="g" />
                      <NutrientBadge label="Karb" value={sub.total_carbs ?? 0} unit="g" />
                      <NutrientBadge label="Lemak" value={sub.total_fat ?? 0} unit="g" />
                    </div>
                  </div>

                  {meals.length > 0 && (
                    <div className="mt-3 border-t border-border pt-3">
                      <div className="flex flex-wrap gap-2">
                        {meals.map((meal, index) => (
                          <span
                            key={`${sub.id}-${meal.name}-${index}`}
                            className="rounded-full bg-surface-alt px-2.5 py-1 text-xs text-text-muted"
                          >
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

          <AdminPagination
            page={page}
            limit={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            unit="respons"
          />
        </>
      )}
    </div>
  );
}
