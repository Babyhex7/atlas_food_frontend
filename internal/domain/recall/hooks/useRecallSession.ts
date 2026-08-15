"use client";

import { useState, useCallback } from "react";
import type {
  RecallSession,
  RecallStep,
  RecallFood,
  AdditionalItem,
  MissingFood,
} from "../types/recall";
import type { SearchFoodResult, FoodDetail } from "@/internal/domain/food/types/food";
import type { SelectedPortion } from "@/internal/domain/portion/types/portion";
import {
  saveRecallSession,
  getRecallSession,
  clearRecallSession,
} from "../services/recallStorage";

const STEP_ORDER: RecallStep[] = [
  "select_meal",
  "add_food",
  "portion",
  "additional",
  "review",
  "done",
];

const STEP_PROGRESS: Record<RecallStep, number> = {
  select_meal: 20,
  add_food: 40,
  portion: 60,
  additional: 80,
  review: 100,
  done: 100,
};

const STEP_LABELS: Record<RecallStep, string> = {
  select_meal: "Select Meal",
  add_food: "Add Food",
  portion: "Estimation Portion",
  additional: "Additional Details",
  review: "Review",
  done: "Done",
};

function createInitialSession(
  surveyId: string,
  accessToken: string
): RecallSession {
  return {
    survey_id: surveyId,
    access_token: accessToken,
    current_step: "select_meal",
    current_meal: { type: "", time: "07:00" },
    portion_food_index: 0,
    meals: [],
    missing_foods: [],
  };
}

