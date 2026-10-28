"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/internal/lib/cn";

export interface NutrientDetailItem {
  value: number;
  unit: string;
}

interface NutritionFactsCardProps {
  nutrients: Record<string, NutrientDetailItem>;
  activePortionLabel?: string;
  activeWeightGram?: number;
}

interface NutrientMeta {
  label: string;
  category: "macro" | "vitamin" | "mineral" | "other";
  order: number;
}

const NUTRIENT_META: Record<string, NutrientMeta> = {
  energy: { label: "Energi Total", category: "macro", order: 1 },
  protein: { label: "Protein", category: "macro", order: 2 },
  fat: { label: "Lemak Total", category: "macro", order: 3 },
  carbs: { label: "Karbohidrat Total", category: "macro", order: 4 },
  fiber: { label: "Serat Pangan", category: "macro", order: 5 },

  // Vitamin
  vit_c: { label: "Vitamin C", category: "vitamin", order: 10 },
  thiamin: { label: "Tiamin (Vit. B1)", category: "vitamin", order: 11 },
  riboflavin: { label: "Riboflavin (Vit. B2)", category: "vitamin", order: 12 },
  niacin: { label: "Niasin (Vit. B3)", category: "vitamin", order: 13 },
  beta_carotene: { label: "Beta-Karoten", category: "vitamin", order: 14 },
  total_carotene: { label: "Karoten Total", category: "vitamin", order: 15 },

  // Mineral
  calcium: { label: "Kalsium", category: "mineral", order: 20 },
  phosphorus: { label: "Fosfor", category: "mineral", order: 21 },
  iron: { label: "Zat Besi", category: "mineral", order: 22 },
  sodium: { label: "Natrium", category: "mineral", order: 23 },
  potassium: { label: "Kalium", category: "mineral", order: 24 },
  copper: { label: "Tembaga", category: "mineral", order: 25 },
  zinc: { label: "Seng (Zinc)", category: "mineral", order: 26 },

  // Komposisi Lain
  water: { label: "Kadar Air", category: "other", order: 30 },
  ash: { label: "Kadar Abu", category: "other", order: 31 },
};

function formatValue(val: number): string {
  if (val === 0) return "0";
  if (val >= 100) return Math.round(val).toLocaleString("id-ID");
  if (val >= 1) return (Math.round(val * 10) / 10).toLocaleString("id-ID");
  return (Math.round(val * 100) / 100).toLocaleString("id-ID");
}

