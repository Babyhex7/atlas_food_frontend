import type { NutritionMap } from "../types/nutrition";

export function NutritionSummary({ nutrients = {} }: { nutrients?: NutritionMap }) {
  return (
    <dl>
      {Object.entries(nutrients).map(([code, nutrient]) => (
        <div key={code}>
          <dt>{nutrient.name}</dt>
          <dd>{nutrient.value} {nutrient.unit}</dd>
        </div>
      ))}
    </dl>
  );
}
