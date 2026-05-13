import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";

export function LoginForm() {
  return (
    <form>
      <h1>Login</h1>
      <Input id="email" label="Email" name="email" type="email" required />
      <Input id="password" label="Password" name="password" type="password" required />
      <Button type="submit">Login</Button>
    </form>
  );
}
