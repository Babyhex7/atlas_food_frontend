/**
 * Tipe domain AI — cermin dari DTO backend di
 * atlas_food_backend/internal/domain/ai/dto.go.
 *
 * Pembagian tanggung jawabnya: angka, persentase, dan status dihitung server
 * secara deterministik; hanya teks naratif yang ditulis LLM. Karena itu status
 * di sini berupa enum tertutup, sedangkan teks tetap dinormalisasi di service.
 */

/** Status satu zat gizi terhadap rujukan. "unknown" untuk nilai di luar kontrak. */
export type NutrientStatus = "low" | "good" | "high" | "unknown";

/** Status keseluruhan asupan. */
export type OverallStatus = "good" | "less" | "excess" | "unknown";

export type NutritionAnalysisItem = {
  key: string;
  label: string;
  status: NutrientStatus;
  description: string;
  unit: string;
  /** null pada hasil lama yang tidak membawa angka. */
  intake: number | null;
  reference: number | null;
  percent: number | null;
};

export type HealthInsight = {
  title: string;
  description: string;
};

/** Rujukan kebutuhan harian yang dipakai server sebagai pembanding. */
export type NutritionReference = {
  label: string;
  source: string;
  /** true bila rujukan dipilih dari jenis kelamin dan usia di profil. */
  personalized: boolean;
};

/** Kelengkapan laporan yang dianalisis — dasar untuk menampilkan peringatan. */
export type AnalysisCoverage = {
  mealCount: number;
  foodCount: number;
  missingFoodCount: number;
  isPartialDay: boolean;
};

export type NutritionAnalysisData = {
  overallStatus: OverallStatus;
  overallMessage: string;
  nutritionalAnalysis: NutritionAnalysisItem[];
  recommendation: string;
  recommendedFoods: string[];
  healthInsight: HealthInsight;
  suggestedActivities: string[];
  reference: NutritionReference | null;
  coverage: AnalysisCoverage | null;
};

export type NutritionAnalysisResult = {
  /** "groq" = baru dibuat, "cache" = hasil tersimpan. */
  source: "groq" | "cache" | "unknown";
  data: NutritionAnalysisData;
  model: string;
  /** ISO timestamp; string kosong bila server tidak mengirimnya. */
  generatedAt: string;
};

/**
 * Jenis kegagalan analisis, diturunkan dari kode error backend
 * (internal/domain/ai/errors.go). UI memilih pesan dan aksi dari sini.
 */
export type AiErrorKind =
  | "not_configured"
  | "rate_limited"
  | "timeout"
  | "unavailable"
  | "invalid_response"
  | "no_nutrition_data"
  | "not_found"
  | "network"
  | "unknown";

export type AiError = {
  kind: AiErrorKind;
  message: string;
  /** false bila mencoba lagi dari sisi user tidak akan mengubah hasil. */
  retryable: boolean;
};

/**
 * Tahap tampilan panel. Satu nilai pada satu waktu, sehingga komponen cukup
 * melakukan switch tanpa menggabungkan beberapa boolean.
 */
export type AnalysisPhase =
  /** Tidak ada submission pada sesi ini. */
  | "unavailable"
  /** Laporan masih di antrean luring, belum sampai ke server. */
  | "queued"
  /** Peramban luring dan belum ada hasil yang bisa ditampilkan. */
  | "offline"
  /** Memeriksa apakah hasil sudah pernah dibuat. */
  | "checking"
  /** Siap dianalisis; belum ada hasil. */
  | "idle"
  /** Analisis pertama sedang berjalan. */
  | "analyzing"
  /** Hasil tersedia (analisis ulang, bila ada, berjalan di atasnya). */
  | "ready"
  /** Analisis gagal dan tidak ada hasil untuk ditampilkan. */
  | "error";
