import { apiClient } from "@/internal/lib/axios";
import type {
  NutritionAnalysisData,
  NutritionAnalysisItem,
  NutritionAnalysisResult,
} from "../types/ai";

/**
 * Groq perlu waktu jauh lebih lama dari request biasa. apiClient default-nya
 * timeout 10 detik — tanpa override ini permintaan analisis praktis selalu
 * gagal sebelum jawaban model sempat kembali.
 */
const AI_TIMEOUT_MS = 60_000;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
}

function asAnalysisItems(value: unknown): NutritionAnalysisItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is Record<string, unknown> => typeof v === "object" && v !== null)
    .map((v) => ({
      label: typeof v.label === "string" ? v.label : "",
      status: typeof v.status === "string" ? v.status : "",
      description: typeof v.description === "string" ? v.description : "",
    }))
    .filter((item) => item.label !== "" || item.description !== "");
}

/**
 * Normalisasi payload LLM ke bentuk yang stabil.
 *
 * Isi `data` dihasilkan model bahasa, jadi field bisa hilang, bertipe salah,
 * atau berisi null. Semua dibereskan di sini supaya komponen bisa langsung
 * me-map array tanpa optional chaining di mana-mana.
 */
function normalizeAnalysisData(raw: unknown): NutritionAnalysisData {
  const data = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const insight = (
    typeof data.health_insight === "object" && data.health_insight !== null
      ? data.health_insight
      : {}
  ) as Record<string, unknown>;

  return {
    overall_status: typeof data.overall_status === "string" ? data.overall_status : "",
    overall_message: typeof data.overall_message === "string" ? data.overall_message : "",
    nutritional_analysis: asAnalysisItems(data.nutritional_analysis),
    ai_recommendation: typeof data.ai_recommendation === "string" ? data.ai_recommendation : "",
    recommended_foods: asStringArray(data.recommended_foods),
    health_insight: {
      title: typeof insight.title === "string" ? insight.title : "",
      description: typeof insight.description === "string" ? insight.description : "",
    },
    suggested_activities: asStringArray(data.suggested_activities),
  };
}

/**
 * analyzeNutrition — POST /api/v1/ai/nutrition-analysis
 *
 * Catatan bentuk response: handler backend mengirim `{ status, source, data }`,
 * dengan `source` sebagai saudara `data` — bukan di dalamnya. Pola ini berbeda
 * dari endpoint lain, jadi unwrap-nya tidak bisa mengandalkan `data.data` saja.
 */
export async function analyzeNutrition(submissionId: string): Promise<NutritionAnalysisResult> {
  const response = await apiClient.post(
    "/ai/nutrition-analysis",
    { submission_id: submissionId },
    { timeout: AI_TIMEOUT_MS }
  );

  const body = response.data ?? {};
  const source = body.source === "groq" || body.source === "cache" ? body.source : "unknown";

  return {
    source,
    data: normalizeAnalysisData(body.data),
  };
}
