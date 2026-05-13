import { Input } from "@/internal/pkg/components/Input";
import { surveyValidation } from "../schemas/surveySchema";

export function MealConfigFields() {
  return (
    <fieldset>
      <legend>Meal configuration</legend>
      <Input id="meal-name" label="Meal name" name="meal_name" minLength={surveyValidation.mealName.minLength} maxLength={surveyValidation.mealName.maxLength} />
      <Input id="meal-time" label="Meal time" name="meal_time" type="time" />
      <Input id="meal-order" label="Meal order" name="meal_order" type="number" />
    </fieldset>
  );
}
