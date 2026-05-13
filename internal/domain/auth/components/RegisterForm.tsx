import { Button } from "@/internal/pkg/components/Button";
import { Input } from "@/internal/pkg/components/Input";
import { authValidation } from "../schemas/authSchema";

export function RegisterForm() {
  return (
    <form>
      <h1>Register</h1>
      <Input id="name" label="Name" name="name" minLength={authValidation.name.minLength} maxLength={authValidation.name.maxLength} required />
      <Input id="email" label="Email" name="email" type="email" required />
      <Input id="password" label="Password" name="password" type="password" minLength={authValidation.password.minLength} required />
      <Button type="submit">Register</Button>
    </form>
  );
}
