import type { Survey } from "../types/survey";

export function PublicSurvey({ survey }: { survey?: Survey }) {
  return (
    <section>
      <h1>{survey?.name ?? "Public survey"}</h1>
      {survey?.description ? <p>{survey.description}</p> : null}
    </section>
  );
}
