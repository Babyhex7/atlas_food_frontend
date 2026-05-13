import type { SubmissionMeal } from "../types/submission";

export function SubmissionReview({ meals = [] }: { meals?: SubmissionMeal[] }) {
  return (
    <section>
      <h1>Review submission</h1>
      {meals.map((meal) => <article key={`${meal.name}-${meal.time}`}><h2>{meal.name}</h2><p>{meal.foods.length} foods</p></article>)}
    </section>
  );
}
