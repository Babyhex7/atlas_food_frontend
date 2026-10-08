import { isAxiosError } from "axios";
import { apiClient } from "@/internal/lib/axios";
import type {
  AiError,
  AiErrorKind,
  AnalysisCoverage,
  NutrientStatus,
  NutritionAnalysisData,
  NutritionAnalysisItem,
  NutritionAnalysisResult,
  NutritionReference,
  OverallStatus,
} from "../types/ai";

/**
 * Batas waktu klien sengaja lebih panjang dari batas waktu LLM di server
 * (GROQ_TIMEOUT_SECONDS, bawaan 45 detik) supaya kegagalan dilaporkan server
 * dengan kode yang jelas, bukan diputus klien sebagai galat jaringan.
 */
const AI_TIMEOUT_MS = 60_000;

// ─── Normalisasi response ─────────────────────────────────────────────────────

type Raw = Record<string, unknown>;

function asObject(value: unknown): Raw {
  return typeof value === "object" && value !== null ? (value as Raw) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(asString).filter((v) => v !== "");
}

function asNutrientStatus(value: unknown): NutrientStatus {
  return value === "low" || value === "good" || value === "high" ? value : "unknown";
}

function asOverallStatus(value: unknown): OverallStatus {
  return value === "good" || value === "less" || value === "excess" ? value : "unknown";
}

function asAnalysisItems(value: unknown): NutritionAnalysisItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(asObject)
    .map((v) => ({
      key: asString(v.key),
      label: asString(v.label),
      status: asNutrientStatus(v.status),
      description: asString(v.description),
      unit: asString(v.unit),
      intake: asNumber(v.intake),
      reference: asNumber(v.reference),
      percent: asNumber(v.percent),
    }))
    .filter((item) => item.label !== "" || item.description !== "");
}

function asReference(value: unknown): NutritionReference | null {
  const ref = asObject(value);
  const label = asString(ref.label);
  if (label === "") return null;
  return { label, source: asString(ref.source), personalized: ref.personalized === true };
}

function asCoverage(value: unknown): AnalysisCoverage | null {
  const cov = asObject(value);
  const mealCount = asNumber(cov.meal_count);
  if (mealCount === null) return null;
  return {
    mealCount,
    foodCount: asNumber(cov.food_count) ?? 0,
    missingFoodCount: asNumber(cov.missing_food_count) ?? 0,
    isPartialDay: cov.is_partial_day === true,
  };
}

/**
 * Normalisasi payload ke bentuk yang stabil.
 *
 * Teks naratif berasal dari model bahasa dan hasil lama bisa belum membawa
 * medan baru (angka, rujukan, kelengkapan), jadi setiap medan diberi nilai
 * aman di sini agar komponen tidak perlu defensive check berulang.
 */
function normalizeAnalysisData(raw: unknown): NutritionAnalysisData {
  const data = asObject(raw);
  const insight = asObject(data.health_insight);

  return {
    overallStatus: asOverallStatus(data.overall_status),
    overallMessage: asString(data.overall_message),
    nutritionalAnalysis: asAnalysisItems(data.nutritional_analysis),
    recommendation: asString(data.ai_recommendation),
    recommendedFoods: asStringArray(data.recommended_foods),
    healthInsight: {
      title: asString(insight.title),
      description: asString(insight.description),
    },
    suggestedActivities: asStringArray(data.suggested_activities),
    reference: asReference(data.reference),
    coverage: asCoverage(data.coverage),
  };
}

/**
 * Bentuk response endpoint AI: `{ status, source, data, meta }` — `source` dan
 * `meta` adalah saudara `data`, bukan di dalamnya, berbeda dari endpoint lain.
 */
function normalizeResult(body: unknown): NutritionAnalysisResult {
  const root = asObject(body);
  const meta = asObject(root.meta);
  return {
    source: root.source === "groq" || root.source === "cache" ? root.source : "unknown",
    data: normalizeAnalysisData(root.data),
    model: asString(meta.model),
    generatedAt: asString(meta.generated_at),
  };
}

// ─── Pemetaan error ───────────────────────────────────────────────────────────

