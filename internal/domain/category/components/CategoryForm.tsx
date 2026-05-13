import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";

export function CategoryForm() {
  return (
    <form>
      <h1>Category</h1>
      <Input id="code" name="code" label="Code" required />
      <Input id="name" name="name" label="Name" required />
      <Input id="icon" name="icon" label="Icon" />
      <Button type="submit">Save</Button>
    </form>
  );
}
