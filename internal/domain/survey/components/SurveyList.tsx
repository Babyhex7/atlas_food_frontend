import { EmptyState } from "@/internal/pkg/components/EmptyState";
import type { Survey } from "../types/survey";

export function SurveyList({ surveys = [] }: { surveys?: Survey[] }) {
  if (surveys.length === 0) {
    return <EmptyState title="No surveys" description="Create a survey to start collecting food recall data." />;
  }

  return (
    <section>
      <h1>Surveys</h1>
      <ul>
        {surveys.map((survey) => (
          <li key={survey.id}>{survey.name}</li>
        ))}
      </ul>
    </section>
  );
}
