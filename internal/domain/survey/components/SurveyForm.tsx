"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { cn } from "@/internal/lib/cn";
import { getAccessToken } from "@/internal/lib/cookies";
import { getSurveyById, createSurvey, updateSurvey } from "../services/surveyService";
import { surveyStatuses, type SurveyStatus } from "../constants/surveyStatus";
import { surveyValidation } from "../schemas/surveySchema";
import type { MealConfig, CreateSurveyRequest, UpdateSurveyRequest } from "../types/survey";
import { ArrowLeft, Plus, X, CheckCircle, AlertCircle, Info } from "lucide-react";

const DEFAULT_MEALS: MealConfig[] = [
  { name: "Breakfast", time: "07:00", order: 1 },
  { name: "Lunch",     time: "12:00", order: 2 },
  { name: "Dinner",    time: "19:00", order: 3 },
];

/* Shared field container */
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-secondary">
        {label}{required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </div>
  );
}

const INPUT_CLASS =
  "w-full py-2.5 px-3 text-sm text-text-primary bg-surface border-[1.5px] border-border rounded-md outline-none font-sans transition-base box-border focus:border-primary focus:shadow-focus";

export function SurveyForm() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getAccessToken() ?? "";
  const isEdit = params?.id && params.id !== "new";
  const surveyId = isEdit ? String(params.id) : null;

  const [name,        setName]        = useState("");
  const [slug,        setSlug]        = useState("");
  const [description, setDescription] = useState("");
  const [status,      setStatus]      = useState<SurveyStatus>(surveyStatuses.draft);
  const [startDate,   setStartDate]   = useState("");
  const [endDate,     setEndDate]     = useState("");
  const [meals,       setMeals]       = useState<MealConfig[]>(DEFAULT_MEALS);
  const [error,       setError]       = useState<string | null>(null);
  const [success,     setSuccess]     = useState<string | null>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-survey", surveyId],
    queryFn: () => getSurveyById(surveyId!, token),
    enabled: Boolean(surveyId && token),
  });

  // Hidrasi form editor dari record yang dimuat server (sinkronisasi eksternal).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!existing) return;
    setName(existing.name ?? "");
    setSlug(existing.slug ?? "");
    setDescription(existing.description ?? "");
    setStatus(existing.status ?? surveyStatuses.draft);
    setStartDate(existing.start_date ?? "");
    setEndDate(existing.end_date ?? "");
    const mc = existing.meals_config;
    if (Array.isArray(mc) && mc.length > 0) setMeals(mc);
    else if (mc && typeof mc === "object" && "meals" in (mc as object)) {
      const wrapped = mc as { meals: MealConfig[] };
      setMeals(wrapped.meals ?? DEFAULT_MEALS);
    }
  }, [existing]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) setSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 100));
  };

  const addMeal    = () => setMeals((p) => [...p, { name: "", time: "12:00", order: p.length + 1 }]);
  const removeMeal = (i: number) => setMeals((p) => p.filter((_, idx) => idx !== i));
  const updateMeal = (i: number, field: keyof MealConfig, value: string | number) =>
    setMeals((p) => p.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));

  const createMutation = useMutation({
    mutationFn: (payload: CreateSurveyRequest) => createSurvey(payload, token),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-surveys"] }); setSuccess("Survey berhasil dibuat!"); setTimeout(() => router.push("/admin/surveys"), 1200); },
    onError: (err: Error) => setError(err.message),
  });
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSurveyRequest) => updateSurvey(surveyId!, payload, token),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-surveys"] }); queryClient.invalidateQueries({ queryKey: ["admin-survey", surveyId] }); setSuccess("Survey berhasil diperbarui!"); setTimeout(() => setSuccess(null), 3000); },
    onError: (err: Error) => setError(err.message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!name.trim())  { setError("Nama survey wajib diisi"); return; }
    if (!slug.trim())  { setError("Slug wajib diisi"); return; }
    if (meals.length === 0) { setError("Minimal 1 waktu makan harus dikonfigurasi"); return; }
    if (meals.some((m) => !m.name.trim())) { setError("Semua waktu makan harus memiliki nama"); return; }
    const mealsConfig = { meals: meals.map((m, i) => ({ name: m.name, time: m.time, order: i + 1 })) };
    if (isEdit) {
      updateMutation.mutate({ name: name.trim(), description: description.trim(), meals_config: mealsConfig, status, start_date: startDate || undefined, end_date: endDate || undefined });
    } else {
      createMutation.mutate({ name: name.trim(), slug: slug.trim(), description: description.trim(), meals_config: mealsConfig, status, start_date: startDate || undefined, end_date: endDate || undefined });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex flex-col gap-4 max-w-[640px]">
          {[1, 2, 3, 4].map((i) => <div key={i} className={cn("skeleton rounded-md", i === 3 ? "h-20" : "h-11")} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 px-8">
      <div className="max-w-[640px]">
        {/* Back + heading */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/surveys")}
            className="flex items-center gap-1 text-sm text-text-muted bg-transparent border-none cursor-pointer p-2 rounded-md transition-fast font-sans hover:text-text-primary hover:bg-surface-alt"
          >
            <ArrowLeft size={15} /> Kembali
          </button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary m-0">
              {isEdit ? "Edit Survey" : "Buat Survey Baru"}
            </h1>
            <p className="text-sm text-text-muted mt-1 mb-0">
              {isEdit ? "Perbarui konfigurasi survey" : "Konfigurasi survey recall gizi baru"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          <Field label="Nama Survey" required>
            <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Survey Gizi Harian Mahasiswa 2025"
              minLength={surveyValidation.name.minLength} maxLength={surveyValidation.name.maxLength} required
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="Slug" required hint="Huruf kecil, angka, dan tanda hubung. Tidak bisa diubah setelah dibuat.">
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              placeholder="survey-gizi-harian-2025"
              minLength={surveyValidation.slug.minLength} maxLength={surveyValidation.slug.maxLength}
              disabled={Boolean(isEdit)} required
              className={cn(
                INPUT_CLASS,
                "font-mono",
                isEdit && "bg-surface-alt text-text-muted cursor-not-allowed focus:border-border focus:shadow-none"
              )}
            />
          </Field>

          <Field label="Deskripsi">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan tujuan dan instruksi singkat survey ini…"
              maxLength={surveyValidation.description.maxLength} rows={3}
              className={cn(INPUT_CLASS, "resize-y min-h-[88px] leading-relaxed")}
            />
          </Field>

          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as SurveyStatus)}
              className={cn(INPUT_CLASS, "bg-no-repeat bg-position-[right_var(--space-3)_center] pr-8 cursor-pointer")}
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")" }}
            >
              {Object.values(surveyStatuses).map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Tanggal Mulai">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={INPUT_CLASS} />
            </Field>
            <Field label="Tanggal Selesai">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={INPUT_CLASS} />
            </Field>
          </div>

          {/* Meals config */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm font-medium text-text-secondary m-0">
                  Konfigurasi Waktu Makan
                </p>
                <p className="text-xs text-text-muted mt-0.5 mb-0">
                  Tentukan waktu makan yang akan direcord dalam survey ini
                </p>
              </div>
              <button type="button" onClick={addMeal}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary bg-transparent border-none cursor-pointer font-sans">
                <Plus size={14} /> Tambah
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {meals.map((meal, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg border border-border">
                  <span className="text-xs text-text-muted w-5 text-center shrink-0">{i + 1}</span>
                  <input type="text" value={meal.name} onChange={(e) => updateMeal(i, "name", e.target.value)} placeholder="Breakfast"
                    className="flex-1 py-2 px-3 text-sm border-[1.5px] border-border rounded-md outline-none bg-surface font-sans text-text-primary focus:border-primary"
                  />
                  <input type="time" value={meal.time} onChange={(e) => updateMeal(i, "time", e.target.value)}
                    className="py-2 px-3 text-sm border-[1.5px] border-border rounded-md outline-none bg-surface font-sans text-text-primary focus:border-primary"
                  />
                  {meals.length > 1 && (
                    <button type="button" onClick={() => removeMeal(i)}
                      className="flex p-1 bg-transparent border-none cursor-pointer text-text-muted rounded-sm transition-fast hover:text-danger hover:bg-danger-light"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="alert alert-danger text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success text-sm">
              <CheckCircle size={15} className="shrink-0" /> {success}
            </div>
          )}

          {isEdit && existing?.status === "active" && (
            <div className="alert alert-info text-xs">
              <Info size={14} className="shrink-0" />
              <div>
                <span className="font-semibold block mb-0.5">Cara responden ikut</span>
                <span>
                  Responden login, lalu buka menu <strong>Survey Recall</strong> dan pilih survey ini.
                  Tidak perlu bagikan link undangan.
                </span>
              </div>
            </div>
          )}

          {/* Submit row */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.push("/admin/surveys")}>
              Batal
            </Button>
            <Button type="submit" isLoading={isPending} className="flex-1">
              {isPending ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Buat Survey"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