export function useRecallSession(
  surveyId: string,
  accessToken: string,
  initialSession?: RecallSession | null
) {
  const [session, setSessionState] = useState<RecallSession>(
    () => initialSession ?? getRecallSession() ?? createInitialSession(surveyId, accessToken)
  );

  const update = useCallback((updates: Partial<RecallSession> | ((prev: RecallSession) => RecallSession)) => {
    setSessionState((prev) => {
      const next = typeof updates === "function" ? updates(prev) : { ...prev, ...updates };
      saveRecallSession(next);
      return next;
    });
  }, []);

  // ─── Step navigation ─────────────────────────────────────────────────────────
  const nextStep = useCallback(() => {
    update((prev) => {
      const idx = STEP_ORDER.indexOf(prev.current_step);
      const next = STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
      return { ...prev, current_step: next };
    });
  }, [update]);

  const prevStep = useCallback(() => {
    update((prev) => {
      const idx = STEP_ORDER.indexOf(prev.current_step);
      const next = STEP_ORDER[Math.max(idx - 1, 0)];
      return { ...prev, current_step: next };
    });
  }, [update]);

  const goToStep = useCallback((step: RecallStep) => {
    update((prev) => ({
      ...prev,
      current_step: step,
      // Masuk ke langkah porsi selalu dengan index yang masih valid. Tanpa ini,
      // lompat dari review ke portion setelah menghapus makanan bisa menunjuk
      // ke slot kosong dan step-nya tampak "tidak ada makanan".
      portion_food_index:
        step === "portion" ? clampPortionIndex(prev) : prev.portion_food_index,
    }));
  }, [update]);

  // ─── Step 1: Select Meal ─────────────────────────────────────────────────────
  const setMealType = useCallback((type: string) => {
    update((prev) => {
      if (prev.current_meal.type === type) return prev;
      const configMeal = prev.available_meals?.find((m) => m.name === type);
      return {
        ...prev,
        current_meal: {
          type,
          time: configMeal?.time ?? prev.current_meal.time,
        },
        // Ganti waktu makan = ganti daftar makanan. Index porsi milik waktu makan
        // sebelumnya tidak berlaku lagi dan harus mulai dari nol, kalau tidak
        // alur "Tambah waktu makan" dari review langsung mentok di Step 3.
        portion_food_index: 0,
      };
    });
  }, [update]);

  const setMealTime = useCallback((time: string) => {
    update((prev) => ({
      ...prev,
      current_meal: { ...prev.current_meal, time },
    }));
  }, [update]);

  // ─── Step 2: Add Food ────────────────────────────────────────────────────────
  const addFood = useCallback((food: SearchFoodResult, food_type: "food" | "drink") => {
    update((prev) => {
      // Hindari duplikat
      const currentFoods = prev.current_meal.type
        ? prev.meals.find(m => m.name === prev.current_meal.type)?.foods ?? []
        : [];
      if (currentFoods.some(f => f.food.id === food.id)) return prev;

      return {
        ...prev,
        meals: upsertMealFood(prev, { food, food_type }),
      };
    });
  }, [update]);

  const removeFood = useCallback((foodId: string) => {
    update((prev) => {
      const next: RecallSession = {
        ...prev,
        meals: prev.meals.map(m =>
          m.name === prev.current_meal.type
            ? { ...m, foods: m.foods.filter(f => f.food.id !== foodId) }
            : m
        ),
      };
      // Daftar menyusut → index porsi bisa menggantung di luar batas.
      return { ...next, portion_food_index: clampPortionIndex(next) };
    });
  }, [update]);

  const addMissingFood = useCallback((missing: MissingFood) => {
    update((prev) => {
      const name = missing.name.trim();
      if (!name) return prev;
      // Duplikat tidak menambah informasi apa pun bagi peneliti dan hanya
      // membuat daftar di review jadi berulang.
      if (prev.missing_foods.some(m => m.name.toLowerCase() === name.toLowerCase())) {
        return prev;
      }
      return { ...prev, missing_foods: [...prev.missing_foods, { ...missing, name }] };
    });
  }, [update]);

  const removeMissingFood = useCallback((name: string) => {
    update((prev) => ({
      ...prev,
      missing_foods: prev.missing_foods.filter(m => m.name !== name),
    }));
  }, [update]);

  // ─── Step 3: Portion ─────────────────────────────────────────────────────────
  const setPortion = useCallback((foodId: string, portion: SelectedPortion, detail?: FoodDetail) => {
    update((prev) => ({
      ...prev,
      meals: prev.meals.map(m =>
        m.name === prev.current_meal.type
          ? {
              ...m,
              foods: m.foods.map(f =>
                f.food.id === foodId
                  ? { ...f, portion, ...(detail ? { detail } : {}) }
                  : f
              ),
            }
          : m
      ),
    }));
  }, [update]);

  const setPortionFoodIndex = useCallback((index: number) => {
    update({ portion_food_index: index });
  }, [update]);

  // ─── Step 4: Additional ──────────────────────────────────────────────────────
  const setAdditionals = useCallback((foodId: string, additionals: AdditionalItem[]) => {
    update((prev) => ({
      ...prev,
      meals: prev.meals.map(m =>
        m.name === prev.current_meal.type
          ? {
              ...m,
              foods: m.foods.map(f =>
                f.food.id === foodId ? { ...f, additionals } : f
              ),
            }
          : m
      ),
    }));
  }, [update]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const currentMealFoods = (): RecallFood[] => {
    return session.meals.find(m => m.name === session.current_meal.type)?.foods ?? [];
  };

  const currentPortionFood = (): RecallFood | null => {
    const foods = currentMealFoods();
    return foods[session.portion_food_index] ?? null;
  };

  // ─── Step 5: Submit ──────────────────────────────────────────────────────────
  /** Simpan submission_id hasil submit — dipakai Step 6 untuk analisis AI. */
  const setSubmissionId = useCallback((submissionId: string) => {
    update({ submission_id: submissionId });
  }, [update]);

  const reset = useCallback(() => {
    setSessionState((prev) => {
      // Kosongkan data recall, tapi pertahankan identitas survey & responden.
      // participant_id dan respondent_name wajib ada saat submit berikutnya, dan
      // available_meals menentukan pilihan waktu makan dari konfigurasi admin —
      // membuang semuanya membuat alur "isi waktu makan lain" gagal submit.
      const fresh: RecallSession = {
        ...createInitialSession(prev.survey_id || surveyId, prev.access_token || accessToken),
        participant_id: prev.participant_id,
        respondent_name: prev.respondent_name,
        available_meals: prev.available_meals,
        current_meal: {
          type: prev.available_meals?.[0]?.name ?? "",
          time: prev.available_meals?.[0]?.time ?? "07:00",
        },
      };
      // Persist sesi baru: kalau hanya dihapus, refresh setelah reset membuat gate
      // di halaman recall tidak menemukan survey_id dan menendang user ke /surveys.
      clearRecallSession();
      saveRecallSession(fresh);
      return fresh;
    });
  }, [surveyId, accessToken]);

  return {
    session,
    // Step info
    stepProgress: STEP_PROGRESS[session.current_step],
    stepLabel: STEP_LABELS[session.current_step],
    stepIndex: STEP_ORDER.indexOf(session.current_step) + 1,
    totalSteps: STEP_ORDER.length - 1, // don't count 'done'
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    // Step 1
    setMealType,
    setMealTime,
    // Step 2
    addFood,
    removeFood,
    addMissingFood,
    removeMissingFood,
    // Step 3
    setPortion,
    setPortionFoodIndex,
    // Step 4
    setAdditionals,
    // Step 5
    setSubmissionId,
    // Computed
    currentMealFoods,
    currentPortionFood,
    // Reset
    reset,
    // Raw update
    update,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Index porsi harus selalu menunjuk ke makanan yang benar-benar ada di waktu
 * makan aktif. Index yang menggantung membuat Step 3 menampilkan "belum ada
 * makanan" padahal daftarnya terisi — dan alurnya buntu di situ.
 */
function clampPortionIndex(session: RecallSession): number {
  const count =
    session.meals.find(m => m.name === session.current_meal.type)?.foods.length ?? 0;
  if (count === 0) return 0;
  return Math.min(Math.max(session.portion_food_index, 0), count - 1);
}

function upsertMealFood(
  session: RecallSession,
  recallFood: RecallFood
): RecallSession["meals"] {
  const mealName = session.current_meal.type;
  const existing = session.meals.find(m => m.name === mealName);

  if (existing) {
    return session.meals.map(m =>
      m.name === mealName ? { ...m, foods: [...m.foods, recallFood] } : m
    );
  }

  return [
    ...session.meals,
    {
      name: mealName,
      time: session.current_meal.time,
      foods: [recallFood],
    },
  ];
}
