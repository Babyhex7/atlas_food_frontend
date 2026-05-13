import { FoodStep } from "./FoodStep";
import { MealStep } from "./MealStep";
import { PortionStep } from "./PortionStep";

export function RecallWizard() {
  return (
    <main>
      <MealStep />
      <FoodStep />
      <PortionStep />
    </main>
  );
}
