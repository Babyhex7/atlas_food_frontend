"use client";

import { useState } from "react";
import { submitSurvey } from "@/internal/domain/submission/services/submissionService";
import type { CreateSubmissionRequest } from "@/internal/domain/submission/types/submission";
import type { RecallSession, RecallFood, AdditionalItem } from "../types/recall";
import { calcNutrientsForPortion } from "../utils/nutrients";

interface Props {
  session: RecallSession;
  onSubmitSuccess: () => void;
  onBack: () => void;
  onEditPortions: () => void;
  onAddMealTime: () => void;
}

function buildSubmitPayload(session: RecallSession): CreateSubmissionRequest {
  let dailyEnergy = 0;
  let dailyProtein = 0;
  let dailyCarbs = 0;
  let dailyFat = 0;

  const meals_data = session.meals.map((meal) => {
    let mealEnergy = 0;
    let mealProtein = 0;
    let mealCarbs = 0;
    let mealFat = 0;

    const foods = meal.foods.map((rf) => {
      const portionGram = rf.portion?.portion_gram ?? 0;
      const nutrients = calcNutrientsForPortion(rf.detail?.nutrients, portionGram);

      mealEnergy += nutrients.energy;
      mealProtein += nutrients.protein;
      mealCarbs += nutrients.carbs;
      mealFat += nutrients.fat;

      return {
        food_id: rf.food.id,
        food_name: rf.food.name,
        portion_gram: portionGram,
        portion: rf.portion
          ? {
              ...rf.portion,
              custom_weight: rf.portion.method === "input" ? rf.portion.portion_gram : undefined,
            }
          : undefined,
        nutrients: {
          energy: nutrients.energy,
          protein: nutrients.protein,
          carbs: nutrients.carbs,
          fat: nutrients.fat,
        },
        additionals: rf.additionals ?? [],
      };
    });

    dailyEnergy += mealEnergy;
    dailyProtein += mealProtein;
    dailyCarbs += mealCarbs;
    dailyFat += mealFat;

    return {
      name: meal.name,
      time: meal.time,
      foods,
      meal_total: {
        energy: Math.round(mealEnergy * 10) / 10,
        protein: Math.round(mealProtein * 10) / 10,
        carbs: Math.round(mealCarbs * 10) / 10,
        fat: Math.round(mealFat * 10) / 10,
      },
    };
  });

  return {
    survey_id: session.survey_id,
    participant_id: session.participant_id,
    respondent_name: session.respondent_name,
    meals_data,
    daily_total: {
      energy: Math.round(dailyEnergy * 10) / 10,
      protein: Math.round(dailyProtein * 10) / 10,
      carbs: Math.round(dailyCarbs * 10) / 10,
      fat: Math.round(dailyFat * 10) / 10,
    },
    missing_foods: session.missing_foods,
  };
}

function validateSession(session: RecallSession): string | null {
  if (!session.survey_id) {
    return "Survey belum diinisialisasi. Silakan mulai ulang dari halaman join.";
  }
  const filledMeals = session.meals.filter((m) => m.foods.length > 0);
  if (filledMeals.length === 0) {
    return "Minimal 1 waktu makan harus diisi sebelum submit.";
  }
  const incomplete = filledMeals.some((m) =>
    m.foods.some((f) => !f.portion || f.portion.portion_gram <= 0)
  );
  if (incomplete) {
    return "Semua makanan harus memiliki porsi yang valid sebelum submit.";
  }
  return null;
}

export function Step5Review({
  session,
  onSubmitSuccess,
  onBack,
  onEditPortions,
  onAddMealTime,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allFoods: RecallFood[] = session.meals.flatMap((m) => m.foods);
  const allAdditionals: AdditionalItem[] = allFoods.flatMap((f) => f.additionals ?? []);
  const validationError = validateSession(session);
  const canSubmit = !validationError && allFoods.length > 0;

  const handleSubmit = async () => {
    const err = validateSession(session);
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitSurvey(buildSubmitPayload(session));
      onSubmitSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal submit. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="step-content">
      <h2 className="step-title">Review your meal</h2>
      <p className="step-subtitle">
        A detailed breakdown of your meal&apos;s nutritional content based on Clinical Vitality standards.
      </p>

      <div className="review-layout">
        <div className="review-card">
          <div className="review-card__header">
            <span className="review-card__icon">✕</span>
            <span className="review-card__title">Meal Items</span>
            <button type="button" className="btn-edit-list" onClick={onEditPortions}>
              Edit List
            </button>
          </div>

          <ul className="review-items">
            {allFoods.map((rf) => (
              <li key={rf.food.id} className="review-item">
                <div className="review-item__img-wrap">
                  {rf.food_type === "drink" ? "🥤" : "🍽️"}
                </div>
                <div className="review-item__info">
                  <span className="review-item__name">{rf.food.name}</span>
                  {rf.additionals && rf.additionals.length > 0 && (
                    <span className="review-item__additionals">
                      with {rf.additionals.map((a) => a.name.toLowerCase()).join(", ")}
                    </span>
                  )}
                </div>
                <span className="review-item__portion">
                  {rf.portion ? `${rf.portion.portion_gram}g` : "—"}
                </span>
              </li>
            ))}
          </ul>

          {allAdditionals.length > 0 && (
            <div className="review-addons">
              <span className="review-addons__title">+ Adds on</span>
              <div className="review-addons__grid">
                {allAdditionals
                  .filter((a) => a.amount_value > 0)
                  .map((a, i) => (
                    <div key={i} className="addon-tag">
                      <span className="addon-tag__name">{a.name}</span>
                      <span className="addon-tag__amount">{a.amount}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <div className="quick-actions__title">Quick Actions</div>
          <button type="button" className="quick-action-btn" onClick={onEditPortions}>
            ✏️ Edit Portions
          </button>
          <button type="button" className="quick-action-btn" onClick={onAddMealTime}>
            + Add Meal Time
          </button>

          {(error || validationError) && (
            <div className="submit-error">
              <span>⚠️</span> {error ?? validationError}
            </div>
          )}

          <button
            type="button"
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
          >
            {submitting ? "Submitting..." : "SUBMIT MEAL REPORT →"}
          </button>
        </div>
      </div>

      <p className="review-policy">
        By submitting, you agree to our Clinical Nutritional Data Policy.
      </p>

      <div className="step-nav">
        <button className="btn-back" onClick={onBack} type="button">
          ‹ Back
        </button>
      </div>
    </div>
  );
}
