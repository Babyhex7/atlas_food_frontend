"use client";

import { useMutation } from "@tanstack/react-query";
import { analyzeNutrition } from "../services/aiService";
import type { NutritionAnalysisResult } from "../types/ai";

/**
 * useNutritionAnalysis — memicu analisis gizi AI untuk satu submission.
 *
 * Dibuat sebagai mutation, bukan query, karena pemanggilannya dipicu aksi user
 * (tombol "Analisis dengan AI") dan setiap panggilan menghasilkan/mengambil
 * satu hasil untuk submission tertentu. Backend sudah men-cache hasil per
 * submission, jadi menekan tombol ulang tidak membakar kuota Groq lagi.
 */
export function useNutritionAnalysis() {
  return useMutation<NutritionAnalysisResult, Error, string>({
    mutationFn: (submissionId: string) => analyzeNutrition(submissionId),
    // Analisis gagal bukan kondisi fatal — pesannya ditampilkan dan user bisa
    // mencoba lagi, jadi tidak perlu retry otomatis yang menahan UI lebih lama.
    retry: false,
  });
}
