"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { EmptyState } from "@/internal/pkg/components/EmptyState";
import { Button } from "@/internal/pkg/components/Button";
import { PageHeader } from "@/internal/pkg/components/PageHeader";
import { AdminPagination } from "@/internal/components/admin/AdminPagination";
import { AdminSelect } from "@/internal/components/admin/AdminToolbar";
import { cn } from "@/internal/lib/cn";
import { getAccessToken } from "@/internal/lib/cookies";
import { getSurveys } from "@/internal/domain/survey/services/surveyService";
import type { Survey } from "@/internal/domain/survey/types/survey";
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
  const searchParams = useSearchParams();
  const token = getAccessToken() ?? "";

  const { data: surveys = [] } = useQuery<Survey[]>({
    queryKey: ["admin-surveys"],
    queryFn: () => getSurveys(token),
    enabled: Boolean(token),
  });

  const urlSurveyId = String(params?.id ?? searchParams.get("survey_id") ?? "");
  const [selectedSurveyId, setSelectedSurveyId] = useState("");

  const activeSurveyId = selectedSurveyId || urlSurveyId || (surveys[0]?.id ?? "");

  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, isLoading, isError, isFetching } = useSurveySubmissions(activeSurveyId, page, PAGE_SIZE);
  const submissions = data?.submissions ?? [];
  const total = data?.total ?? 0;

  async function handleExport() {
    if (!activeSurveyId) return;
    setExportError(null);
    setExporting(true);
    try {
      await downloadSurveyExport(activeSurveyId);
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

      {surveys.length > 1 && (
        <div className="mb-6 max-w-xs">
          <AdminSelect
            label="Pilih Survey"
            value={activeSurveyId}
            onChange={(val) => {
              setSelectedSurveyId(val);
              setPage(1);
            }}
            options={surveys.map((s) => ({ value: s.id, label: s.name }))}
          />
        </div>
      )}

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
          {/* Master Data Table Submissions */}
          <div
            aria-busy={isFetching}
            className={cn("table-wrapper bg-surface shadow-xs transition-opacity", isFetching && "opacity-60")}
          >
            <table className="table">
              <thead>
                <tr>
                  <th>Responden & Email</th>
                  <th>Waktu Submit</th>
                  <th>Waktu Makan & Food Count</th>
                  <th>Total Energi</th>
                  <th>Makronutrisi (P / K / L)</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => {
                  const meals = parseMeals(sub.meals_data);
                  const totalFoods = meals.reduce((acc, meal) => acc + (meal.foods?.length ?? 0), 0);

                  return (
                    <tr key={sub.id} className="hover:bg-surface-alt transition-fast">
                      <td>
                        <div className="min-w-0">
                          <span className="font-semibold text-text-primary block truncate">
                            {sub.respondent_name ?? "Anonim"}
                          </span>
                          {sub.respondent_email && (
                            <span className="text-xs text-text-muted block truncate">
                              {sub.respondent_email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-xs text-text-muted whitespace-nowrap">
                        {new Date(sub.submitted_at ?? sub.created_at).toLocaleString("id-ID")}
                      </td>
                      <td>
                        <div className="text-xs text-text-secondary">
                          <span className="font-medium">{meals.length} waktu makan</span> · {totalFoods} makanan
                        </div>
                        {meals.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {meals.map((m, idx) => (
                              <span
                                key={`${sub.id}-${m.name}-${idx}`}
                                className="rounded bg-surface-alt px-1.5 py-0.5 text-[10px] text-text-muted"
                              >
                                {m.name} ({m.foods?.length ?? 0})
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="font-semibold text-text-primary tabular-nums">
                          {(sub.total_energy ?? 0).toFixed(0)} kcal
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5 text-xs tabular-nums">
                          <span className="badge badge-primary font-mono">{sub.total_protein?.toFixed(1) ?? "0.0"}g P</span>
                          <span className="badge badge-default font-mono">{sub.total_carbs?.toFixed(1) ?? "0.0"}g K</span>
                          <span className="badge badge-warning font-mono">{sub.total_fat?.toFixed(1) ?? "0.0"}g L</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
