import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";

export function FoodForm() {
  return (
    <form>
      <h1>Food</h1>
      <Input id="code" name="code" label="Code" required />
      <Input id="name" name="name" label="Name" required />
      <Input id="local_name" name="local_name" label="Local name" />
      <Button type="submit">Save</Button>
    </form>
  );
}
