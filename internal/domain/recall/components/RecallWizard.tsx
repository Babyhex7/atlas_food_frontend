"use client";

import { useParams, useRouter } from "next/navigation";
import { Step1SelectMeal } from "./Step1SelectMeal";
import { Step2AddFood } from "./Step2AddFood";
import { Step3Portion } from "./Step3Portion";
import { Step4Additional } from "./Step4Additional";
import { Step5Review } from "./Step5Review";
import { Step6Result } from "./Step6Result";
import { useRecallSession } from "../hooks/useRecallSession";
import { getRecallSession } from "../services/recallStorage";
import type { RecallSession, RecallStep } from "../types/recall";

const STEP_LABELS: Record<RecallStep, string> = {
  select_meal: "Select Meal",
  add_food: "Add Food",
  portion: "Estimation Portion",
  additional: "Additional Details",
  review: "Review",
  done: "Result",
};

const SIDEBAR_STEPS: RecallStep[] = [
  "select_meal",
  "add_food",
  "portion",
  "additional",
  "review",
];

const STEP_NUMBERS: Record<RecallStep, number> = {
  select_meal: 1,
  add_food: 2,
  portion: 3,
  additional: 4,
  review: 5,
  done: 6,
};

const DEFAULT_MEAL_ICONS: Record<string, string> = {
  Breakfast: "🍳",
  "Morning Snack": "🍎",
  Lunch: "🍱",
  "Afternoon Snack": "☕",
  Dinner: "🍽️",
  "Evening Snack": "🌙",
  Sarapan: "🍳",
  "Makan Siang": "🍱",
  "Makan Malam": "🍽️",
  Snack: "🍎",
};

function mealOptionsFromSession(session: RecallSession) {
  if (session.available_meals?.length) {
    return session.available_meals.map((m) => ({
      name: m.name,
      icon: DEFAULT_MEAL_ICONS[m.name] ?? "🍽️",
    }));
  }
  return undefined;
}

export function RecallWizard() {
  const params = useParams();
  const router = useRouter();
  const accessToken = Array.isArray(params.accessToken)
    ? params.accessToken[0]
    : params.accessToken ?? "";

  const storedSession = getRecallSession();
  const surveyId = storedSession?.survey_id ?? "";

  const {
    session,
    stepProgress,
    stepIndex,
    totalSteps,
    nextStep,
    prevStep,
    goToStep,
    setMealType,
    setMealTime,
    addFood,
    removeFood,
    addMissingFood,
    setPortion,
    setPortionFoodIndex,
    setAdditionals,
    currentMealFoods,
    currentPortionFood,
    reset,
  } = useRecallSession(surveyId, accessToken, storedSession);

  const mealOptions = mealOptionsFromSession(session);

  const currentStep = session.current_step;
  const foods = currentMealFoods();
  const currentStepNumber = STEP_NUMBERS[currentStep];
  const isFinalStep = (currentStep as string) === "review";

  // ─── Step label for header ────────────────────────────────────────────────────
  const stepLabel = currentStep === "done"
    ? "Result"
    : `Step ${currentStepNumber} of ${totalSteps}`;

  return (
    <div className="recall-wizard">
      {/* Header */}
      <div className="wizard-header">
        <button
          type="button"
          className="wizard-back-btn"
          onClick={() => (currentStep === "select_meal" ? router.back() : prevStep())}
        >
          ← {stepLabel}
        </button>
        <button type="button" className="wizard-help-btn">?</button>
      </div>

      {/* Progress bar */}
      {currentStep !== "done" && (
        <div className="wizard-progress-bar">
          <div className="wizard-progress-bar__track">
            <div
              className="wizard-progress-bar__fill"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
          <span className="wizard-progress-label">
            {isFinalStep ? "FINAL STEP" : "PROGRESS"} — {stepProgress}% Complete
          </span>
        </div>
      )}

      <div className="wizard-body">
        {/* Sidebar */}
        {currentStep !== "done" && (
          <aside className="wizard-sidebar">
            <nav className="wizard-steps-nav">
              {SIDEBAR_STEPS.map((step) => {
                const num = STEP_NUMBERS[step];
                const isActive = currentStep === step;
                const isDone =
                  STEP_NUMBERS[currentStep] > num ||
                  ((currentStep as string) === "done" && num <= 5);
                return (
                  <div
                    key={step}
                    className={`sidebar-step${isActive ? " sidebar-step--active" : ""}${isDone ? " sidebar-step--done" : ""}`}
                  >
                    <div className="sidebar-step__num">
                      {isDone ? "✓" : num}
                    </div>
                    <span className="sidebar-step__label">{STEP_LABELS[step]}</span>
                  </div>
                );
              })}
            </nav>

            {/* Contextual tip */}
            {currentStep === "select_meal" && (
              <div className="sidebar-tip">
                <strong>Eat Mindfully</strong>
                <p>Make sure to record everything you consume to achieve the most accurate results.</p>
              </div>
            )}
            {currentStep === "add_food" && (
              <div className="sidebar-tip">
                <strong>Be Thorough</strong>
                <p>Include all side dishes, condiments, and drinks to get a complete nutritional picture.</p>
              </div>
            )}
            {currentStep === "portion" && (
              <div className="sidebar-tip">
                <strong>Makan dengan Sadar</strong>
                <p>Pastikan Anda mencatat semua yang dikonsumsi untuk hasil terbaik.</p>
              </div>
            )}
            {currentStep === "review" && (
              <div className="sidebar-tip">
                <p>Confirm your meal details to generate a comprehensive nutritional profile.</p>
              </div>
            )}
          </aside>
        )}

        {/* Main content */}
        <main className="wizard-main">
          {currentStep === "select_meal" && (
            <Step1SelectMeal
              mealType={session.current_meal.type}
              mealTime={session.current_meal.time}
              mealOptions={mealOptions}
              onMealTypeChange={setMealType}
              onMealTimeChange={setMealTime}
              onContinue={nextStep}
            />
          )}

          {currentStep === "add_food" && (
            <Step2AddFood
              mealType={session.current_meal.type || "Meal"}
              addedFoods={foods}
              onAddFood={addFood}
              onRemoveFood={removeFood}
              onAddMissing={addMissingFood}
              onContinue={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "portion" && (
            <Step3Portion
              foods={foods}
              foodIndex={session.portion_food_index}
              onPortionSelected={setPortion}
              onFoodIndexChange={setPortionFoodIndex}
              onContinue={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "additional" && (
            <Step4Additional
              foods={foods}
              onSetAdditionals={setAdditionals}
              onContinue={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === "review" && (
            <Step5Review
              session={session}
              onSubmitSuccess={() => goToStep("done")}
              onBack={prevStep}
              onEditPortions={() => goToStep("portion")}
              onAddMealTime={() => goToStep("select_meal")}
            />
          )}

          {currentStep === "done" && (
            <Step6Result
              respondentName={session.respondent_name}
              onFinish={() => {
                reset();
                router.push(`/surveys/${accessToken}/done`);
              }}
              onFillAgain={() => {
                reset();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
