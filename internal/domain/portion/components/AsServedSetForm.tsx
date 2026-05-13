import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";

export function AsServedSetForm() {
  return (
    <form>
      <h1>As served set</h1>
      <Input id="code" name="code" label="Code" required />
      <Input id="name" name="name" label="Name" required />
      <Input id="category" name="category" label="Category" />
      <Button type="submit">Save</Button>
    </form>
  );
}
