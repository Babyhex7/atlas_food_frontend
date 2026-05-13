import { EmptyState } from "@/internal/pkg/components/EmptyState";
import type { SurveySubmission } from "../types/submission";

export function SubmissionList({ submissions = [] }: { submissions?: SurveySubmission[] }) {
  if (submissions.length === 0) return <EmptyState title="No submissions" />;

  return <ul>{submissions.map((submission) => <li key={submission.id}>{submission.respondent_name ?? submission.id}</li>)}</ul>;
}
