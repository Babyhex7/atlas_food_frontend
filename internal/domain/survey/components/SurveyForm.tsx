import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { surveyStatuses } from "../constants/surveyStatus";
import { surveyValidation } from "../schemas/surveySchema";

export function SurveyForm() {
  return (
    <form>
      <h1>Survey</h1>
      <Input id="name" label="Name" name="name" minLength={surveyValidation.name.minLength} maxLength={surveyValidation.name.maxLength} required />
      <Input id="slug" label="Slug" name="slug" minLength={surveyValidation.slug.minLength} maxLength={surveyValidation.slug.maxLength} />
      <label htmlFor="status">
        <span>Status</span>
        <select id="status" name="status" defaultValue={surveyStatuses.draft}>
          {Object.values(surveyStatuses).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>
      <Button type="submit">Save</Button>
    </form>
  );
}