export function NutritionFactsCard({
  nutrients = {},
  activePortionLabel,
  activeWeightGram,
}: NutritionFactsCardProps) {
  const [mode, setMode] = useState<"100g" | "portion">("100g");
  const [showAllDetails, setShowAllDetails] = useState(false);

  const hasPortionWeight = activeWeightGram !== undefined && activeWeightGram > 0;
  const currentMode = hasPortionWeight ? mode : "100g";
  const multiplier = currentMode === "portion" && hasPortionWeight ? activeWeightGram / 100 : 1;

  // Ekstrak makronutrien utama
  const energy = nutrients["energy"];
  const protein = nutrients["protein"];
  const carbs = nutrients["carbs"];
  const fat = nutrients["fat"];
  const fiber = nutrients["fiber"];

  // Kelompokkan sisa mikronutrien
  const micronutrients = Object.entries(nutrients)
    .filter(([key]) => key !== "energy")
    .map(([key, item]) => {
      const meta = NUTRIENT_META[key] || {
        label: key.replace(/_/g, " "),
        category: "other" as const,
        order: 99,
      };
      return {
        key,
        rawLabel: meta.label,
        category: meta.category,
        order: meta.order,
        value: item.value * multiplier,
        unit: item.unit,
      };
    })
    .sort((a, b) => a.order - b.order);

  const totalMicroCount = micronutrients.length;

  return (
    <div className="card p-5 md:p-6 shadow-xs border border-border bg-surface flex flex-col gap-4">
      {/* Header & Basis Segmented Toggle */}
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3.5">
        <div>
          <h2 className="text-base font-bold text-text-primary m-0 tracking-tight">
            Kandungan Gizi
          </h2>
          <p className="text-xs text-text-muted m-0 mt-0.5">
            {currentMode === "portion"
              ? `Porsi ${activePortionLabel} (${activeWeightGram}g)`
              : "Standar baku per 100 gram"}
          </p>
        </div>

        {hasPortionWeight && (
          <div className="inline-flex rounded-lg bg-surface-alt p-1 border border-border text-xs shrink-0">
            <button
              type="button"
              onClick={() => setMode("100g")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-fast font-sans cursor-pointer text-xs",
                currentMode === "100g"
                  ? "bg-white text-text-primary font-semibold shadow-xs"
                  : "text-text-muted hover:text-text-primary bg-transparent"
              )}
            >
              100g Baku
            </button>
            <button
              type="button"
              onClick={() => setMode("portion")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-fast font-sans cursor-pointer text-xs",
                currentMode === "portion"
                  ? "bg-primary text-white font-semibold shadow-xs"
                  : "text-text-muted hover:text-text-primary bg-transparent"
              )}
            >
              <span>
                {activePortionLabel
                  ? `Porsi ${activePortionLabel} (${activeWeightGram}g)`
                  : `${activeWeightGram}g`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Hero Kalori (Clean Institutional Typography) */}
      {energy && (
        <div className="flex items-baseline justify-between py-2 border-b border-border">
          <div>
            <span className="text-sm font-semibold text-text-primary block">
              Energi Total
            </span>
            <span className="text-[11px] text-text-muted">
              {currentMode === "portion" ? `Per porsi (${activeWeightGram}g)` : "Per 100g pangan"}
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-primary">
              {formatValue(energy.value * multiplier)}
            </span>
            <span className="text-xs font-medium text-text-muted ml-1 font-sans">
              {energy.unit}
            </span>
          </div>
        </div>
      )}

      {/* Makronutrien Inti (4 Pilar) */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 rounded-lg border border-border bg-surface-alt/60">
          <span className="text-[11px] text-text-muted block truncate mb-1">
            Karbohidrat
          </span>
          <span className="text-base font-bold font-mono text-text-primary leading-none">
            {carbs ? formatValue(carbs.value * multiplier) : "0"}
          </span>
          <span className="text-[10px] text-text-muted ml-0.5">g</span>
        </div>

        <div className="p-2.5 rounded-lg border border-border bg-surface-alt/60">
          <span className="text-[11px] text-text-muted block truncate mb-1">
            Protein
          </span>
          <span className="text-base font-bold font-mono text-text-primary leading-none">
            {protein ? formatValue(protein.value * multiplier) : "0"}
          </span>
          <span className="text-[10px] text-text-muted ml-0.5">g</span>
        </div>

        <div className="p-2.5 rounded-lg border border-border bg-surface-alt/60">
          <span className="text-[11px] text-text-muted block truncate mb-1">
            Lemak
          </span>
          <span className="text-base font-bold font-mono text-text-primary leading-none">
            {fat ? formatValue(fat.value * multiplier) : "0"}
          </span>
          <span className="text-[10px] text-text-muted ml-0.5">g</span>
        </div>

        <div className="p-2.5 rounded-lg border border-border bg-surface-alt/60">
          <span className="text-[11px] text-text-muted block truncate mb-1">
            Serat
          </span>
          <span className="text-base font-bold font-mono text-text-primary leading-none">
            {fiber ? formatValue(fiber.value * multiplier) : "0"}
          </span>
          <span className="text-[10px] text-text-muted ml-0.5">g</span>
        </div>
      </div>

      {/* Rincian Mikronutrien & Mineral (Tabel Bersih Berkolom) */}
      {totalMicroCount > 0 && (
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="w-full flex items-center justify-between text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors p-1.5 bg-transparent border-none cursor-pointer"
          >
            <span>
              {showAllDetails
                ? "Sembunyikan Rincian Vitamin & Mineral"
                : `Rincian Vitamin & Mineral (${totalMicroCount})`}
            </span>
            {showAllDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showAllDetails && (
            <div className="mt-2.5 max-h-[300px] overflow-y-auto pr-1 flex flex-col gap-3 text-xs">
              <div className="divide-y divide-border/50 border border-border rounded-lg overflow-hidden bg-surface">
                {micronutrients.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between px-3 py-2 hover:bg-surface-alt/50 transition-colors"
                  >
                    <span className="text-text-secondary text-xs">{item.rawLabel}</span>
                    <span className="font-mono font-medium text-text-primary text-xs">
                      {formatValue(item.value)}{" "}
                      <span className="text-[11px] text-text-muted font-sans">{item.unit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
