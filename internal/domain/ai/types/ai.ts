/**
 * Tipe domain AI — cermin dari DTO backend di
 * atlas_food_backend/internal/domain/ai/dto.go (NutritionAnalysisData).
 *
 * Isi payload berasal dari LLM (Groq), jadi tidak ada jaminan enum/array selalu
 * terisi sesuai harapan. Semua field kolektif dibuat opsional dan dinormalisasi
 * di service agar komponen tidak perlu melakukan defensive check berulang.
 */

/** Status per item analisis maupun status keseluruhan. */
export type NutritionStatus = "good" | "warning" | "danger" | "unknown";

export type NutritionAnalysisItem = {
  label: string;
  status: string;
  description: string;
};

export type HealthInsight = {
  title: string;
  description: string;
};

export type NutritionAnalysisData = {
  overall_status: string;
  overall_message: string;
  nutritional_analysis: NutritionAnalysisItem[];
  ai_recommendation: string;
  recommended_foods: string[];
  health_insight: HealthInsight;
  suggested_activities: string[];
};

/** Hasil lengkap: `source` menandai apakah data baru dari Groq atau dari cache. */
export type NutritionAnalysisResult = {
  source: "groq" | "cache" | "unknown";
  data: NutritionAnalysisData;
};

export type NutritionAnalysisRequest = {
  submission_id: string;
};

/**
 * Petakan status bebas dari LLM ke enum yang dikenal UI.
 * Nilai di luar daftar jatuh ke "unknown" supaya tampilan tetap netral dan
 * tidak pernah kehilangan style karena nilai tak terduga.
 */
export function normalizeStatus(raw: string | undefined): NutritionStatus {
  const value = (raw ?? "").trim().toLowerCase();

  if (["good", "baik", "optimal", "normal", "healthy", "sehat", "cukup"].includes(value)) {
    return "good";
  }
  if (["warning", "waspada", "perhatian", "moderate", "sedang", "kurang", "low"].includes(value)) {
    return "warning";
  }
  if (["danger", "bahaya", "buruk", "poor", "high", "berlebih", "excess"].includes(value)) {
    return "danger";
  }
  return "unknown";
}
