"use client";

import { useState } from "react";

interface MealOption {
  name: string;
  icon: string;
}

const MEAL_OPTIONS: MealOption[] = [
  { name: "Breakfast", icon: "🍳" },
  { name: "Morning Snack", icon: "🍎" },
  { name: "Lunch", icon: "🍱" },
  { name: "Afternoon Snack", icon: "☕" },
  { name: "Dinner", icon: "🍽️" },
  { name: "Evening Snack", icon: "🌙" },
];

interface Props {
  mealType: string;
  mealTime: string;
  mealOptions?: MealOption[];
  onMealTypeChange: (type: string) => void;
  onMealTimeChange: (time: string) => void;
  onContinue: () => void;
  onBack?: () => void;
}

export function Step1SelectMeal({
  mealType,
  mealTime,
  mealOptions = MEAL_OPTIONS,
  onMealTypeChange,
  onMealTimeChange,
  onContinue,
  onBack,
}: Props) {
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Parse time string "07:00" → hours & minutes
  const [hours, minutes] = mealTime.split(":").map(Number);
  const display12h = hours % 12 || 12;

  const handleHourChange = (delta: number) => {
    const newH = ((hours + delta + 24) % 24).toString().padStart(2, "0");
    onMealTimeChange(`${newH}:${String(minutes).padStart(2, "0")}`);
  };

  const handleMinuteChange = (delta: number) => {
    const newM = ((minutes + delta + 60) % 60).toString().padStart(2, "0");
    onMealTimeChange(`${String(hours).padStart(2, "0")}:${newM}`);
  };

  const canContinue = !!mealType;

  return (
    <div className="step-content">
      <h2 className="step-title">Select Meal Time</h2>
      <p className="step-subtitle">
        Please identify which meal you are recording and the specific time it occurred.
      </p>

      <div className="step-columns">
        {/* Meal Type Grid */}
        <div className="meal-type-card">
          <div className="card-label">
            <span>🍽️</span> Select Meal Type
          </div>
          <div className="meal-grid">
            {mealOptions.map((opt) => (
              <button
                key={opt.name}
                className={`meal-option${mealType === opt.name ? " meal-option--active" : ""}`}
                onClick={() => onMealTypeChange(opt.name)}
                type="button"
              >
                <span className="meal-option__icon">{opt.icon}</span>
                <span className="meal-option__name">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Time Picker */}
        <div className="time-picker-card">
          <div className="card-label">
            <span>🕐</span> Specific Time
          </div>
          <div className="time-display">
            <div className="time-col">
              <button className="time-arrow" onClick={() => handleHourChange(1)}>▲</button>
              <span className="time-digit">{String(display12h).padStart(2, "0")}</span>
              <button className="time-arrow" onClick={() => handleHourChange(-1)}>▼</button>
            </div>
            <span className="time-colon">:</span>
            <div className="time-col">
              <button className="time-arrow" onClick={() => handleMinuteChange(5)}>▲</button>
              <span className="time-digit">{String(minutes).padStart(2, "0")}</span>
              <button className="time-arrow" onClick={() => handleMinuteChange(-5)}>▼</button>
            </div>
          </div>
          <div className="time-period">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                className={`period-btn${period === p ? " period-btn--active" : ""}`}
                onClick={() => setPeriod(p)}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
          <div className="time-hint">
            <span className="hint-icon">ⓘ</span>
            Accurately recording your meal times helps us analyze your body&apos;s metabolic rhythm with greater precision.
          </div>
        </div>
      </div>

      {/* Guided Nutrition Banner */}
      <div className="guided-banner">
        <div className="guided-banner__text">
          <strong>Guided Nutrition</strong>
          <p>Each step in this survey has been designed by professional nutritionists to provide personalized recommendations.</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="step-nav">
        {onBack && (
          <button className="btn-back" onClick={onBack} type="button">
            ‹ Back
          </button>
        )}
        <button
          className="btn-continue"
          onClick={onContinue}
          disabled={!canContinue}
          type="button"
        >
          Continue ›
        </button>
      </div>
    </div>
  );
}
