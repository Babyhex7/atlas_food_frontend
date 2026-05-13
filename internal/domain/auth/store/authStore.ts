import type { AuthResponse } from "../types/auth";

export type AuthState = {
  session: AuthResponse | null;
};

export const initialAuthState: AuthState = {
  session: null,
};