const ERROR_KIND_BY_CODE: Record<string, AiErrorKind> = {
  AI_NOT_CONFIGURED: "not_configured",
  AI_RATE_LIMITED: "rate_limited",
  AI_TIMEOUT: "timeout",
  AI_UNAVAILABLE: "unavailable",
  AI_INVALID_RESPONSE: "invalid_response",
  AI_NO_NUTRITION_DATA: "no_nutrition_data",
  NOT_FOUND: "not_found",
};

const FALLBACK_MESSAGE: Record<AiErrorKind, string> = {
  not_configured: "Layanan analisis AI belum tersedia. Hubungi pengelola survei.",
  rate_limited: "Layanan AI sedang ramai. Coba lagi dalam beberapa saat.",
  timeout: "Analisis memakan waktu terlalu lama. Silakan coba lagi.",
  unavailable: "Layanan AI sedang tidak dapat dihubungi. Silakan coba lagi.",
  invalid_response: "AI memberikan jawaban yang tidak dapat diproses. Silakan coba lagi.",
  no_nutrition_data:
    "Laporan ini belum memuat makanan dengan nilai gizi, sehingga belum dapat dianalisis.",
  not_found: "Laporan tidak ditemukan di server.",
  network: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
  unknown: "Analisis AI gagal. Silakan coba lagi.",
};

/** Kegagalan yang tidak akan berubah bila user menekan "coba lagi". */
const NON_RETRYABLE: ReadonlySet<AiErrorKind> = new Set([
  "not_configured",
  "no_nutrition_data",
  "not_found",
]);

function errorCodeOf(err: unknown): string {
  if (!isAxiosError(err)) return "";
  return asString(asObject(asObject(err.response?.data).error).code);
}

/** Ubah error apa pun menjadi AiError yang siap ditampilkan. */
export function toAiError(err: unknown): AiError {
  let kind: AiErrorKind = "unknown";
  let message = "";

  if (isAxiosError(err)) {
    if (!err.response) {
      // Tanpa response: batas waktu klien atau jaringan putus.
      kind = err.code === "ECONNABORTED" || err.code === "ETIMEDOUT" ? "timeout" : "network";
    } else {
      kind = ERROR_KIND_BY_CODE[errorCodeOf(err)] ?? "unknown";
      message = asString(asObject(asObject(err.response.data).error).message);
    }
  }

  return {
    kind,
    message: message || FALLBACK_MESSAGE[kind],
    retryable: !NON_RETRYABLE.has(kind),
  };
}

// ─── Pemanggilan API ──────────────────────────────────────────────────────────

/**
 * fetchStoredAnalysis — GET /api/v1/ai/nutrition-analysis/:submission_id
 *
 * Mengambil hasil yang sudah tersimpan tanpa pernah memicu LLM. Mengembalikan
 * `null` bila laporan belum pernah dianalisis atau belum ada di server (404) —
 * keduanya keadaan normal, bukan galat.
 */
export async function fetchStoredAnalysis(
  submissionId: string
): Promise<NutritionAnalysisResult | null> {
  try {
    const response = await apiClient.get(
      `/ai/nutrition-analysis/${encodeURIComponent(submissionId)}`
    );
    return normalizeResult(response.data);
  } catch (err) {
    if (isAxiosError(err) && err.response?.status === 404) return null;
    throw err;
  }
}

/**
 * analyzeNutrition — POST /api/v1/ai/nutrition-analysis
 *
 * `forceRefresh` meminta analisis baru meskipun hasil lama tersimpan. Server
 * memberlakukan jeda antar-analisis; di dalam jeda itu hasil lama dikembalikan
 * dengan `source: "cache"`.
 */
export async function analyzeNutrition(
  submissionId: string,
  options: { forceRefresh?: boolean } = {}
): Promise<NutritionAnalysisResult> {
  const response = await apiClient.post(
    "/ai/nutrition-analysis",
    { submission_id: submissionId, force_refresh: options.forceRefresh === true },
    { timeout: AI_TIMEOUT_MS }
  );
  return normalizeResult(response.data);
}
