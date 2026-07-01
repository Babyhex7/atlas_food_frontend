"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { searchFoodsPublic } from "@/internal/domain/food/services/foodService";
import type { SearchFoodResult } from "@/internal/domain/food/types/food";
import type { RecallFood, MissingFood } from "../types/recall";

interface Props {
  mealType: string;
  addedFoods: RecallFood[];
  onAddFood: (food: SearchFoodResult, type: "food" | "drink") => void;
  onRemoveFood: (foodId: string) => void;
  onAddMissing: (missing: MissingFood) => void;
  onContinue: () => void;
  onBack: () => void;
}

interface SearchState {
  query: string;
  results: SearchFoodResult[];
  loading: boolean;
  open: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function SearchInput({
  label,
  icon,
  placeholder,
  foodType,
  onAdd,
}: {
  label: string;
  icon: string;
  placeholder: string;
  foodType: "food" | "drink";
  onAdd: (food: SearchFoodResult, type: "food" | "drink") => void;
}) {
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    loading: false,
    open: false,
  });
  const [missingMode, setMissingMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(state.query, 300);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setState((s) => ({ ...s, open: false }));
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search API
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setState((s) => ({ ...s, results: [], open: false, loading: false }));
      setMissingMode(false);
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    searchFoodsPublic(debouncedQuery, foodType, 10)
      .then((results) => {
        setState((s) => ({ ...s, results, open: true, loading: false }));
        setMissingMode(results.length === 0);
      })
      .catch(() => setState((s) => ({ ...s, loading: false, open: false })));
  }, [debouncedQuery, foodType]);

  const handleSelect = useCallback(
    (food: SearchFoodResult) => {
      onAdd(food, foodType);
      setState({ query: "", results: [], loading: false, open: false });
      setMissingMode(false);
      inputRef.current?.focus();
    },
    [onAdd, foodType]
  );

  const handleAdd = useCallback(() => {
    if (state.results.length > 0) {
      handleSelect(state.results[0]);
    }
  }, [state.results, handleSelect]);

  return (
    <div className="search-input-group">
      <div className="search-input-label">{label}</div>
      <div className="search-input-row">
        <div className="search-input-wrapper">
          <span className="search-icon">{icon}</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={state.query}
            onChange={(e) => setState((s) => ({ ...s, query: e.target.value }))}
            onFocus={() => state.results.length > 0 && setState((s) => ({ ...s, open: true }))}
            autoComplete="off"
          />
          {state.loading && <span className="search-spinner">⏳</span>}
        </div>
        <button
          type="button"
          className="btn-add"
          onClick={handleAdd}
          disabled={state.results.length === 0}
        >
          ADD
        </button>
      </div>

      {/* Dropdown results */}
      {state.open && (
        <div ref={dropdownRef} className="search-dropdown">
          {state.results.map((food) => (
            <button
              key={food.id}
              type="button"
              className="search-result-item"
              onClick={() => handleSelect(food)}
            >
              <span className="result-icon">
                {food.category?.icon ?? (foodType === "drink" ? "🥤" : "🍽️")}
              </span>
              <span className="result-name">{food.name}</span>
              {food.local_name && (
                <span className="result-local">{food.local_name}</span>
              )}
              {food.category && (
                <span className="result-category">{food.category.name}</span>
              )}
            </button>
          ))}
          {missingMode && (
            <div className="search-missing-hint">
              <span>Not found?</span>
              <button
                type="button"
                className="btn-add-manual"
                onClick={() => {
                  onAdd(
                    {
                      id: `missing-${Date.now()}`,
                      code: "MISSING",
                      name: state.query,
                    },
                    foodType
                  );
                  setState({ query: "", results: [], loading: false, open: false });
                }}
              >
                + Add &quot;{state.query}&quot; manually
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Step2AddFood({
  mealType,
  addedFoods,
  onAddFood,
  onRemoveFood,
  onContinue,
  onBack,
}: Props) {
  const canContinue = addedFoods.length > 0;

  return (
    <div className="step-content">
      <h2 className="step-title">What did you have for {mealType}?</h2>
      <p className="step-subtitle">
        Search and add everything you consumed this{" "}
        {mealType.toLowerCase().includes("snack") ? "snack" : "meal"}.
      </p>

      {/* Warning */}
      <div className="info-banner">
        <span className="info-icon">ⓘ</span>
        Please record each food component separately (for example, if you had Fried Rice, also enter
        any toppings or side items such as egg, crackers, cucumber, etc.) to ensure more accurate
        nutrition calculations.
      </div>

      {/* Food Search */}
      <SearchInput
        label="ADD FOODS"
        icon="🔍"
        placeholder="Search foods (e.g. Nasi Goreng, Ayam Goreng, Bubur Ayam...)"
        foodType="food"
        onAdd={onAddFood}
      />

      {/* Drink Search */}
      <SearchInput
        label="ADD DRINKS"
        icon="🥤"
        placeholder="Search drinks (e.g. Es Teh, Kopi Susu, Jus Jeruk...)"
        foodType="drink"
        onAdd={onAddFood}
      />

      {/* Added Items */}
      {addedFoods.length > 0 && (
        <div className="added-items">
          <div className="added-items__header">
            <span className="added-items__title">Added Items</span>
            <span className="added-items__count">{addedFoods.length} item{addedFoods.length > 1 ? "s" : ""}</span>
          </div>
          <div className="added-items__hint">
            <span className="hint-icon">ⓘ</span>
            Portion sizes and specific ingredients for these items will be adjusted in the next step.
          </div>
          <ul className="added-items__list">
            {addedFoods.map((rf) => (
              <li key={rf.food.id} className="added-item">
                <span className="added-item__icon">
                  {rf.food_type === "drink" ? "🥤" : "🍽️"}
                </span>
                <div className="added-item__info">
                  <span className="added-item__name">{rf.food.name}</span>
                  {rf.food.local_name && (
                    <span className="added-item__local">{rf.food.local_name}</span>
                  )}
                </div>
                <button
                  type="button"
                  className="added-item__remove"
                  onClick={() => onRemoveFood(rf.food.id)}
                  aria-label={`Remove ${rf.food.name}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="step-nav">
        <button className="btn-back" onClick={onBack} type="button">
          ‹ Back
        </button>
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
