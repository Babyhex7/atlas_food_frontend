"use client";

import { useState } from "react";
import type { RecallFood, AdditionalItem } from "../types/recall";

const COMMON_ADDITIONALS = [
  { name: "Onion", unit: "g" },
  { name: "Sugar", unit: "g" },
  { name: "Salt", unit: "mg" },
  { name: "Water", unit: "ml" },
  { name: "Oil", unit: "ml" },
  { name: "Carrots", unit: "g" },
  { name: "Butter", unit: "g" },
  { name: "Chili", unit: "g" },
  { name: "Garlic", unit: "g" },
  { name: "Soy Sauce", unit: "ml" },
  { name: "Egg", unit: "butir" },
  { name: "Cheese", unit: "g" },
];

interface Props {
  foods: RecallFood[];
  onSetAdditionals: (foodId: string, additionals: AdditionalItem[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step4Additional({ foods, onSetAdditionals, onContinue, onBack }: Props) {
  // State per food: { [foodId]: AdditionalItem[] }
  const [foodAdditionals, setFoodAdditionals] = useState<Record<string, AdditionalItem[]>>(() =>
    Object.fromEntries(foods.map((f) => [f.food.id, f.additionals ?? []]))
  );

  const addAdditional = (foodId: string, name: string, unit: string) => {
    setFoodAdditionals((prev) => {
      const existing = prev[foodId] ?? [];
      if (existing.some((a) => a.name === name)) return prev;
      return {
        ...prev,
        [foodId]: [...existing, { name, amount: `0${unit}`, amount_value: 0, unit }],
      };
    });
  };

  const updateAmount = (foodId: string, additionalName: string, value: string, unit: string) => {
    const numVal = parseFloat(value) || 0;
    setFoodAdditionals((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] ?? []).map((a) =>
        a.name === additionalName
          ? { ...a, amount: `${numVal}${unit}`, amount_value: numVal }
          : a
      ),
    }));
  };

  const removeAdditional = (foodId: string, name: string) => {
    setFoodAdditionals((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] ?? []).filter((a) => a.name !== name),
    }));
  };

  const handleContinue = () => {
    // Save additionals ke session
    foods.forEach((f) => {
      onSetAdditionals(f.food.id, foodAdditionals[f.food.id] ?? []);
    });
    onContinue();
  };

  return (
    <div className="step-content">
      <h2 className="step-title">Additional Details</h2>
      <p className="step-subtitle">
        Did you add any extra ingredients, toppings, or condiments? (Optional)
      </p>

      {foods.map((rf) => (
        <div key={rf.food.id} className="additional-food-section">
          <div className="additional-food-header">
            <span className="additional-food-icon">{rf.food_type === "drink" ? "🥤" : "🍽️"}</span>
            <span className="additional-food-name">{rf.food.name}</span>
            {rf.portion && (
              <span className="additional-food-portion">
                {rf.portion.portion_gram}g
              </span>
            )}
          </div>

          {/* Common additionals quick-add */}
          <div className="quick-add">
            <span className="quick-add__label">Quick add:</span>
            <div className="quick-add__chips">
              {COMMON_ADDITIONALS.map((a) => {
                const added = (foodAdditionals[rf.food.id] ?? []).some(
                  (fa) => fa.name === a.name
                );
                return (
                  <button
                    key={a.name}
                    type="button"
                    className={`chip${added ? " chip--active" : ""}`}
                    onClick={() =>
                      added
                        ? removeAdditional(rf.food.id, a.name)
                        : addAdditional(rf.food.id, a.name, a.unit)
                    }
                  >
                    {added ? "✓ " : "+ "}
                    {a.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Added additionals with amount input */}
          {(foodAdditionals[rf.food.id] ?? []).length > 0 && (
            <div className="additionals-list">
              {(foodAdditionals[rf.food.id] ?? []).map((a) => (
                <div key={a.name} className="additional-row">
                  <span className="additional-name">{a.name}</span>
                  <input
                    type="number"
                    min={0}
                    className="additional-input"
                    value={a.amount_value || ""}
                    placeholder="0"
                    onChange={(e) =>
                      updateAmount(rf.food.id, a.name, e.target.value, a.unit)
                    }
                  />
                  <span className="additional-unit">{a.unit}</span>
                  <button
                    type="button"
                    className="additional-remove"
                    onClick={() => removeAdditional(rf.food.id, a.name)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="step-nav">
        <button className="btn-back" onClick={onBack} type="button">
          ‹ Back
        </button>
        <button
          className="btn-skip"
          onClick={onContinue}
          type="button"
        >
          Skip
        </button>
        <button className="btn-continue" onClick={handleContinue} type="button">
          Continue ›
        </button>
      </div>
    </div>
  );
}
