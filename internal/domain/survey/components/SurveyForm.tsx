"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { getAccessToken } from "@/internal/lib/cookies";
import { getSurveyById, createSurvey, updateSurvey } from "../services/surveyService";
import { surveyStatuses } from "../constants/surveyStatus";
import { surveyValidation } from "../schemas/surveySchema";
import type { MealConfig, CreateSurveyRequest, UpdateSurveyRequest } from "../types/survey";

const DEFAULT_MEALS: MealConfig[] = [
  { name: "Breakfast", time: "07:00", order: 1 },
  { name: "Lunch", time: "12:00", order: 2 },
  { name: "Dinner", time: "19:00", order: 3 },
];

export function SurveyForm() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = getAccessToken() ?? "";
  const isEdit = params?.id && params.id !== "new";
  const surveyId = isEdit ? String(params.id) : null;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>(surveyStatuses.draft);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [meals, setMeals] = useState<MealConfig[]>(DEFAULT_MEALS);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load existing survey for edit
  const { data: existing, isLoading } = useQuery({
    queryKey: ["admin-survey", surveyId],
    queryFn: () => getSurveyById(surveyId!, token),
    enabled: Boolean(surveyId && token),
  });

  useEffect(() => {
    if (!existing) return;
    setName(existing.name ?? "");
    setSlug(existing.slug ?? "");
    setDescription(existing.description ?? "");
    setStatus(existing.status ?? surveyStatuses.draft);
    setStartDate(existing.start_date ?? "");
    setEndDate(existing.end_date ?? "");
    // meals_config could be array or {meals:[...]}
    const mc = existing.meals_config;
    if (Array.isArray(mc) && mc.length > 0) {
      setMeals(mc);
    } else if (mc && typeof mc === "object" && "meals" in (mc as object)) {
      const wrapped = mc as { meals: MealConfig[] };
      setMeals(wrapped.meals ?? DEFAULT_MEALS);
    }
  }, [existing]);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      setSlug(
        val.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-")
          .slice(0, 100)
      );
    }
  };

  // Meal management
  const addMeal = () => {
    setMeals((prev) => [
      ...prev,
      { name: "", time: "12:00", order: prev.length + 1 },
    ]);
  };

  const removeMeal = (index: number) => {
    setMeals((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMeal = (index: number, field: keyof MealConfig, value: string | number) => {
    setMeals((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  // Create
  const createMutation = useMutation({
    mutationFn: (payload: CreateSurveyRequest) => createSurvey(payload, token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      setSuccess("Survey berhasil dibuat!");
      setTimeout(() => router.push("/admin/surveys"), 1200);
    },
    onError: (err: Error) => setError(err.message),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSurveyRequest) => updateSurvey(surveyId!, payload, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      queryClient.invalidateQueries({ queryKey: ["admin-survey", surveyId] });
      setSuccess("Survey berhasil diperbarui!");
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: (err: Error) => setError(err.message),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) { setError("Nama survey wajib diisi"); return; }
    if (!slug.trim()) { setError("Slug wajib diisi"); return; }
    if (meals.length === 0) { setError("Minimal 1 waktu makan harus dikonfigurasi"); return; }
    if (meals.some((m) => !m.name.trim())) { setError("Semua waktu makan harus memiliki nama"); return; }

    // Build meals_config as { meals: [...] } to match backend DTO
    const mealsConfig = { meals: meals.map((m, i) => ({ name: m.name, time: m.time, order: i + 1 })) };

    if (isEdit) {
      const payload: UpdateSurveyRequest = {
        name: name.trim(),
        description: description.trim(),
        meals_config: mealsConfig,
        status,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };
      updateMutation.mutate(payload);
    } else {
      const payload: CreateSurveyRequest = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        meals_config: mealsConfig,
        status,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 bg-gray-100 rounded w-1/3" />
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => router.push("/admin/surveys")}
            className="text-muted hover:text-foreground transition-colors"
          >
            ← Kembali
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? "Edit Survey" : "Buat Survey Baru"}
            </h1>
            <p className="text-sm text-muted mt-0.5">
              {isEdit ? "Perbarui konfigurasi survey" : "Konfigurasi survey recall gizi baru"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Nama Survey <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Survey Gizi Harian Mahasiswa 2025"
              minLength={surveyValidation.name.minLength}
              maxLength={surveyValidation.name.maxLength}
              required
              className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="survey-gizi-harian-2025"
              minLength={surveyValidation.slug.minLength}
              maxLength={surveyValidation.slug.maxLength}
              disabled={Boolean(isEdit)}
              required
              className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-mono disabled:bg-gray-50 disabled:text-muted"
            />
            <p className="text-xs text-muted mt-1">Huruf kecil, angka, dan tanda hubung saja. Tidak bisa diubah setelah dibuat.</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Deskripsi</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan tujuan dan instruksi singkat survey ini..."
              maxLength={surveyValidation.description.maxLength}
              rows={3}
              className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            >
              {Object.values(surveyStatuses).map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Tanggal Selesai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Meals Config */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-medium">Konfigurasi Waktu Makan</label>
                <p className="text-xs text-muted mt-0.5">Tentukan waktu makan yang akan direcord dalam survey ini</p>
              </div>
              <button
                type="button"
                onClick={addMeal}
                className="text-sm text-primary hover:text-primary-600 font-medium transition-colors"
              >
                + Tambah
              </button>
            </div>
            <div className="space-y-2">
              {meals.map((meal, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                  <span className="text-muted text-xs w-5 text-center">{i + 1}</span>
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => updateMeal(i, "name", e.target.value)}
                    placeholder="Breakfast"
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <input
                    type="time"
                    value={meal.time}
                    onChange={(e) => updateMeal(i, "time", e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  {meals.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMeal(i)}
                      className="text-red-400 hover:text-red-600 transition-colors text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          {/* Access token info for edit */}
          {isEdit && existing?.access_token && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-medium text-blue-700 mb-1">Link Survei untuk Responden</p>
              <p className="text-xs text-blue-600 font-mono break-all">
                {typeof window !== "undefined" ? window.location.origin : ""}/surveys/{existing.access_token}/join
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/admin/surveys")}
              className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Batal
            </button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Survey"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
