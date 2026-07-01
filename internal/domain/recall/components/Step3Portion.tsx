"use client";

import { useState, useEffect } from "react";
import { getFoodPublic } from "@/internal/domain/food/services/foodService";
import type { FoodDetail, PortionPhoto } from "@/internal/domain/food/types/food";
import type { RecallFood } from "../types/recall";
import type { SelectedPortion } from "@/internal/domain/portion/types/portion";

interface Props {
  foods: RecallFood[];
  foodIndex: number;
  onPortionSelected: (foodId: string, portion: SelectedPortion, detail?: FoodDetail) => void;
  onFoodIndexChange: (index: number) => void;
  onContinue: () => void;
  onBack: () => void;
}

interface PortionState {
  detail: FoodDetail | null;
  loading: boolean;
  selectedPhoto: PortionPhoto | null;
  customGram: string;
}

function calcTotalWeight(selected: PortionPhoto | null, customGram: string): number {
  if (customGram !== "") return parseFloat(customGram) || 0;
  return selected?.weight_gram ?? 0;
}

export function Step3Portion({
  foods,
  foodIndex,
  onPortionSelected,
  onFoodIndexChange,
  onContinue,
  onBack,
}: Props) {
  const [portionState, setPortionState] = useState<PortionState>({
    detail: null,
    loading: false,
    selectedPhoto: null,
    customGram: "",
  });

  const currentFood = foods[foodIndex];

  // Load food detail saat food berubah
  useEffect(() => {
    if (!currentFood) return;
    // Jika sudah punya detail, pakai langsung
    if (currentFood.detail) {
      setPortionState({
        detail: currentFood.detail,
        loading: false,
        selectedPhoto: null,
        customGram: "",
      });
      return;
    }
    setPortionState((s) => ({ ...s, loading: true }));
    getFoodPublic(currentFood.food.id)
      .then((detail) =>
        setPortionState({ detail, loading: false, selectedPhoto: null, customGram: "" })
      )
      .catch(() => setPortionState((s) => ({ ...s, loading: false })));
  }, [currentFood?.food.id]);

  const totalWeight = calcTotalWeight(portionState.selectedPhoto, portionState.customGram);
  const canConfirm = totalWeight > 0;

  const handleConfirm = () => {
    if (!currentFood || totalWeight <= 0) return;
    const portion: SelectedPortion = {
      method: portionState.customGram !== "" ? "input" : "simple_grid",
      image_id: portionState.selectedPhoto?.id,
      image_label: portionState.selectedPhoto?.label,
      base_weight: portionState.selectedPhoto?.weight_gram,
      quantity: 1,
      fraction: 0,
      total_quantity: 1,
      portion_gram: totalWeight,
    };
    onPortionSelected(currentFood.food.id, portion, portionState.detail ?? undefined);
    // Move to next food
    if (foodIndex < foods.length - 1) {
      onFoodIndexChange(foodIndex + 1);
    } else {
      onContinue();
    }
  };

  if (!currentFood) return null;

  const photos = portionState.detail?.portion_photos ?? [];

  return (
    <div className="step-content">
      <h2 className="step-title">How much did you have?</h2>
      <p className="step-subtitle">{currentFood.food.name}{currentFood.food.local_name ? ` (${currentFood.food.local_name})` : ""}</p>

      {/* Food navigator */}
      <div className="food-nav-pills">
        {foods.map((rf, i) => (
          <button
            key={rf.food.id}
            type="button"
            className={`food-pill${i === foodIndex ? " food-pill--active" : ""}${rf.portion ? " food-pill--done" : ""}`}
            onClick={() => onFoodIndexChange(i)}
          >
            {rf.portion ? "✓" : i + 1}. {rf.food.name}
          </button>
        ))}
      </div>

      {portionState.loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading portion options...</span>
        </div>
      ) : (
        <>
          {/* Portion Photo Grid */}
          {photos.length > 0 ? (
            <div className="portion-grid">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className={`portion-card${portionState.selectedPhoto?.id === photo.id ? " portion-card--active" : ""}`}
                  onClick={() =>
                    setPortionState((s) => ({
                      ...s,
                      selectedPhoto: photo,
                      customGram: "",
                    }))
                  }
                >
                  <div className="portion-card__img-wrap">
                    {photo.thumbnail_url || photo.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photo.thumbnail_url ?? photo.image_url}
                        alt={photo.label}
                        className="portion-card__img"
                      />
                    ) : (
                      <div className="portion-card__img-placeholder">🍽️</div>
                    )}
                  </div>
                  <span className="portion-card__label">{photo.label}</span>
                  {photo.description && (
                    <span className="portion-card__desc">{photo.description}</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="no-portions-hint">
              No portion photos available. Please enter weight manually below.
            </div>
          )}

          {/* Manual input */}
          <div className="custom-weight">
            <label className="custom-weight__label">Or enter weight manually (gram):</label>
            <div className="custom-weight__row">
              <input
                type="number"
                min={1}
                max={5000}
                className="custom-weight__input"
                placeholder="e.g. 150"
                value={portionState.customGram}
                onChange={(e) =>
                  setPortionState((s) => ({
                    ...s,
                    customGram: e.target.value,
                    selectedPhoto: null,
                  }))
                }
              />
              <span className="custom-weight__unit">gram</span>
            </div>
          </div>

          {/* Total Weight Display */}
          <div className="total-weight">
            <span className="total-weight__label">TOTAL WEIGHT</span>
            <span className="total-weight__value">
              {totalWeight > 0 ? `${totalWeight}g` : "—"}
            </span>
          </div>

          {/* Portion nav */}
          <div className="portion-food-nav">
            <button
              type="button"
              className="btn-prev-food"
              onClick={() => onFoodIndexChange(Math.max(0, foodIndex - 1))}
              disabled={foodIndex === 0}
            >
              ‹ Previous Food
            </button>
            <button
              type="button"
              className="btn-next-food"
              onClick={() => onFoodIndexChange(Math.min(foods.length - 1, foodIndex + 1))}
              disabled={foodIndex === foods.length - 1}
            >
              Next Food ›
            </button>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="step-nav">
        <button className="btn-back" onClick={onBack} type="button">
          ‹ Back
        </button>
        <button
          className="btn-primary"
          onClick={handleConfirm}
          disabled={!canConfirm}
          type="button"
        >
          I HAD THAT MUCH
        </button>
        <button
          className="btn-continue"
          onClick={onContinue}
          disabled={foods.some((f) => !f.portion)}
          type="button"
        >
          Continue ›
        </button>
      </div>
    </div>
  );
}
